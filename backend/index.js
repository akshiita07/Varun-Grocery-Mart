import express from "express";
import cors from "cors";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const TWILIO_PHONE_FROM = process.env.TWILIO_PHONE_FROM;
const SHOPKEEPER_PHONE = process.env.SHOPKEEPER_PHONE;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
        const { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number. Please enter a valid 10-digit number."
            });
        }

        const otp = generateOTP();
        const phone = "whatsapp:+91" + phoneNumber;
        const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

        otpStore.set(phoneNumber, {
            otp,
            phoneNumber,
            createdAt: Date.now(),
            expiry: expiryTime,
            attempts: 0
        });

        const twilioMessage = await client.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            to: phone,
            body: `*Varun Grocery Mart*\nYour verification code is: *${otp}*\nThis code will expire in 10 minutes.\nDo not share this code with anyone.`
        });

        console.log(`OTP sent to ${phone} - SID: ${twilioMessage.sid}, OTP: ${otp}`);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully via WhatsApp",
            messageSid: twilioMessage.sid
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again.",
            error: error.message
        });
    }
});

app.post("/verify-otp", async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required"
            });
        }

        // Get OTP from memory
        const otpData = otpStore.get(phoneNumber);

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP."
            });
        }

        if (Date.now() > otpData.expiry) {
            otpStore.delete(phoneNumber);
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

        otpStore.delete(phoneNumber);

        console.log(`Phone ${phoneNumber} verified successfully`);

        res.status(200).json({
            success: true,
            message: "Phone number verified successfully",
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
        message: "QuickGrocery Backend API",
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
