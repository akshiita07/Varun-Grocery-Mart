import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import Home from "./user/Home";
import Cart from "./user/Cart";
import Orders from "./user/Orders";
import Dashboard from "./admin/Dashboard";
import Inventory from "./admin/Inventory";
import Analytics from "./admin/Analytics";
import Navbar from "./components/Navbar";
import "./index.css";
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
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />

                        <Route path="/cart" element={<Cart />} />
                        <Route path="/orders" element={<Orders />} />

                        <Route path="/admin" element={<Dashboard />} />
                        <Route path="/admin/inventory" element={<Inventory />} />
                        <Route path="/admin/analytics" element={<Analytics />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
