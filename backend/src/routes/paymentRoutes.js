const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.post('/create-order', authenticateToken, paymentController.createOrder);
router.post('/verify', authenticateToken, paymentController.verifyPayment);
router.get('/:bookingId', authenticateToken, paymentController.getPaymentDetails);

module.exports = router;
