const express = require('express');
const { createRoom, getRoomsByHotel } = require('../controllers/roomController');
const { createBooking, getMyBookings, getOwnerBookings, cancelBooking } = require('../controllers/bookingController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// -- ROOMS --
// Public: Get rooms for a hotel
router.get('/hotels/:hotelId/rooms', getRoomsByHotel);
// Owner: Create room
router.post('/rooms', authenticateToken, authorizeRoles('OWNER', 'ADMIN'), createRoom);

// -- BOOKINGS --
// Customer: Create booking
router.post('/bookings', authenticateToken, createBooking);
// Customer: Get my bookings
router.get('/bookings/my-bookings', authenticateToken, getMyBookings);
// Owner: Get bookings for my hotels
router.get('/bookings/owner', authenticateToken, authorizeRoles('OWNER'), getOwnerBookings);
// Customer: Cancel booking
router.patch('/bookings/:id/cancel', authenticateToken, cancelBooking);

module.exports = router;
