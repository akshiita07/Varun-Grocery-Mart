import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import OrderTimeline from "../components/OrderTimeline";
import "../index.css";

export default function Dashboard() {
    const { currentUser, userRole } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        if (userRole !== "admin") {
            navigate("/");
            return;
        }

        fetchOrders();
    }, [currentUser, userRole, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, orderBy("createdAt", "desc"));

            const querySnapshot = await getDocs(q);
            const ordersData = [];

            querySnapshot.forEach((doc) => {
                ordersData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            setOrders(ordersData);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });

            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                    : order
            ));

        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update order status");
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

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(order => order.status === filter);

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <p className="admin-subtitle">Welcome! Manage your store from here</p>
            </div>

            {/* Quick Action Cards */}
            <div className="admin-quick-actions">
                <Link to="/admin/inventory" className="action-card">
                    <div className="action-icon">📦</div>
                    <h3>Inventory Management</h3>
                    <p>Add, edit, or remove products from your store</p>
                </Link>
                <Link to="/admin/analytics" className="action-card">
                    <div className="action-icon">📊</div>
                    <h3>Analytics</h3>
                    <p>View sales reports and business insights</p>
                </Link>
            </div>

            <div className="dashboard-section">
                <h3>Order Management</h3>
                <div className="order-filters">
                    <button
                        className={`filter-btn ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        All Orders ({orders.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === "placed" ? "active" : ""}`}
                        onClick={() => setFilter("placed")}
                    >
                        New ({orders.filter(o => o.status === "placed").length})
                    </button>
                    <button
                        className={`filter-btn ${filter === "out_for_delivery" ? "active" : ""}`}
                        onClick={() => setFilter("out_for_delivery")}
                    >
                        Out for Delivery ({orders.filter(o => o.status === "out_for_delivery").length})
                    </button>
                    <button
                        className={`filter-btn ${filter === "delivered" ? "active" : ""}`}
                        onClick={() => setFilter("delivered")}
                    >
                        Delivered ({orders.filter(o => o.status === "delivered").length})
                    </button>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <p>No orders in this category</p>
                    </div>
                ) : (
                    <div className="admin-orders-list">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="admin-order-card">
                                <div className="order-header">
                                    <div>
                                        <h3>Order #{order.id.slice(-6)}</h3>
                                        <p className="order-date">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="order-total">
                                        <span className="total-amount">₹{order.total}</span>
                                    </div>
                                </div>

                                <div className="order-customer">
                                    <p><strong>Customer:</strong> {order.userEmail}</p>
                                    <p><strong>Phone:</strong> {order.phone}</p>
                                    <p><strong>Address:</strong> {order.address}</p>
                                    <p><strong>Payment:</strong> {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                                </div>

                                <div className="order-items">
                                    <h4>Items:</h4>
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-status">
                                    <h4>Status</h4>
                                    <OrderTimeline status={order.status} />
                                </div>

                                <div className="order-actions">
                                    <h4>Update Status:</h4>
                                    <div className="status-buttons">
                                        {order.status !== "placed" && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, "placed")}
                                                className="btn-status"
                                            >
                                                Placed
                                            </button>
                                        )}
                                        {order.status !== "out_for_delivery" && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                                                className="btn-status"
                                            >
                                                Out for Delivery
                                            </button>
                                        )}
                                        {order.status !== "delivered" && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, "delivered")}
                                                className="btn-status btn-delivered"
                                            >
                                                Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
