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
const SHOPKEEPER_PHONE = process.env.SHOPKEEPER_PHONE;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
