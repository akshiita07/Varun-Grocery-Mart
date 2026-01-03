import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../index.css";

export default function Analytics() {
    const { currentUser, userRole } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        if (userRole !== "admin") {
            alert("Access denied. Admin only.");
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

    const calculateAnalytics = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= weekAgo;
        });
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= monthStart;
        });

        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);
        const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        const statusCounts = {
            placed: orders.filter(o => o.status === "placed").length,
            preparing: orders.filter(o => o.status === "preparing").length,
            out_for_delivery: orders.filter(o => o.status === "out_for_delivery").length,
            delivered: orders.filter(o => o.status === "delivered").length
        };

        const productCounts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (productCounts[item.name]) {
                    productCounts[item.name] += item.quantity;
                } else {
                    productCounts[item.name] = item.quantity;
                }
            });
        });

        const topProducts = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        return {
            todayOrders: todayOrders.length,
            todayRevenue,
            weekOrders: weekOrders.length,
            weekRevenue,
            monthOrders: monthOrders.length,
            monthRevenue,
            totalOrders: orders.length,
            totalRevenue,
            statusCounts,
            topProducts
        };
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading">Loading analytics...</div>
            </div>
        );
    }

    const analytics = calculateAnalytics();

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Analytics</h2>
                <Link to="/admin" className="btn-secondary">
                    Back to Dashboard
                </Link>
            </div>

            <div className="analytics-cards">
                <div className="analytics-card highlight">
                    <h3>Today</h3>
                    <div className="card-value">₹{analytics.todayRevenue}</div>
                    <div className="card-label">{analytics.todayOrders} orders</div>
                </div>

                <div className="analytics-card">
                    <h3>This Week</h3>
                    <div className="card-value">₹{analytics.weekRevenue}</div>
                    <div className="card-label">{analytics.weekOrders} orders</div>
                </div>

                <div className="analytics-card">
                    <h3>This Month</h3>
                    <div className="card-value">₹{analytics.monthRevenue}</div>
                    <div className="card-label">{analytics.monthOrders} orders</div>
                </div>

                <div className="analytics-card">
                    <h3>All Time</h3>
                    <div className="card-value">₹{analytics.totalRevenue}</div>
                    <div className="card-label">{analytics.totalOrders} orders</div>
                </div>
            </div>

            <div className="analytics-section">
                <h3>Order Status Breakdown</h3>
                <div className="status-cards">
                    <div className="status-card">
                        <div className="status-count">{analytics.statusCounts.placed}</div>
                        <div className="status-label">New Orders</div>
                    </div>
                    <div className="status-card">
                        <div className="status-count">{analytics.statusCounts.preparing}</div>
                        <div className="status-label">Preparing</div>
                    </div>
                    <div className="status-card">
                        <div className="status-count">{analytics.statusCounts.out_for_delivery}</div>
                        <div className="status-label">Out for Delivery</div>
                    </div>
                    <div className="status-card">
                        <div className="status-count">{analytics.statusCounts.delivered}</div>
                        <div className="status-label">Delivered</div>
                    </div>
                </div>
            </div>

            <div className="analytics-section">
                <h3>Top 5 Products</h3>
                <div className="top-products">
                    {analytics.topProducts.map((product, index) => (
                        <div key={product.name} className="top-product-item">
                            <span className="product-rank">#{index + 1}</span>
                            <span className="product-name">{product.name}</span>
                            <span className="product-quantity">{product.quantity} units sold</span>
                        </div>
                    ))}
                </div>
                {analytics.topProducts.length === 0 && (
                    <p className="no-data">No product data available yet</p>
                )}
            </div>
        </div>
    );
}
