import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "../index.css";

export default function Inventory() {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories] = useState([
        "Dairy, Bread and Eggs",
        "Cold Drink and Juices",
        "Snack and Munchies",
        "Breakfast and Instant Food",
        "Sweet Tooth",
        "Bakery and Biscuits",
        "Tea, Coffee and Milk Drinks",
        "Atta, Rice and Dal",
        "Masala, Oil and More",
        "Sauces and Spreads",
        "Baby Care",
        "Cleaning Essentials",
        "Personal Care",
        "Home and Office"
    ]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        size: "",
        category: "Dairy, Bread and Eggs",
        stock: true,
        image: ""
    });

    const fetchProducts = async () => {
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
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) {
                navigate("/login");
                return;
            }

            if (userRole !== "admin") {
                alert("Access denied. Admin only.");
                navigate("/");
                return;
            }

            // Fetch products from Firestore
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
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        loadData();
    }, [currentUser, userRole, navigate]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size should be less than 2MB");
                return;
            }

            // Check file type
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleToggleStock = async (productId) => {
        try {
            const product = products.find(p => p.id === productId);
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                stock: !product.stock
            });
            // Refresh products list
            fetchProducts();
        } catch (error) {
            console.error("Error toggling stock:", error);
            alert("Failed to update stock status");
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", productId));
                alert("Product deleted successfully!");
                // Refresh products list
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product");
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            size: product.size || "",
            category: product.category,
            stock: product.stock,
            image: product.image
        });
        setShowAddForm(true);
    };

    const handleAddProduct = async () => {
        if (!formData.name || !formData.price || !formData.image) {
            alert("Please fill in all fields");
            return;
        }

        try {
            if (editingProduct) {
                // Update existing product
                const productRef = doc(db, "products", editingProduct.id);
                await updateDoc(productRef, {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    size: formData.size,
                    category: formData.category,
                    stock: formData.stock,
                    image: formData.image
                });
                alert("Product updated successfully!");
            } else {
                // Add new product
                await addDoc(collection(db, "products"), {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    size: formData.size,
                    category: formData.category,
                    stock: formData.stock,
                    image: formData.image,
                    createdAt: new Date().toISOString()
                });
                alert("Product added successfully!");
            }

            // Reset form
            setFormData({
                name: "",
                price: "",
                size: "",
                category: "Dairy, Bread and Eggs",
                stock: true,
                image: ""
            });
            setEditingProduct(null);
            setShowAddForm(false);

            // Refresh products list
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product. Please try again.");
        }
    };

    const handleCancelForm = () => {
        setFormData({
            name: "",
            price: "",
            size: "",
            category: "Dairy, Bread and Eggs",
            stock: true,
            image: ""
        });
        setEditingProduct(null);
        setShowAddForm(false);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Inventory Management</h2>
                <div className="admin-nav">
                    <Link to="/admin" className="btn-secondary">
                        Back to Dashboard
                    </Link>
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="btn-primary"
                        >
                            + Add Product
                        </button>
                    )}
                </div>
            </div>

            {showAddForm && (
                <div className="product-form">
                    <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Potato"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input
                                type="number"
                                placeholder="30"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Size</label>
                            <input
                                type="text"
                                placeholder="500ml"
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageUpload}
                                className="file-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Stock</label>
                            <label className="checkbox-inline">
                                <input
                                    type="checkbox"
                                    checked={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.checked })}
                                />
                                <span> In Stock</span>
                            </label>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleCancelForm} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleAddProduct} className="btn-primary">
                                {editingProduct ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>

                    {formData.image && (
                        <div className="image-preview-inline">
                            <img src={formData.image} alt="Preview" />
                        </div>
                    )}
                </div>
            )}

            <div className="inventory-table">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="inventory-image"
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>₹{product.price}</td>
                                <td>
                                    <button
                                        onClick={() => handleToggleStock(product.id)}
                                        className={`stock-toggle ${product.stock ? "in-stock" : "out-of-stock"}`}
                                    >
                                        {product.stock ? "✓ In Stock" : "✗ Out of Stock"}
                                    </button>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
