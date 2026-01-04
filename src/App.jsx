import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import Home from "./user/Home";
import Cart from "./user/Cart";
import Orders from "./user/Orders";
import Profile from "./user/Profile";
import Dashboard from "./admin/Dashboard";
import Inventory from "./admin/Inventory";
import Analytics from "./admin/Analytics";
import Navbar from "./components/Navbar";
import FloatingCartFooter from "./components/FloatingCartFooter";
import ScrollToTop from "./components/ScrollToTop";
import "./index.css";

// Protected route for regular users only
function UserRoute({ children }) {
    const { userRole, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (userRole === "admin") {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

// Protected route for admin only
function AdminRoute({ children }) {
    const { userRole, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (userRole !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}

function HomePage() {
    const { userRole, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (userRole === "admin") {
        return <Navigate to="/admin" replace />;
    }

    return <Home />;
}

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />

                        {/* User-only routes */}
                        <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
                        <Route path="/orders" element={<UserRoute><Orders /></UserRoute>} />
                        <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />

                        {/* Admin-only routes */}
                        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
                        <Route path="/admin/inventory" element={<AdminRoute><Inventory /></AdminRoute>} />
                        <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <FloatingCartFooter />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
