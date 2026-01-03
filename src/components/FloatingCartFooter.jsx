import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../index.css";

export default function FloatingCartFooter() {
    const { cart, getTotal } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);

    const platformFee = getTotal() > 0 ? 5 : 0;
    const total = getTotal() + platformFee;

    const hideOnPages = ["/cart", "/orders", "/login", "/signup"];
    const shouldHide = hideOnPages.includes(location.pathname) || cart.length === 0;

    useEffect(() => {
        if (cart.length > 0) {
            setIsVisible(true);
            setShowAnimation(true);
            const timer = setTimeout(() => setShowAnimation(false), 600);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [cart.length]);

    if (!isVisible || shouldHide) {
        return null;
    }

    const handleClick = () => {
        navigate("/cart");
    };

    return (
        <>
            <div className={`floating-cart-footer ${showAnimation ? 'slide-up' : ''}`}>
                <div className="cart-footer-content">
                    <div className="cart-items-info">
                        <span className="cart-count">
                            <i className="fa-solid fa-shopping-bag"></i>
                            {" "}{cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="cart-amount">₹{total}</span>
                    </div>
                    <button onClick={handleClick} className="checkout-btn">
                        Proceed to Checkout
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
            <div className="cart-footer-spacer"></div>
        </>
    );
}
