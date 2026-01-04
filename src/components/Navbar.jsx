import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect, useRef } from "react";
import "../index.css";

export default function Navbar() {
    const { currentUser, userRole } = useAuth();
    const { getItemCount } = useCart();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                mobileMenuOpen &&
                menuRef.current &&
                hamburgerRef.current &&
                !menuRef.current.contains(event.target) &&
                !hamburgerRef.current.contains(event.target)
            ) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
            setMobileMenuOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    Varun Grocery Store
                </Link>

                {/* Hamburger Icon */}
                <button
                    ref={hamburgerRef}
                    className="hamburger-menu"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div ref={menuRef} className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
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
                                    <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
                                    <Link to="/orders" className="nav-link" onClick={closeMobileMenu}>Orders</Link>
                                    <Link to="/cart" className="nav-link cart-link" onClick={closeMobileMenu}>
                                        🛒 Cart {getItemCount() > 0 && (
                                            <span className="cart-badge">{getItemCount()}</span>
                                        )}
                                    </Link>
                                    <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>Profile</Link>
                                    <button onClick={handleLogout} className="btn-logout">
                                        Logout
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" onClick={closeMobileMenu}>Login</Link>
                            <Link to="/signup" className="btn-signup" onClick={closeMobileMenu}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}