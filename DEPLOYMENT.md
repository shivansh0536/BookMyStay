# Deployment Guide: Render

This guide explains how to deploy the **BookMyStay** application on Render.

## 1. Backend Deployment (Web Service)

1.  **Create a New Web Service**:
    -   Connect your GitHub repository.
    -   Set **Name**: `bookmstay-api` (or preferred).
    -   Set **Root Directory**: `backend`
    -   Set **Environment**: `Node`
    -   Set **Build Command**: `npm install && npx prisma generate`
    -   Set **Start Command**: `npm start`

2.  **Environment Variables**:
    Add the following in the Render dashboard:
    -   `DATABASE_URL`: Your MongoDB connection string.
    -   `JWT_SECRET`: A secure random string for token signing.
    -   `RAZORPAY_KEY_ID`: Your Razorpay Key ID.
    -   `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
    -   `NODE_ENV`: `production`

---

## 2. Frontend Deployment (Static Site)

1.  **Create a New Static Site**:
    -   Connect your GitHub repository.
    -   Set **Name**: `bookmstay-frontend` (or preferred).
    -   Set **Root Directory**: `frontend`
    -   Set **Build Command**: `npm install && npm run build`
    -   Set **Publish Directory**: `dist`

2.  **Environment Variables**:
    Add the following in the Render dashboard:
    -   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://bookmstay-api.onrender.com/api`).
    -   `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID (same as backend).

---

## 3. Post-Deployment Steps

1.  **Database Access**:
    -   Ensure your MongoDB Atlas cluster allows connections from Render's IP addresses (or whitelist `0.0.0.0/0` for testing).

2.  **CORS Configuration**:
    -   If you encounter CORS issues, update the backend `app.js` to include your frontend URL in the allowed origins.

3.  **Client-Side Routing**:
    -   For React Router to work correctly on Render Static Sites, go to the **Redirects/Rewrites** tab in the Render dashboard and add:
        -   **Source**: `/*`
        -   **Destination**: `/index.html`
        -   **Action**: `Rewrite`

---
*Happy Hosting!*
