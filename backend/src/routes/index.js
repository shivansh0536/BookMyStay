const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/hotels', require('./hotelRoutes'));

router.use('/', require('./bookingRoutes')); // Mounted at root as it defines its own paths



// Placeholder routes
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to BookMyStay API' });
});

module.exports = router;
