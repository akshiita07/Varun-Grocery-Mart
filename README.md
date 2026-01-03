# 🛒 QuickGrocery - Hyperlocal Grocery Ordering App

A full-stack Blinkit-style grocery ordering web application for neighborhood shops. Built with React, Firebase, and Node.js.

## 🌟 Features

### Customer Features
- 🔐 User authentication (signup/login with email)
- 🏠 Home page with category filters
- 🛍️ Browse products by category
- 🛒 Add to cart functionality
- 📦 Checkout with address and payment options
- 💵 Cash on Delivery & Online Payment support
- 📱 WhatsApp order notifications to shopkeeper
- 📋 Order history with status tracking
- ⏱️ Real-time order status timeline (Placed → Preparing → Out for Delivery → Delivered)
- 🔄 "Buy Again" section based on past orders

### Admin/Shopkeeper Features
- 👨‍💼 Separate admin dashboard
- 📊 Real-time order management
- ✏️ Update order status
- 📦 Inventory management (add, edit, delete products)
- 🔄 Toggle stock availability
- 📈 Analytics dashboard (daily/weekly/monthly sales)
- 📊 Top products tracking

## 🛠️ Tech Stack

**Frontend:**
- React 19 with Vite
- React Router DOM for routing
- Firebase Authentication
- Firebase Firestore (database)
- Plain CSS (no UI libraries)
- Context API for state management

**Backend:**
- Node.js + Express
- CORS enabled
- WhatsApp notification integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Code editor (VS Code recommended)

## 🚀 Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in test mode
5. Get your Firebase config from Project Settings → Web App
6. Copy the config values

### 2. Frontend Setup

1. Navigate to project root:
```bash
cd VarunGroceryApp
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Open `src/firebase.js`
   - Replace the placeholder values with your Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure WhatsApp number:
   - Open `backend/index.js`
   - Replace the placeholder phone number:
   ```javascript
   const SHOPKEEPER_PHONE = "919876543210"; // Your WhatsApp number
   ```
   Note: Use country code without '+' (e.g., 919876543210 for India)

4. Start the backend server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

## 👤 Creating Admin User

To access the admin dashboard, you need to manually set user role in Firestore:

1. Sign up for a new account in the app
2. Go to Firebase Console → Firestore Database
3. Find the `users` collection
4. Locate your user document (by email)
5. Edit the document and change `role` field from `"user"` to `"admin"`
6. Logout and login again
7. You can now access `/admin` routes

## 📱 Using the Application

### As a Customer:
1. Sign up / Login
2. Browse products by category
3. Add items to cart
4. Proceed to checkout
5. Enter delivery address and phone
6. Choose payment method
7. Place order
8. View order status in "Orders" page

### As an Admin:
1. Login with admin account
2. Access `/admin` dashboard
3. View and manage incoming orders
4. Update order status
5. Go to Inventory to manage products
6. View Analytics for sales insights

## 📂 Project Structure

```
VarunGroceryApp/
├── src/
│   ├── admin/              # Admin dashboard components
│   │   ├── Dashboard.jsx   # Order management
│   │   ├── Inventory.jsx   # Product management
│   │   └── Analytics.jsx   # Sales analytics
│   ├── auth/               # Authentication pages
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   └── OrderTimeline.jsx
│   ├── context/           # React Context
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── data/              # Static data
│   │   └── products.js
│   ├── user/              # Customer pages
│   │   ├── Home.jsx
│   │   ├── Cart.jsx
│   │   └── Orders.jsx
│   ├── App.jsx            # Main app component
│   ├── firebase.js        # Firebase configuration
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── backend/
│   ├── index.js           # Express server
│   └── package.json
└── package.json
```

## 🎨 Key Features Explained

### Order Status Timeline
Orders progress through 4 stages:
1. **Placed** - Order received
2. **Preparing** - Being packed
3. **Out for Delivery** - On the way
4. **Delivered** - Completed

### WhatsApp Integration
When a customer places an order:
1. Frontend calls backend `/notify` endpoint
2. Backend generates WhatsApp message with order details
3. Returns WhatsApp web link
4. Can be opened to send notification to shopkeeper

### Inventory Management
- Products stored in localStorage (demo)
- In production, sync with Firestore
- Add/Edit/Delete products
- Toggle stock status
- Image URL support

### Analytics
- Real-time calculations
- Today/Week/Month/All-time stats
- Order status breakdown
- Top 5 products tracking

## 🔧 Customization

### Adding More Products
Edit `src/data/products.js` and add items:
```javascript
{
    id: 21,
    name: "Product Name",
    price: 50,
    category: "Category",
    stock: true,
    image: "image-url"
}
```

### Changing Colors
Edit `src/index.css` and modify color variables or specific styles.

### Adding Payment Gateway
Integrate Razorpay/Stripe in checkout flow:
1. Install SDK
2. Add payment button in Cart.jsx
3. Handle payment success/failure
4. Update order status

## 🐛 Troubleshooting

**Firebase errors:**
- Check if config is correctly copied
- Enable Authentication and Firestore in Firebase Console
- Check Firestore rules (should allow read/write in test mode)

**Backend not receiving requests:**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify frontend API URL matches backend port

**Admin access denied:**
- Verify user role is set to "admin" in Firestore
- Logout and login again after role change

## 📝 Notes

- This is a demo/learning project
- In production, implement:
  - Proper authentication guards
  - Secure Firestore rules
  - Backend database
  - Payment gateway integration
  - Order confirmation emails/SMS
  - Better error handling

## 📄 License

This project is open source and available for learning purposes.

## 🤝 Contributing

Feel free to fork, modify, and use this project for your own grocery store or learning!

---

Built with ❤️ for local grocery stores
