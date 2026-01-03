import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import OrderTimeline from "../components/OrderTimeline";
import "../index.css";

export default function Orders() {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        fetchOrders();
    }, [currentUser, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const ordersRef = collection(db, "orders");
            const q = query(
                ordersRef,
                where("userId", "==", currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const ordersData = [];

            querySnapshot.forEach((doc) => {
                ordersData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by createdAt in JavaScript instead
            ordersData.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA; // desc order
            });

            setOrders(ordersData);
            console.log("Fetched orders:", ordersData); // Debug log
        } catch (error) {
            console.error("Error fetching orders:", error);
            alert("Error loading orders: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="orders-container">
                <div className="loading">Loading your orders...</div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="orders-container">
                <div className="empty-orders">
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet.</p>
                    <button onClick={() => navigate("/")} className="btn-primary">
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <h2>Your Orders</h2>

            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div>
                                <h3>Order #{order.id.slice(-6)}</h3>
                                <p className="order-date">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="order-total">
                                <span className="total-label">Total</span>
                                <span className="total-amount">₹{order.total}</span>
                            </div>
                        </div>

                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="order-details">
                            <div className="order-info">
                                <p><strong>Address:</strong> {order.address}</p>
                                <p><strong>Phone:</strong> {order.phone}</p>
                                <p><strong>Payment:</strong> {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                            </div>
                        </div>

                        <div className="order-status">
                            <h4>Order Status</h4>
                            <OrderTimeline status={order.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}