const { z } = require('zod');
const prisma = require('../prisma');

const roomSchema = z.object({
    hotelId: z.string(),
    title: z.string().min(2),
    type: z.enum(['Single', 'Double', 'Suite']),
    pricePerNight: z.number().positive(),
    capacity: z.number().int().positive(),
    inventory: z.number().int().nonnegative(),
});

const createRoom = async (req, res) => {
    try {
        const { hotelId } = req.body;

        // Verify ownership
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });
        if (hotel.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: "Not authorized to add rooms to this hotel" });
        }

        const data = roomSchema.parse(req.body);

        const room = await prisma.room.create({
            data
        });

        res.status(201).json(room);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const rooms = await prisma.room.findMany({ where: { hotelId } });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createRoom, getRoomsByHotel };
