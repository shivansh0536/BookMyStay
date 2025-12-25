const { z } = require('zod');
const prisma = require('../prisma');

const bookingSchema = z.object({
    roomId: z.string(),
    checkIn: z.string().datetime(), // ISO Date String
    checkOut: z.string().datetime(),
    guestCount: z.number().min(1),
});

const createBooking = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut } = bookingSchema.parse(req.body);
        const userId = req.user.userId;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({ message: "Check-out must be after check-in" });
        }

        // 1. Fetch Room details to check generic availability logic
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { hotel: true }
        });
        if (!room) return res.status(404).json({ message: "Room not found" });

        // 2. CHECK AVAILABILITY (The Overlap Algorithm)
        // Find confirmed bookings that overlap with the requested dates
        const existingBookingsCount = await prisma.booking.count({
            where: {
                roomId: roomId,
                status: { in: ['CONFIRMED', 'PENDING'] }, // Count pending too to be safe
                OR: [
                    {
                        // Case 1: Existing CheckIn is inside requested range
                        checkIn: {
                            gte: checkInDate,
                            lt: checkOutDate,
                        },
                    },
                    {
                        // Case 2: Existing CheckOut is inside requested range
                        checkOut: {
                            gt: checkInDate,
                            lte: checkOutDate,
                        },
                    },
                    {
                        // Case 3: Existing booking completely engulfs requested range
                        checkIn: { lte: checkInDate },
                        checkOut: { gte: checkOutDate },
                    },
                ],
            },
        });

        if (existingBookingsCount >= room.inventory) {
            return res.status(409).json({ message: "Room not available for these dates" });
        }

        // 3. Calculate Total Price
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * room.pricePerNight;

        // 4. Create Booking
        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId,
                hotelId: room.hotelId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                totalPrice,
                status: 'CONFIRMED', // Auto-confirm for this MVP (usually would be PENDING -> Payment)
            },
        });

        res.status(201).json({ message: "Booking confirmed", booking });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.userId },
            include: { hotel: true, room: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getOwnerBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                hotel: {
                    ownerId: req.user.userId
                }
            },
            include: {
                user: { select: { name: true, email: true } },
                hotel: { select: { name: true, city: true } },
                room: { select: { title: true, type: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createBooking, getMyBookings, getOwnerBookings };
