# BookMyStay - Hotel & Room Booking Platform

Welcome to **BookMyStay**, a full-stack hotel and room booking platform designed to replicate features of major platforms like Booking.com or Airbnb.

## Project Overview
BookMyStay supports three distinct user roles:
- **Customers**: Search, view, and book hotels and rooms.
- **Hotel Owners**: Manage their hotels and rooms, view bookings.
- **Administrators**: Overlook the entire system, manage users, hotels, and view analytics.

## Technology Stack
- **Frontend**: React.js, Tailwind CSS, Vite, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Prisma ORM
- **Authentication**: JWT, Bcrypt
- **Payment**: Razorpay Integration

## Key Features
- Dynamic Hotel Search and Filtering
- Secure Authentication and Authorization
- Role-based Access Control (Admin, Owner, Customer)
- Real-time Booking and Payment Flow
- Admin Dashboard with Analytics and Audit Logs
- Wishlist functionality for Customers

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- Razorpay API Keys (for payments)

### Steps
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd BookMyStay
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

## API Documentation

### Auth Endpoints (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Login and receive a JWT.
- `GET /me`: Get current user profile (Auth required).
- `PUT /me`: Update user profile (Auth required).
- `PATCH /me/password`: Update user password (Auth required).

### Admin Endpoints (`/api/admin`) - (Admin Role Required)
- `GET /stats`: Get system-wide statistics.
- `GET /analytics`: Get booking and user analytics.
- `GET /audit-logs`: View system audit logs.
- `GET /users`: List all users.
- `GET /bookings`: List all bookings in the system.
- `PATCH /users/:id/role`: Update a user's role.
- `DELETE /users/:id`: Delete a user (Cascade delete enabled).
- `PATCH /hotels/:id/verify`: Toggle hotel verification status.

### Hotel Endpoints (`/api/hotels`)
- `GET /`: Get all hotels (Public).
- `GET /:id`: Get hotel details by ID (Public).
- `POST /`: Create a new hotel (Owner/Admin required).
- `GET /my/hotels`: Get hotels owned by the current user (Owner required).
- `PATCH /:id`: Update hotel details (Owner/Admin required).
- `DELETE /:id`: Delete a hotel (Owner/Admin required).

### Room & Booking Endpoints (`/api`)
- `GET /hotels/:hotelId/rooms`: Get all rooms for a specific hotel (Public).
- `POST /rooms`: Create a new room (Owner/Admin required).
- `POST /bookings`: Create a new booking (Customer required).
- `GET /bookings/my-bookings`: Get bookings for the current user (Customer required).
- `GET /bookings/owner`: Get bookings for owned hotels (Owner required).
- `PATCH /bookings/:id/cancel`: Cancel a booking (Auth required).

### User Endpoints (`/api/users`)
- `POST /saved-hotels/toggle`: Add/Remove a hotel from wishlist (Auth required).
- `GET /saved-hotels`: Get user's wishlist (Auth required).

### Payment Endpoints (`/api/payments`) - (Auth Required)
- `POST /create-order`: Create a Razorpay order for a booking.
- `POST /verify`: Verify Razorpay payment signature.
- `GET /:bookingId`: Get payment details for a specific booking.

---
*Developed with focus on scalability and modern UI/UX.*
