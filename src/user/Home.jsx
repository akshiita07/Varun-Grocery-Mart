import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import "../index.css";

export default function Home() {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [frequentProducts, setFrequentProducts] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = [];
                querySnapshot.forEach((doc) => {
                    productsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setProducts(productsData);

                const productCategories = [...new Set(productsData.map(p => p.category))];
                setCategories(productCategories);
            } catch (error) {
                console.error("Error loading products:", error);
            }
        };

        loadProducts();

        const interval = setInterval(loadProducts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchFrequentProducts = async () => {
        try {
            const ordersRef = collection(db, "orders");
            const q = query(
                ordersRef,
                where("userId", "==", currentUser.uid),
                where("status", "==", "delivered"),
                orderBy("createdAt", "desc"),
                limit(10)
            );

            const querySnapshot = await getDocs(q);
            const orderItems = [];

            querySnapshot.forEach((doc) => {
                const order = doc.data();
                orderItems.push(...order.items);
            });

            const productCount = {};
            orderItems.forEach(item => {
                productCount[item.id] = (productCount[item.id] || 0) + 1;
            });

            const topProductIds = Object.entries(productCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([id]) => parseInt(id));

            const frequent = products.filter(p => topProductIds.includes(p.id));
            setFrequentProducts(frequent);
        } catch (error) {
            console.error("Error fetching frequent products:", error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchFrequentProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, products]);

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="home-container">
            <div className="home-header">
                <h1>Welcome to Varun Online Grocery Store</h1>
                <p>Your neighborhood shop, now online. Open to all Savitry Tower residents.</p>
                {!currentUser && (
                    <div className="login-prompt">
                        <p className="prompt-text">Please login to add items to cart and place orders</p>
                    </div>
                )}
            </div>

            {products.length === 0 && (
                <div className="empty-products">
                    <h2>No Products Available Yet</h2>
                    <p>Our inventory is being updated. Please check back soon!</p>
                    {/* {currentUser && (
                        <p className="info-text">Admin can add products from the Inventory Management page.</p>
                    )} */}
                </div>
            )}

            {products.length > 0 && (
                <>
                    {currentUser && frequentProducts.length > 0 && (
                        <section className="frequent-section">
                            <h2>Buy Again</h2>
                            <div className="product-grid">
                                {frequentProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="categories-section">
                        <h2>Categories</h2>
                        <div className="category-tabs">
                            <button
                                className={`category-tab ${selectedCategory === "All" ? "active" : ""}`}
                                onClick={() => setSelectedCategory("All")}
                            >
                                All
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`category-tab ${selectedCategory === category ? "active" : ""}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="products-section">
                        <h2>{selectedCategory === "All" ? "All Products" : selectedCategory}</h2>
                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        {filteredProducts.length === 0 && (
                            <p className="no-products">No products in this category</p>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
