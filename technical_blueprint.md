# BookMyStay – Technical Blueprint & Architecture Design

**Version:** 1.0.0
**Author:** Senior Full-Stack Architect
**Date:** 2024-12-24

---

## 1. System Architecture

### 1.1 High-Level Overview
BookMyStay utilizes a layered **Client-Server Architecture** (specifically a Monolithic REST API backend with a decoupled SPA frontend). While microservices are popular, for a project of this scope (and typical interview / portfolio tier), a **Modular Monolith** is superior for maintainability, development speed, and data consistency.

### 1.2 Data Flow
1.  **Client Layer (Frontend)**: React.js SPA (Single Page Application) running in the browser. It communicates via JSON over HTTP(S).
2.  **CDN / Edge Layer**: (Vercel/Netlify) Serves static assets and caches content closer to the user.
3.  **API Gateway / Load Balancer**: (Render/Railway built-in) Routes requests to the Node.js application instance.
4.  **Application Layer (Backend)**: Express.js server handling business logic, authentication, and validation.
5.  **Data Access Layer (ORM)**: Prisma ORM abstracts SQL/MongoDB queries, providing type safety.
6.  **Persistence Layer (Database)**: MongoDB Atlas (Document Store). Chosen for flexibility in storing complex hotel attributes (amenities, policies) which vary significantly.

### 1.3 Architectural Decisions & Justification
*   **Separation of Concerns**: Frontend and Backend are deployed independently. Allows parallel development and independent scaling (e.g., scaling the API server without rebuilding the UI).
*   **Stateless Authentication**: JWTs allow the backend to be stateless. Any server instance can handle any request, which is crucial for horizontal scaling.
*   **Service-Controller-Repository Pattern**:
    *   *Controllers*: Handle HTTP requests/responses.
    *   *Services*: Contain business logic (pure JS/TS).
    *   *Repositories (Prisma)*: Direct database interactions.
    *   *Justification*: Keeps code testable and prevents "Fat Controllers".

---

## 2. Database Design (MongoDB + Prisma)

### 2.1 Schema Overview
We use a relational thinking approach applied to MongoDB.

#### Users Collection
*   **_id**: ObjectId
*   **email**: String (Unique, Indexed)
*   **password**: String (Hashed)
*   **role**: Enum (CUSTOMER, OWNER, ADMIN)
*   **profile**: Embedded Object (Name, Phone, etc.)
*   **createdAt**: DateTime

#### Hotels Collection
*   **_id**: ObjectId
*   **ownerId**: ObjectId (Ref -> Users)
*   **name**: String
*   **description**: String
*   **location**: Object (City, Address, Coordinates)
*   **amenities**: String[] (Index for search)
*   **images**: String[] (URLs)
*   **minPrice**: Float (For sorting/filtering)
*   **isVerified**: Boolean (Admin approval)

#### Rooms Collection
*   **_id**: ObjectId
*   **hotelId**: ObjectId (Ref -> Hotels)
*   **title**: String (e.g., "Deluxe Suite")
*   **type**: Enum (SINGLE, DOUBLE, SUITE)
*   **pricePerNight**: Float
*   **capacity**: Global Int
*   **roomNumbers**: String[] (e.g., ["101", "102"] - *Critical for availability*)

#### Bookings Collection
*   **_id**: ObjectId
*   **userId**: ObjectId (Ref -> Users)
*   **hotelId**: ObjectId (Ref -> Hotels)
*   **roomId**: ObjectId (Ref -> Rooms)
*   **checkIn**: DateTime (Indexed)
*   **checkOut**: DateTime (Indexed)
*   **status**: Enum (PENDING, CONFIRMED, CANCELLED, COMPLETED)
*   **totalAmount**: Float
*   **paymentStatus**: Enum (PAID, PENDING)

### 2.2 Prisma Schema Example
```prisma
model User {
  id       String    @id @default(auto()) @map("_id") @db.ObjectId
  email    String    @unique
  password String
  role     Role      @default(CUSTOMER)
  bookings Booking[]
  hotels   Hotel[]   // Only if OWNER
}

model Hotel {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  ownerId   String   @db.ObjectId
  owner     User     @relation(fields: [ownerId], references: [id])
  rooms     Room[]
  // ... other fields
}

model Room {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  hotelId   String   @db.ObjectId
  hotel     Hotel    @relation(fields: [hotelId], references: [id])
  bookings  Booking[]
  inventory Int // Total physical rooms of this type
}

model Booking {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  roomId    String   @db.ObjectId
  room      Room     @relation(fields: [roomId], references: [id])
  checkIn   DateTime
  checkOut  DateTime
  status    BookingStatus
  
  @@index([roomId, checkIn, checkOut]) // Compound index for availability
}
```

---

## 3. Authentication & Authorization

### 3.1 Strategy
*   **JWT (JSON Web Tokens)**: Used for access tokens. Short-lived (e.g., 15-60 mins).
*   **Refresh Tokens (Optional but recommended)**: Long-lived, stored in httpOnly cookies to acquire new access tokens.
*   **Bcrypt**: For password hashing. Never store plain text passwords.

### 3.2 Role-Based Access Control (RBAC) Middleware
We will implement middleware `verifyRole(roles: string[])` to protect routes.

*   `POST /api/hotels`: **Owner**, **Admin**
*   `GET /api/bookings`: **Customer** (own bookings), **Owner** (own hotel bookings), **Admin** (all)
*   `DELETE /api/users/:id`: **Admin**

