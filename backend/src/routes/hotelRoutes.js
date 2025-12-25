const express = require('express');
const {
    createHotel,
    getAllHotels,
    getMyHotels,
    getHotelById,
    updateHotel,
    deleteHotel
} = require('../controllers/hotelController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Owner Routes
router.post('/', authenticateToken, authorizeRoles('OWNER', 'ADMIN'), createHotel);
router.get('/my/hotels', authenticateToken, authorizeRoles('OWNER'), getMyHotels);

// Public Routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);


// Owner/Admin Routes
router.patch('/:id', authenticateToken, authorizeRoles('OWNER', 'ADMIN'), updateHotel);
router.delete('/:id', authenticateToken, authorizeRoles('OWNER', 'ADMIN'), deleteHotel);

module.exports = router;
