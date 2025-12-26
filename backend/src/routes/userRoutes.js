const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/saved-hotels/toggle', authenticateToken, userController.toggleSavedHotel);
router.get('/saved-hotels', authenticateToken, userController.getSavedHotels);

module.exports = router;
