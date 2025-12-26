# Deployment Guide: Render & Vercel

This guide explains how to deploy the **BookMyStay** application.

## 1. Backend Deployment (Render Web Service)

1.  **Create a New Web Service**:
    -   Connect your GitHub repository.
    -   Set **Name**: `bookmstay-api`
    -   Set **Root Directory**: `backend`
    -   Set **Environment**: `Node`
    -   Set **Build Command**: `npm install && npx prisma generate`
    -   Set **Start Command**: `npm start`

2.  **Environment Variables**:
    -   `DATABASE_URL`: Your MongoDB connection string.
    -   `JWT_SECRET`: A secure random string.
    -   `RAZORPAY_KEY_ID`: Your Razorpay Key ID.
    -   `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
    -   `FRONTEND_URL`: `https://book-my-stay-sigma.vercel.app`
    -   `NODE_ENV`: `production`

---

## 2. Frontend Deployment (Vercel)

1.  **Import Project**: Connect your GitHub repo.
2.  **Framework Preset**: Select **Vite**.
3.  **Root Directory**: `frontend`
4.  **Build Command**: `npm install && npm run build`
5.  **Output Directory**: `dist`
6.  **Environment Variables (Crucial)**:
    -   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://bookmystay-0hj0.onrender.com/api`). **Do not include trailing slash.**
    -   `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID.

---

## 3. Backend Deployment (Vercel Serverless) - Alternative

If you want to host the backend on Vercel as well:
1.  **Root Directory**: `backend`
2.  **Framework Preset**: **Other**
3.  The `vercel.json` in the `backend` folder will handle routing.
4.  Add the same Environment Variables as Render.

---
*Happy Hosting!*
