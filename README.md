
# 🍱 Balaji Tiffin Backend

A production-ready API for managing a tiffin (meal) delivery service, built with **Node.js**, **Express**, and **MongoDB**.

This backend supports:
- OTP-based authentication
- Wallet top-up and deduction
- Tiffin creation and ordering (with image upload)
- Scheduled delivery processing
- Pause/resume subscriptions
- Full Swagger documentation

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Key Features](#key-features)
- [Development](#development)
- [Production Notes](#production-notes)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🚀 Features

- ✅ **OTP Authentication**: Secure mobile login with JWT.
- 💰 **Wallet System**: Top-up and deduct tiffin charges daily.
- 🍛 **Tiffin Management**: Add, list, and upload meal images.
- 📦 **Order Management**: Create orders, deliver, pause/resume with automatic subscription extension.
- ⏰ **Scheduler**: Cron-based system to deduct balance and mark orders delivered daily.
- 📘 **Swagger UI**: API documentation at `/api/docs`.
- 🔐 **Security**: JWT-based access and role-based routing (user/admin).

---

## 🏗️ Project Structure

```

BalajiTiffin-Backend/
├── src/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   ├── swagger.js       # Swagger setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── tiffinController.js
│   │   ├── orderController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── multer.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   ├── Tiffin.js
│   │   ├── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── tiffinRoutes.js
│   │   ├── orderRoutes.js
│   ├── utils/
│   │   ├── scheduler.js
│   ├── index.js             # Entry point
├── uploads/                 # For image files
├── .env                     # Environment variables
├── package.json
└── README.md

````

---

## 📦 Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (Local or MongoDB Atlas)
- **npm**
---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/deepak748030/Balaji-tiffin-server.git
cd Balaji-tiffin-server
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

Create a `.env` file in the root with the following keys:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 4. Run the Server

```bash
npm run dev
```

➡️ Visit: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 📌 API Endpoints

### 🔐 Authentication

| Method | Endpoint               | Description              | Auth     |
| ------ | ---------------------- | ------------------------ | -------- |
| POST   | `/api/auth/send-otp`   | Send OTP                 | ❌ Public |
| POST   | `/api/auth/verify-otp` | Verify OTP and get token | ❌ Public |

### 👤 User

| Method | Endpoint             | Description         | Auth  |
| ------ | -------------------- | ------------------- | ----- |
| PUT    | `/api/users/profile` | Update profile      | ✅ JWT |
| POST   | `/api/users/top-up`  | Add money to wallet | ✅ JWT |
| GET    | `/api/users/wallet`  | View wallet balance | ✅ JWT |

### 🍛 Tiffins

| Method | Endpoint       | Description                | Auth     |
| ------ | -------------- | -------------------------- | -------- |
| GET    | `/api/tiffins` | List all tiffins           | ❌ Public |
| POST   | `/api/tiffins` | Create tiffin (with image) | ✅ Admin  |

### 🧾 Orders

| Method | Endpoint                   | Description                       | Auth        |
| ------ | -------------------------- | --------------------------------- | ----------- |
| POST   | `/api/orders`              | Create a new order                | ✅ JWT       |
| PUT    | `/api/orders/:id/deliver`  | Mark order as delivered           | ✅ Admin     |
| PUT    | `/api/orders/pause`        | Pause order & extend subscription | ✅ JWT       |
| GET    | `/api/orders/user/:userId` | Get all orders of a user          | ✅ JWT/Admin |

📘 More details available at: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 💡 Key Features

### 🔁 Pause Order

* **Endpoint**: `PUT /api/orders/pause`
* Extends subscription based on number of paused tiffins
* Ensures tiffin delivery is resumed after pause

### 📥 Order Retrieval

* **Endpoint**: `GET /api/orders/user/:userId`
* Returns detailed user order history
* Includes tiffin details (name, price, slot, status)

### 🔄 Scheduler

* Automatically runs every day at **00:05 AM**
* Deducts tiffin amount from wallet
* Marks tiffins as delivered

### 📤 File Uploads

* Tiffin image uploaded using **Multer**
* Stores file under `/uploads` folder
* Unique filenames ensure no conflict

---

## 🧪 Development

To run the app with hot-reload using **nodemon**:

```bash
npm run dev
```

---

## 🚀 Production Notes

* Use **MongoDB Atlas** for cloud hosting
* Integrate **Twilio** or similar service for OTP instead of `console.log`
* Use **Winston** for logging production events
* Keep `.env` safe using secret managers

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

