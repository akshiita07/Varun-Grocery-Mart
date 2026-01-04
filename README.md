# Varun Grocery Mart - Hyperlocal Grocery Ordering App

A full-stack grocery ordering web application built for neighborhood shops. Customers can browse products, place orders, and track deliveries in real-time. Shop owners can manage inventory, update order status, and view sales analytics.

**Live Demo:** [Frontend on Vercel](https://varun-grocery-mart.vercel.app) | [Backend on Render](https://varun-grocery-mart.onrender.com)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Core Workflows](#core-workflows)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## Features

### Customer Features

**Authentication & Security**
- Email-based registration with OTP verification via SendGrid
- Secure Firebase Authentication
- Profile management with address and phone details

**Shopping Experience**
- Product catalog with category filters (Dairy, Snacks, Beverages, etc.)
- Search functionality
- Add to cart with quantity management
- Real-time cart updates with total calculation
- Responsive mobile-first design with hamburger menu

**Order Management**
- Checkout with delivery address and phone
- Cash on Delivery payment option
- Order history with detailed status tracking
- Visual order timeline (Placed → Preparing → Out for Delivery → Delivered)
- "Buy Again" quick reorder from past purchases

**Notifications**
- WhatsApp notification to shopkeeper on new orders
- Email OTP for signup verification

### Admin/Shopkeeper Features

**Dashboard**
- Real-time incoming order list
- Order details with customer information
- Update order status (Preparing, Out for Delivery, Delivered)
- Mark orders as completed

**Inventory Management**
- Add new products with name, price, category, stock status, and image URL
- Edit existing products
- Delete products from catalog
- Toggle stock availability
- Category-based organization

**Analytics**
- Sales overview (Today, This Week, This Month, All Time)
- Total revenue tracking
- Order status breakdown (Pending, Delivered, Cancelled)
- Top 5 best-selling products
- Visual data presentation

## Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Routing:** React Router DOM v6
- **Authentication:** Firebase Authentication
- **Database:** Firebase Firestore
- **State Management:** Context API (AuthContext, CartContext)
- **Styling:** Pure CSS with responsive design
- **Icons:** Font Awesome
- **Hosting:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Email Service:** SendGrid Web API (OTP delivery)
- **Notifications:** Twilio WhatsApp API
- **CORS:** Enabled for cross-origin requests
- **Hosting:** Render

### Services & APIs
- **Firebase:** Authentication, Firestore database
- **SendGrid:** Transactional email (OTP)
- **Twilio:** WhatsApp notifications to shopkeeper

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │────────▶│   Express    │────────▶│  SendGrid   │
│  Frontend   │         │   Backend    │         │   (Email)   │
│  (Vercel)   │◀────────│  (Render)    │         └─────────────┘
└─────────────┘         └──────────────┘
      │                        │
      │                        │
      ▼                        ▼
┌─────────────┐         ┌─────────────┐
│  Firebase   │         │   Twilio    │
│  Auth/DB    │         │  (WhatsApp) │
└─────────────┘         └─────────────┘
```

**Data Flow:**
1. User signs up → Backend sends OTP via SendGrid → User verifies → Firebase account created
2. User places order → Stored in Firestore → Backend sends WhatsApp to shopkeeper
3. Admin updates status → Firestore updated → Customer sees real-time status
4. Cart stored in Context → Checkout → Order document created in Firestore

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Firebase account
- SendGrid account (free tier)
- Twilio account (optional, for WhatsApp)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/VarunGroceryApp.git
cd VarunGroceryApp
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable **Authentication** → Email/Password provider
   - Enable **Firestore Database** → Start in production mode
   - Copy your Firebase config from Project Settings → Web App

5. **Set up SendGrid**
   - Sign up at [SendGrid](https://sendgrid.com)
   - Verify sender identity (Settings → Sender Authentication)
   - Create API key (Settings → API Keys → Create API Key)
   - Copy the API key (starts with `SG.`)

6. **Configure environment variables** (see section below)

7. **Run the application**

Frontend:
```bash
npm run dev
```
Runs on `http://localhost:5173`

Backend:
```bash
cd backend
npm start
```
Runs on `http://localhost:5000`

## Environment Variables

### Frontend (.env in root)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Backend API URL
VITE_API_URL=http://localhost:5000
# For production: https://your-backend.onrender.com
```

### Backend (backend/.env)

```env
# Server Configuration
PORT=5000

# SendGrid (Email OTP)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=your-verified-email@gmail.com

# Twilio WhatsApp (Order Notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
SHOPKEEPER_PHONE=whatsapp:+919876543210

# Firebase Admin (optional - for future server-side operations)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Important Notes:**
- Never commit `.env` files to version control
- Use Render/Vercel dashboard to set production environment variables
- SendGrid sender email must be verified before emails will send
- For Gmail SMTP (not recommended for production), use app-specific password

## Project Structure

```
VarunGroceryApp/
├── backend/
│   ├── index.js              # Express server with API endpoints
│   ├── package.json          # Backend dependencies
│   └── .env                  # Backend environment variables
│
├── src/
│   ├── admin/
│   │   ├── Dashboard.jsx     # Order management dashboard
│   │   ├── Inventory.jsx     # Product CRUD operations
│   │   └── Analytics.jsx     # Sales analytics and reports
│   │
│   ├── auth/
│   │   ├── Login.jsx         # User login page
│   │   └── Signup.jsx        # Registration with email OTP
│   │
│   ├── components/
│   │   ├── FloatingCartFooter.jsx  # Mobile cart summary
│   │   ├── Navbar.jsx              # Top navigation with hamburger menu
│   │   ├── OrderTimeline.jsx       # Visual order status tracker
│   │   ├── ProductCard.jsx         # Product display component
│   │   └── ScrollToTop.jsx         # Scroll restoration utility
│   │
│   ├── context/
│   │   ├── AuthContext.jsx   # Global auth state (currentUser, userRole)
│   │   └── CartContext.jsx   # Cart state management
│   │
│   ├── user/
│   │   ├── Home.jsx          # Product catalog with filters
│   │   ├── Cart.jsx          # Shopping cart and checkout
│   │   ├── Orders.jsx        # Order history and tracking
│   │   └── Profile.jsx       # User profile management
│   │
│   ├── App.jsx               # Root component with routing
│   ├── config.js             # API URL configuration
│   ├── firebase.js           # Firebase initialization
│   ├── index.css             # Global styles and responsive design
│   ├── main.jsx              # React entry point
│   └── profile.css           # Profile page specific styles
│
├── public/                   # Static assets
├── .env                      # Frontend environment variables
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML template
├── package.json              # Frontend dependencies
├── README.md                 # This file
└── vite.config.js            # Vite configuration
```

## User Roles

### Customer (role: "user")
- Default role assigned on signup
- Access to: Home, Cart, Orders, Profile
- Cannot access admin routes

### Admin/Shopkeeper (role: "admin")
- Manually set in Firestore
- Access to: Admin Dashboard, Inventory, Analytics
- Full order management capabilities

**How to create admin user:**
1. Sign up for a new account
2. Go to Firebase Console → Firestore Database
3. Navigate to `users` collection
4. Find your user document (search by email)
5. Edit document → Change `role` field from `"user"` to `"admin"`
6. Logout and login again
7. Navigate to `/admin` to access dashboard

## Core Workflows

### Customer Registration Flow

1. User fills signup form (name, email, phone, address, password)
2. Frontend calls `/send-otp` with email
3. Backend generates 6-digit OTP and sends via SendGrid
4. User receives email (check spam if not in inbox)
5. User enters OTP in verification screen
6. Frontend calls `/verify-otp` with email and OTP
7. Backend validates OTP
8. Frontend creates Firebase account
9. User document created in Firestore with role "user"
10. User redirected to home page

### Order Placement Flow

1. Customer adds products to cart (stored in Context)
2. Navigates to Cart page
3. Reviews items, quantities, and total
4. Clicks "Proceed to Checkout"
5. Order document created in Firestore:
   ```javascript
   {
     userId: "firebase_uid",
     customerName: "John Doe",
     customerEmail: "john@example.com",
     customerPhone: "9876543210",
     deliveryAddress: "123 Main St",
     items: [{productId, name, price, quantity}],
     totalAmount: 500,
     status: "placed",
     paymentMethod: "Cash on Delivery",
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```
6. Frontend calls `/notify` endpoint
7. Backend sends WhatsApp message to shopkeeper
8. Cart cleared, user redirected to Orders page

### Admin Order Management Flow

1. Admin logs in and navigates to Dashboard
2. Real-time listener fetches all orders from Firestore
3. Orders displayed with customer details and items
4. Admin clicks status dropdown to update order
5. Status options: Preparing, Out for Delivery, Delivered
6. Firestore order document updated
7. Customer sees updated status in real-time on Orders page
8. Order timeline updates visually

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" → Import your repository
4. Configure environment variables (all VITE_* variables)
5. Deploy

**Environment variables to set:**
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_DATABASE_URL
- VITE_API_URL (set to your Render backend URL)

### Backend (Render)

1. Push code to GitHub
2. Go to [Render Dashboard](https://render.com/dashboard)
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables (SENDGRID_API_KEY, SMTP_FROM, TWILIO_*, etc.)
7. Deploy

**Important:** Render free tier spins down after inactivity. First request may take 30-60 seconds.

## API Endpoints

### POST /send-otp
Sends OTP to email for signup verification.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully via Email",
  "channel": "email"
}
```

### POST /verify-otp
Verifies OTP entered by user.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "verified": true
}
```

### POST /notify
Sends WhatsApp notification to shopkeeper about new order.

**Request:**
```json
{
  "orderId": "abc123",
  "message": "New Order #abc123\nCustomer: John\nTotal: ₹500\n...",
  "total": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp notification sent successfully",
  "messageSid": "SM..."
}
```

### GET /
Health check endpoint.

**Response:**
```json
{
  "status": "running",
  "message": "Varun Grocery Store Backend API",
  "endpoints": [...]
}
```

## Troubleshooting

### OTP Not Received

**Check SendGrid:**
- Verify sender email is verified in SendGrid dashboard
- Check Activity Feed in SendGrid for delivery status
- Check spam/junk folder
- Verify SENDGRID_API_KEY and SMTP_FROM are set correctly in Render

**Check Backend Logs:**
- Go to Render dashboard → Your service → Logs
- Look for "OTP sent via Email to..." or error messages
- Verify no connection timeout errors

### Firebase Authentication Errors

**"Email already in use":**
- Email is registered; use login instead or reset password

**"Weak password":**
- Password must be at least 6 characters

**"Invalid email":**
- Check email format (must have @ and domain)

**Permission Denied:**
- Update Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Admin Access Issues

**"Access Denied" on /admin:**
- Verify user role is set to "admin" in Firestore users collection
- Logout completely (clear localStorage if needed)
- Login again
- Navigate to /admin

### Backend Not Responding

**CORS Errors:**
- Verify CORS is enabled in backend/index.js
- Check VITE_API_URL matches your backend URL exactly (no trailing slash mismatch)

**Connection Refused:**
- Ensure backend is running: `cd backend && npm start`
- Check backend is on port 5000
- Verify no firewall blocking

**Render Deployment Issues:**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure build succeeded (green checkmark)
- Wait 30-60 seconds for free tier to wake up

### Mobile Responsive Issues

**Hamburger menu not showing:**
- Check browser width is < 768px
- Clear browser cache
- Verify CSS media queries loaded

**Cart footer overlapping content:**
- Check z-index values in CSS
- Verify footer is position: fixed

## Development Tips

**Testing OTP locally:**
- Check backend console logs for generated OTP
- Use that OTP to verify without waiting for email

**Bypassing email verification:**
- Comment out OTP verification in Signup.jsx temporarily
- Only for development; never in production

**Debugging Firestore:**
- Use Firebase Console → Firestore Database to view data in real-time
- Check Network tab in DevTools for failed requests
- Enable Firestore debug mode in firebase.js

**Performance:**
- Use React DevTools Profiler to identify slow components
- Lazy load routes with React.lazy() and Suspense
- Optimize images (use WebP format, proper sizing)

## Future Enhancements

- Payment gateway integration (Razorpay/Stripe)
- Real-time order tracking with map
- Push notifications for order updates
- Product search and recommendations
- Coupon/discount system
- Multi-vendor support
- Delivery slot selection
- Product ratings and reviews

## License

This project is open source and available for educational purposes.

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: pathakshita07@gmail.com

---

Built for local grocery stores to compete with quick commerce platforms.Built for local grocery stores to compete with quick commerce platforms.
