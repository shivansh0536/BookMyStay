const express = require('express');
const { getStats, getAllUsers, deleteUser, getAllBookings, updateUserRole, getAnalytics, getAuditLogs, verifyHotel } = require('../controllers/adminController');
// ... other imports unchanged
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require ADMIN role
router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/stats', getStats);
router.get('/analytics', getAnalytics); // New Analytics Route
router.get('/audit-logs', getAuditLogs); // Audit Logs
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.patch('/hotels/:id/verify', verifyHotel);

module.exports = router;
