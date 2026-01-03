import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../index.css";

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        if (!currentUser) {
            alert("Please login to add items to cart");
            navigate("/login");
            return;
        }

        if (product.stock) {
            addToCart(product);
        }
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                {!product.stock && (
                    <div className="out-of-stock-overlay">Out of Stock</div>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {product.size && <p className="product-size">{product.size}</p>}
                <p className="product-category">{product.category}</p>
                <div className="product-footer">
                    <span className="product-price">₹{product.price}</span>
                    <button
                        onClick={handleAddToCart}
                        className="btn-add-cart"
                        disabled={!product.stock}
                    >
                        {product.stock ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
        </div>
    );
}
