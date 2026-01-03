import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import "../index.css";

export default function Signup() {
    const [step, setStep] = useState(1); // Step 1: Enter details, Step 2: Verify OTP
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !phone || !address || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (phone.length !== 10 || isNaN(phone)) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            // Send OTP to phone number
            const response = await fetch(`${API_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: phone })
            });

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON response:", text);
                throw new Error(`Server error: ${response.status}. Make sure backend is running on ${API_URL}`);
            }

            if (!response.ok) {
                throw new Error(data.message);
            }

            setOtpSent(true);
            setStep(2);
            setError("");
        } catch (err) {
            setError(err.message || "Failed to send OTP. Please make sure backend server is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);

            // Verify OTP
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: phone, otp })
            });

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON response:", text);
                throw new Error(`Server error: ${response.status}. Make sure backend is running on ${API_URL}`);
            }

            if (!response.ok) {
                throw new Error(data.message);
            }

            setPhoneVerified(true);
            setError("");

            // Create account with verified phone
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: name,
                email: email,
                phone: phone,
                phoneVerified: true,
                address: address,
                role: "user",
                createdAt: new Date().toISOString()
            });

            navigate("/");
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setError("Email already in use");
            } else {
                setError(err.message || "Failed to create account. Try again.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError("");
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: phone })
            });

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON response:", text);
                throw new Error(`Server error: ${response.status}. Make sure backend is running on ${API_URL}`);
            }

            if (!response.ok) {
                throw new Error(data.message);
            }

            setError("");
            setOtp("");
        } catch (err) {
            setError(err.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToForm = () => {
        setStep(1);
        setOtpSent(false);
        setOtp("");
        setError("");
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                {step === 1 ? (
                    <>
                        <h2>Sign Up</h2>
                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="tel"
                                    placeholder="Phone Number (10 digits)"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    maxLength="10"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <textarea
                                    placeholder="Delivery Address"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    rows="3"
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

                            <div className="form-group password-group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <i className={showConfirmPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}></i>
                                </button>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Sending OTP..." : "Send Verification Code"}
                            </button>
                        </form>

                        <p className="auth-link">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h2>Verify Phone Number</h2>
                        {error && <div className="error-message">{error}</div>}

                        <div className="otp-info">
                            <p>We've sent a 6-digit verification code via WhatsApp to:</p>
                            <p className="phone-display">+91 {phone}</p>
                        </div>

                        <form onSubmit={handleVerifyOTP}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength="6"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>

                        <div className="otp-actions">
                            <button onClick={handleResendOTP} className="btn-link" disabled={loading}>
                                Resend OTP
                            </button>
                            <button onClick={handleBackToForm} className="btn-link">
                                Change Phone Number
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