### 3.3 Security Best Practices
1.  **Strict CORS**: Allow only logic frontend domain.
2.  **Rate Limiting**: `express-rate-limit` to prevent brute force.
3.  **Sanitization**: Validate all inputs (Zod or Joi) to prevent NoSQL Injection.
4.  **Helmet**: Secure HTTP headers.

---

## 4. Booking & Availability Logic (The Core Complex Logic)

### 4.1 The Overlap Problem
A room is available only if **NO** confirmed booking overlaps with the requested dates.
Mathematical condition for overlap:
`Existing_CheckIn < Requested_CheckOut AND Existing_CheckOut > Requested_CheckIn`

### 4.2 Algorithm: "Check Inventory"
1.  **Input**: `roomId`, `startDate`, `endDate`.
2.  **Count Overlaps**: Query database for *confirmed* bookings for `roomId` that overlap the dates.
3.  **Check Capacity**:
    *   Fetch `Room.inventory` (total physical rooms of this type).
    *   If `Count Overlaps` < `Room.inventory`, then **Available**.
    *   Else, **Sold Out**.

### 4.3 Concurrent Bookings (Race Conditions)
*   **Risk**: Two users book the last room at the exact same millisecond.
*   **Solution**: Database Transactions (MongoDB ReplSet required) or Atomic Updates.
    *   *Optimistic Locking*: Not ideal for high contention.
    *   *Atomic Transactions*: Use `prisma.$transaction`. Within the transaction, count existing bookings again before inserting.

### 4.4 Lifecycle State Machine
*   **Draft**: User selects room.
*   **Pending**: Payment initiated. (Inventory temporarily reserved for 10 mins via Redis or TTL index is a pro feature).
*   **Confirmed**: Payment success.
*   **Cancelled**: User/Admin trigger.
*   **Completed**: `endDate` < `Now` (Cron job updates this).

---

## 5. REST API Design

### 5.1 Standards
*   Use Standard HTTP Codes: `200` OK, `201` Created, `400` Bad Req, `401` Unauth, `403` Forbidden, `404` Not Found, `500` Server Error.
*   Consistent JSON Envelope: `{ success: true, data: { ... }, message: "..." }`

### 5.2 Key Endpoints

#### Search & Filter
`GET /api/hotels?city=Paris&checkIn=2024-12-01&checkOut=2024-12-05&guests=2`
*   **Logic**: Must filter out hotels where no rooms are available for these dates. This requires an aggregation pipeline ($lookup) or a two-step query (Find available room IDs -> Find hotels).

#### Booking
`POST /api/bookings`
*   **Body**: `{ roomId, checkIn, checkOut, guestDetails }`
*   **Header**: `Authorization: Bearer <token>`
*   **Response**: `201 Created` with Booking ID.

#### Management
`PATCH /api/hotels/:id/rooms/:roomId`
*   **Restricted**: Owner/Admin only.
*   **Body**: `{ pricePerNight: 150 }`

---

## 6. Frontend Architecture (React.js)

### 6.1 Folder Structure (Feature-First)
```
src/
  features/
    auth/         (Login, Register, context)
    hotels/       (Search, HotelCard, HotelDetails)
    bookings/     (Checkout, History)
    admin/        (Dashboard)
  components/
    ui/           (Button, Input, Modal - Generic)
    layout/       (Navbar, Footer, Sidebar)
  services/       (api.js, axios setup)
  context/        (AuthContext, ToastContext)
  pages/          (Home, SearchResults, HotelView)
  App.jsx         (Router)
```

### 6.2 State Management
*   **Server State**: `React Query` (TanStack Query) is highly recommended over Redux for data fetching. It handles caching, loading, and error states out of the box.
*   **Client State**: React `Context API` + `useReducer` for Auth user session and Theme.

### 6.3 Routing (React Router v6)
*   **PublicRoutes**: `/`, `/search`, `/hotel/:id`
*   **ProtectedRoutes**:
    *   Wraps specific components. Checks `AuthContext`.
    *   `/booking/checkout` (LoggedIn User)
    *   `/owner/dashboard` (Role=OWNER)
    *   `/admin` (Role=ADMIN)

---

## 7. Deployment & Environment

### 7.1 Backend (Render/Railway)
*   **Procfile**: `web: node index.js`
*   **Environment Variables**:
    *   `DATABASE_URL`: MongoDB Connection String.
    *   `JWT_SECRET`: High entropy random string.
    *   `NODE_ENV`: production.

### 7.2 Frontend (Vercel)
*   **Build Command**: `npm run build`
*   **Output Dir**: `dist`
*   **Env Variables**:
    *   `VITE_API_URL`: `https://api.bookmystay.com`

---

## 8. Resume & Interview Perspective

### 8.1 Why this stands out
*   **Complexity**: Handling *overlapping date logic* is significantly harder than a simple CRUD blog or e-commerce cart. It shows algorithmic thinking.
*   **Completeness**: Full auth + Role-based limits + Admin Dashboard shows "Product Engineering" mindset, not just "Code Snippet" mindset.
*   **Scalability Awareness**: Mentions of Indexing, Transactions, and Separation of Concerns indicate Senior/Architect potential.

### 8.2 How to explain it in an interview
> "I built BookMyStay to challenge myself with time-temporal data problems. The hardest part was ensuring zero double-bookings under concurrency. I solved this by using MongoDB transactions to lock the read-check-write cycle. I also architected the system to separate the 'Marketing' view (Search) from the 'Transactional' core (Booking) to optimize read performance."

### 8.3 Recruiters look for:
1.  **Clean Code**: Modular structure.
2.  **Error Handling**: Not crashing on bad input.
3.  **Database Indexing**: Showing you care about speed.
4.  **Type Safety**: Using Joi/Zod or TypeScript (optional but good).
