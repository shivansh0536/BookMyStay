const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../prisma');

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment variables');
}

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID ? 'Key ID present' : 'Key ID missing');

/**
 * Create Razorpay order for a booking
 */
const createOrder = async (req, res) => {
    console.log('\n=== CREATE ORDER REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    console.log('===========================\n');

    try {
        const { bookingId } = req.body;
        const userId = req.user.userId;

        // Get booking details
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                hotel: true,
                room: true,
                user: true
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify booking belongs to user
        if (booking.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Check if already paid
        if (booking.paymentStatus === 'SUCCEEDED') {
            return res.status(400).json({ message: 'Booking already paid' });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(booking.totalPrice * 100), // Amount in paise
            currency: 'INR',
            receipt: `booking_${bookingId}`,
            notes: {
                bookingId: bookingId,
                userId: userId,
                hotelName: booking.hotel.name,
                roomType: booking.room.type,
                checkIn: booking.checkIn.toISOString(),
                checkOut: booking.checkOut.toISOString()
            }
        });

        // Update booking with order ID
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                razorpayOrderId: order.id,
                paymentStatus: 'PROCESSING'
            }
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            booking: {
                id: booking.id,
                hotelName: booking.hotel.name,
                roomType: booking.room.type,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                totalPrice: booking.totalPrice
            }
        });
    } catch (error) {
        console.error('=== Create order error ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.error) {
            console.error('Razorpay error details:', error.error);
        }
        console.error('=========================');

        res.status(500).json({
            message: 'Failed to create order',
            error: error.message,
            details: error.error || 'No additional details'
        });
    }
};

/**
 * Verify Razorpay payment signature
 */
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        const userId = req.user.userId;

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify booking belongs to user
        if (booking.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Verify order ID matches
        if (booking.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: 'Order ID mismatch' });
        }

        // Verify signature
        const text = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Update booking as failed
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStatus: 'FAILED'
                }
            });

            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Update booking with payment details
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: 'SUCCEEDED',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                paymentMethod: payment.method,
                paidAt: new Date(),
                status: 'CONFIRMED'
            },
            include: {
                hotel: true,
                room: true
            }
        });

        res.json({
            message: 'Payment verified successfully',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};

/**
 * Get payment details for a booking
 */
const getPaymentDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userId;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                paymentStatus: true,
                razorpayOrderId: true,
                razorpayPaymentId: true,
                paymentMethod: true,
                paidAt: true,
                totalPrice: true,
                userId: true
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify booking belongs to user (or user is admin)
        if (booking.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({ message: 'Failed to get payment details' });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentDetails
};
