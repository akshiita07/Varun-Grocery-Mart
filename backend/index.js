import express from "express";
import cors from "cors";
import twilio from "twilio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const SHOPKEEPER_PHONE = process.env.SHOPKEEPER_PHONE;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // true for port 465
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

setInterval(() => {
    const now = Date.now();
    for (const [phone, data] of otpStore.entries()) {
        if (now > data.expiry) {
            otpStore.delete(phone);
            console.log(`Expired OTP cleaned up for ${phone}`);
        }
    }
}, 60000);

app.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address. Please enter a valid email."
            });
        }

        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            return res.status(500).json({
                success: false,
                message: "Email service is not configured on the server."
            });
        }

        const otp = generateOTP();
        const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

        otpStore.set(email, {
            otp,
            email,
            createdAt: Date.now(),
            expiry: expiryTime,
            attempts: 0
        });

        await mailer.sendMail({
            from: SMTP_FROM,
            to: email,
            subject: "Your Varun Grocery Mart Verification Code",
            text: `Your verification code is ${otp}. It will expire in 10 minutes. Do not share this code with anyone.`,
            html: `<p><strong>Your verification code:</strong> <span style="font-size:20px;">${otp}</span></p><p>This code will expire in 10 minutes.</p><p>Do not share this code with anyone.</p>`
        });

        console.log(`OTP sent via Email to ${email} - OTP: ${otp}`);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully via Email",
            channel: "email"
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to send OTP. Please try again.",
            error: error?.message
        });
    }
});

app.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // Get OTP from memory
        const otpData = otpStore.get(email);

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP."
            });
        }

        if (Date.now() > otpData.expiry) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (otpData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        otpStore.delete(email);

        console.log(`Email ${email} verified successfully`);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            verified: true
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
            error: error.message
        });
    }
});

app.post("/notify", async (req, res) => {
    try {
        const { orderId, message, total } = req.body;

        const twilioMessage = await client.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            to: SHOPKEEPER_PHONE,
            body: message
        });

        console.log("\n========== NEW ORDER ==========");
        console.log("Order ID:", orderId);
        console.log("Total Amount: ₹", total);
        console.log("Twilio Message SID:", twilioMessage.sid);
        console.log("Message Status:", twilioMessage.status);
        console.log("================================\n");

        res.status(200).json({
            success: true,
            message: "WhatsApp notification sent successfully",
            messageSid: twilioMessage.sid
        });
    } catch (error) {
        console.error("Error sending WhatsApp notification:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send WhatsApp notification",
            error: error.message
        });
    }
});

app.get("/", (req, res) => {
    res.json({
        status: "running",
        message: "Varun Grocery Store Backend API",
        endpoints: [
            { method: "POST", path: "/send-otp", description: "Send OTP to phone number" },
            { method: "POST", path: "/verify-otp", description: "Verify OTP" },
            { method: "POST", path: "/notify", description: "Send order notification" }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`WhatsApp notifications: ${SHOPKEEPER_PHONE}`);
    console.log(`========================================\n`);
});

process.on("SIGINT", () => {
    console.log("\n\nShutting down backend server...");
    process.exit(0);
});
