import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../index.css";

export default function Navbar() {
    const { currentUser, userRole } = useAuth();
    const { getItemCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    Varun Grocery Store
                </Link>

                <div className="navbar-menu">
                    {currentUser ? (
                        <>
                            {userRole === "admin" ? (
                                <>
                                    <span className="nav-link admin-welcome">
                                        Welcome, Admin
                                    </span>
                                    <button onClick={handleLogout} className="btn-logout">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="nav-link">Home</Link>
                                    <Link to="/orders" className="nav-link">Orders</Link>
                                    <Link to="/cart" className="nav-link cart-link">
                                        🛒 Cart {getItemCount() > 0 && (
                                            <span className="cart-badge">{getItemCount()}</span>
                                        )}
                                    </Link>
                                    <Link to="/profile" className="nav-link">Profile</Link>
                                    <button onClick={handleLogout} className="btn-logout">
                                        Logout
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup" className="btn-signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}