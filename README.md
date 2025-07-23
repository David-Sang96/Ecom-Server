# 🛒 E-Commerce Backend

This is the backend for an e-commerce application built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, and **Cloudinary**. It handles authentication, product and order management, image uploads, and payment processing.

---

## 📦 Features

### 🔐 Authentication
- User registration with email verification
- Login, logout, and protected routes
- Password reset via email 
- JWT-based auth

### 🛍️ Products
- Create, update, delete products
- Image upload support (single/multiple) using Multer + Cloudinary
- Get all products (with cursor-based pagination)
- Get a single product

### 📤 File Uploads
- Upload and delete profile images or product images to Cloudinary

### 💳 Payments
- Stripe card payment integration
- Order creation and tracking

### ⚙️ Admin
- Admin can manage users and orders
- Order and user status update support

### 🛡️ Middleware
- Global rate limiter
- Custom error handling
- Auth protection middleware

---

## 🧰 Tech Stack

- **Node.js + Express**
- **TypeScript**
- **MongoDB + Mongoose**
- **Cloudinary** (image upload)
- **Multer** (handle multipart/form-data)
- **Twilio** (SMS service)
- **Nodemailer** (email service)
- **Stripe** (payment integration)
- **Zod** (validation)
- **Dotenv** (env config)

---

