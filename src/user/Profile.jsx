import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../index.css";
import "../profile.css";

export default function Profile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeTab, setActiveTab] = useState("profile");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        fetchUserData();
    }, [currentUser, navigate]);

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setName(data.name || "");
                setPhone(data.phone || "");
                setAddress(data.address || "");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to load profile data");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !phone || !address) {
            setError("All fields are required");
            return;
        }

        if (phone.length !== 10 || isNaN(phone)) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        try {
            setLoading(true);

            await updateDoc(doc(db, "users", currentUser.uid), {
                name,
                phone,
                address,
                updatedAt: new Date().toISOString()
            });

            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("All password fields are required");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const credential = EmailAuthProvider.credential(
                currentUser.email,
                oldPassword
            );
            await reauthenticateWithCredential(auth.currentUser, credential);

            await updatePassword(auth.currentUser, newPassword);

            setSuccess("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Error changing password:", error);
            if (error.code === "auth/wrong-password") {
                setError("Old password is incorrect");
            } else if (error.code === "auth/too-many-requests") {
                setError("Too many attempts. Please try again later");
            } else {
                setError("Failed to change password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <h2>My Account</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                    onClick={() => setActiveTab("profile")}
                >
                    Profile Information
                </button>
                <button
                    className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                    onClick={() => setActiveTab("password")}
                >
                    Change Password
                </button>
            </div>

            {activeTab === "profile" && (
                <div className="profile-content">
                    <form onSubmit={handleUpdateProfile} className="profile-form">
                        <div className="form-group">
                            <label>Email (Cannot be changed)</label>
                            <input
                                type="email"
                                value={currentUser?.email || ""}
                                disabled
                                className="disabled-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="10-digit phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                maxLength="10"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Delivery Address</label>
                            <textarea
                                placeholder="Enter your complete delivery address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows="4"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Profile"}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === "password" && (
                <div className="profile-content">
                    <form onSubmit={handleChangePassword} className="profile-form">
                        <div className="form-group">
                            <label>Old Password</label>
                            <div className="password-group">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    placeholder="Enter your current password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    <i className={showOldPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <div className="password-group">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password (min 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <i className={showNewPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <div className="password-group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Changing Password..." : "Change Password"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
