import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, getDoc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_URL } from "../config";
import "../index.css";

const UPI_ID = "pathakshita07-1@oksbi";

export default function Cart() {
    const { currentUser } = useAuth();
    const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [showCheckout, setShowCheckout] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [showUpiApps, setShowUpiApps] = useState(false);
    const [upiLink, setUpiLink] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setUserDetails(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            }
        };
        fetchUserDetails();
    }, [currentUser]);

    const subtotal = getTotal();
    const platformFee = subtotal > 0 ? 5 : 0;
    const total = subtotal + platformFee;

    const handleCheckout = () => {
        if (!currentUser) {
            alert("Please login to place order");
            navigate("/login");
            return;
        }
        if (cart.length === 0) {
            alert("Your cart is empty");
            return;
        }
        setShowCheckout(true);
    };

    const generateUPILink = (orderId) => {
        const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent("Varun Grocery Mart")}&am=${total}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
        return upiLink;
    };

    const placeOrder = async () => {
        if (!userDetails || !userDetails.name || !userDetails.phone || !userDetails.address) {
            alert("User details not found. Please update your profile.");
            return;
        }

        try {
            setLoading(true);

            for (const item of cart) {
                const productRef = doc(db, "products", item.id);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const productData = productSnap.data();
                    const currentStock = productData.stockCount || 0;

                    if (currentStock < item.quantity) {
                        alert(`Sorry, only ${currentStock} units of ${item.name} are available in stock.`);
                        setLoading(false);
                        return;
                    }
                }
            }

            const order = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: userDetails.name,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                subtotal,
                platformFee,
                total,
                address: userDetails.address,
                phone: userDetails.phone,
                paymentMethod,
                paymentStatus: paymentMethod === "cod" ? "pending" : "awaiting_verification",
                status: "placed",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, "orders"), order);

            for (const item of cart) {
                const productRef = doc(db, "products", item.id);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const productData = productSnap.data();
                    const currentStock = productData.stockCount || 0;
                    const newStock = Math.max(0, currentStock - item.quantity);

                    await updateDoc(productRef, {
                        stockCount: newStock,
                        stock: newStock > 0
                    });
                }
            }

            const orderDetails = cart.map(item =>
                `  • ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
            ).join("\\n");

            const message = `*New Order #${docRef.id.slice(-6)}*\n\n` +
                `Name: ${userDetails.name}\n` +
                `Phone: ${userDetails.phone}\n` +
                `Address: ${userDetails.address}\n\n` +
                `*Order Items*\n` +
                `${orderDetails}\n\n` +
                `*Total Amount: ₹${total}*\n` +
                `*Payment:* ${paymentMethod === "cod" ? "Cash on Delivery" : "UPI Payment (Awaiting Verification)"}`;

            await fetch(`${API_URL}/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: docRef.id,
                    message,
                    total
                })
            });

            clearCart();

            if (paymentMethod === "upi") {
                const link = generateUPILink(docRef.id.slice(-6));
                setUpiLink(link);
                setShowUpiApps(true);
            } else {
                navigate("/orders");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="cart-container">
                <div className="empty-cart">
                    <h2>Your Cart is Empty</h2>
                    <p>Add some products to get started!</p>
                    <button onClick={() => navigate("/")} className="btn-primary">
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    if (showCheckout) {
        return (
            <div className="cart-container">
                <div className="checkout-box">
                    <h2>Checkout</h2>

                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        {cart.map(item => (
                            <div key={item.id} className="summary-item">
                                <span>{item.name} x{item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="summary-item">
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div className="summary-item">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                        </div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                    </div>

                    <div className="delivery-info">
                        <h3>Delivery Details</h3>
                        <div className="info-item">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{userDetails?.name || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Phone:</span>
                            <span className="info-value">{userDetails?.phone || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Address:</span>
                            <span className="info-value">{userDetails?.address || "N/A"}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Payment Method</label>
                        <div className="payment-options">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>💵 Cash on Delivery</span>
                            </label>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    value="upi"
                                    checked={paymentMethod === "upi"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <span>📱 UPI Payment (Google Pay, PhonePe, Paytm)</span>
                            </label>
                        </div>
                    </div>

                    <div className="checkout-actions">
                        <button
                            onClick={() => setShowCheckout(false)}
                            className="btn-secondary"
                        >
                            Back to Cart
                        </button>
                        <button
                            onClick={placeOrder}
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                </div>

                {/* UPI Apps Selection Modal */}
                {showUpiApps && (
                    <div className="upi-modal-overlay" onClick={() => {
                        setShowUpiApps(false);
                        navigate("/orders");
                    }}>
                        <div className="upi-modal" onClick={(e) => e.stopPropagation()}>
                            <h3>Choose Payment App</h3>
                            <p className="upi-modal-subtitle">Select your preferred UPI app to complete payment</p>
                            
                            <div className="upi-apps-grid">
                                <button 
                                    className="upi-app-btn"
                                    onClick={() => {
                                        window.location.href = `gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent("Varun Grocery Mart")}&am=${total}&cu=INR`;
                                        setTimeout(() => {
                                            setShowUpiApps(false);
                                            navigate("/orders");
                                        }, 1000);
                                    }}
                                >
                                    <span className="upi-app-icon">💳</span>
                                    <span className="upi-app-name">Google Pay</span>
                                </button>

                                <button 
                                    className="upi-app-btn"
                                    onClick={() => {
                                        window.location.href = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent("Varun Grocery Mart")}&am=${total}&cu=INR`;
                                        setTimeout(() => {
                                            setShowUpiApps(false);
                                            navigate("/orders");
                                        }, 1000);
                                    }}
                                >
                                    <span className="upi-app-icon">📱</span>
                                    <span className="upi-app-name">PhonePe</span>
                                </button>

                                <button 
                                    className="upi-app-btn"
                                    onClick={() => {
                                        window.location.href = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent("Varun Grocery Mart")}&am=${total}&cu=INR`;
                                        setTimeout(() => {
                                            setShowUpiApps(false);
                                            navigate("/orders");
                                        }, 1000);
                                    }}
                                >
                                    <span className="upi-app-icon">💰</span>
                                    <span className="upi-app-name">Paytm</span>
                                </button>

                                <button 
                                    className="upi-app-btn"
                                    onClick={() => {
                                        window.location.href = upiLink;
                                        setTimeout(() => {
                                            setShowUpiApps(false);
                                            navigate("/orders");
                                        }, 1000);
                                    }}
                                >
                                    <span className="upi-app-icon">🏦</span>
                                    <span className="upi-app-name">Other UPI Apps</span>
                                </button>
                            </div>

                            <button 
                                className="btn-secondary upi-cancel-btn"
                                onClick={() => {
                                    setShowUpiApps(false);
                                    navigate("/orders");
                                }}
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h2>Your Cart</h2>

            <div className="cart-items">
                {cart.map(item => (
                    <div key={item.id} className="cart-item">
                        <img src={item.image} alt={item.name} className="cart-item-image" />

                        <div className="cart-item-details">
                            <h3>{item.name}</h3>
                            <p className="cart-item-price">₹{item.price} each</p>
                        </div>

                        <div className="cart-item-quantity">
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="qty-btn"
                            >
                                -
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="qty-btn"
                            >
                                +
                            </button>
                        </div>

                        <div className="cart-item-total">
                            ₹{item.price * item.quantity}
                        </div>

                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="btn-remove"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                </div>
                <div className="summary-total">
                    <span>Total</span>
                    <span>₹{total}</span>
                </div>

                <div className="cart-actions">
                    <button onClick={clearCart} className="btn-secondary">
                        Clear Cart
                    </button>
                    <button onClick={handleCheckout} className="btn-primary">
                        Proceed to Checkout
                    </button>
                </div>
            </div>

            {showUpiApps && (
                <div className="upi-modal-overlay" onClick={() => {
                    setShowUpiApps(false);
                    navigate("/orders");
                }}>
                    <div className="upi-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Choose Payment App</h3>
                        <p className="upi-modal-subtitle">Select your preferred UPI app to complete payment</p>

                        <div className="upi-apps-grid">
                            <button
                                className="upi-app-btn"
                                onClick={() => {
                                    window.location.href = `gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent("Varun Grocery Mart")}&am=${total}&cu=INR`;
                                    setTimeout(() => {
                                        setShowUpiApps(false);
                                        navigate("/orders");
                                    }, 1000);
                                }}
                            >
                                <span className="upi-app-icon">💳</span>
                                <span className="upi-app-name">Google Pay</span>
                            </button>

                            <button
                                className="upi-app-btn"
                                onClick={() => {
                                    window.location.href = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent("Varun Grocery Mart")}&am=${total}&cu=INR`;
                                    setTimeout(() => {
                                        setShowUpiApps(false);
                                        navigate("/orders");
                                    }, 1000);
                                }}
                            >
                                <span className="upi-app-icon">📱</span>
                                <span className="upi-app-name">PhonePe</span>
                            </button>

                            <button
                                className="upi-app-btn"
                                onClick={() => {
                                    window.location.href = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent("Varun Grocery Mart")}&am=${total}&cu=INR`;
                                    setTimeout(() => {
                                        setShowUpiApps(false);
                                        navigate("/orders");
                                    }, 1000);
                                }}
                            >
                                <span className="upi-app-icon">💰</span>
                                <span className="upi-app-name">Paytm</span>
                            </button>

                            <button
                                className="upi-app-btn"
                                onClick={() => {
                                    window.location.href = upiLink;
                                    setTimeout(() => {
                                        setShowUpiApps(false);
                                        navigate("/orders");
                                    }, 1000);
                                }}
                            >
                                <span className="upi-app-icon">🏦</span>
                                <span className="upi-app-name">Other UPI Apps</span>
                            </button>
                        </div>

                        <button
                            className="btn-secondary upi-cancel-btn"
                            onClick={() => {
                                setShowUpiApps(false);
                                navigate("/orders");
                            }}
                        >
                            View Orders
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
