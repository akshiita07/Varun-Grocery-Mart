import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../index.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setError("");
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Clear any old cart data from before login
            clearCart();
            localStorage.removeItem("cart");

            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists()) {
                const role = userDoc.data().role;
                if (role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        } catch (err) {
            setError("Failed to login. Check your credentials.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!resetEmail) {
            setError("Please enter your email address");
            return;
        }

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, resetEmail);
            setSuccess("Password reset email sent! Check your inbox.");
            setResetEmail("");
            setTimeout(() => {
                setShowForgotPassword(false);
                setSuccess("");
            }, 3000);
        } catch (err) {
            if (err.code === "auth/user-not-found") {
                setError("No account found with this email address");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email address");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setShowForgotPassword(false);
        setResetEmail("");
        setError("");
        setSuccess("");
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                {!showForgotPassword ? (
                    <>
                        <h2>Login</h2>
                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group password-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}></i>
                                </button>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        <div className="auth-links">
                            <button
                                onClick={() => setShowForgotPassword(true)}
                                className="btn-link"
                                style={{ marginTop: '1rem' }}
                            >
                                Forgot Password?
                            </button>
                            <p className="auth-link">
                                Don't have an account? <Link to="/signup">Sign up</Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Reset Password</h2>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <div className="otp-info">
                            <p>Enter your email address and we'll send you a link to reset your password.</p>
                        </div>

                        <form onSubmit={handleForgotPassword}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>

                        <div className="otp-actions">
                            <button onClick={handleBackToLogin} className="btn-link">
                                Back to Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
