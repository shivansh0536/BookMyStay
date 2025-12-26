const { z } = require('zod');
const prisma = require('../prisma');

// Zod Schemas
const hotelSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    city: z.string().min(2),
    address: z.string().min(5),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
});

const updateHotelSchema = hotelSchema.partial();

const createHotel = async (req, res) => {
    try {
        const data = hotelSchema.parse(req.body);

        const hotel = await prisma.hotel.create({
            data: {
                ...data,
                ownerId: req.user.userId,
            },
        });

        res.status(201).json({ message: 'Hotel created successfully', hotel });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMyHotels = async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany({
            where: { ownerId: req.user.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllHotels = async (req, res) => {
    try {
        const { city, minPrice, maxPrice, amenities, sortBy, order, limit } = req.query;

        // 1. Build DB Query
        const where = {};
        if (city) {
            where.OR = [
                { city: { contains: city, mode: 'insensitive' } },
                { name: { contains: city, mode: 'insensitive' } }, // Search by name too
                { address: { contains: city, mode: 'insensitive' } }
            ];
        }

        // 2. Fetch all matching hotels with Rooms to calculate price
        // Note: For large datasets, we would aggregate or use raw query. For <1000 items, in-memory is fast.
        let hotels = await prisma.hotel.findMany({
            where,
            include: {
                rooms: {
                    select: { pricePerNight: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Process & Filter In-Memory
        hotels = hotels.map(hotel => {
            const prices = hotel.rooms.map(r => r.pricePerNight);
            const startPrice = prices.length > 0 ? Math.min(...prices) : 0;
            return { ...hotel, startPrice, roomCount: hotel.rooms.length };
        }).filter(hotel => {
            // Price Filter
            if (minPrice && hotel.startPrice < parseFloat(minPrice)) return false;
            if (maxPrice && hotel.startPrice > parseFloat(maxPrice)) return false;

            // Amenities Filter (AND logic: must have all selected)
            if (amenities && amenities.length > 0) {
                let requiredAmenities = [];
                if (Array.isArray(amenities)) {
                    requiredAmenities = amenities.map(a => a.trim().toLowerCase());
                } else if (typeof amenities === 'string') {
                    requiredAmenities = amenities.split(',').map(a => a.trim().toLowerCase());
                }

                if (requiredAmenities.length > 0) {
                    const hotelAmenities = (hotel.amenities || []).map(a => a.toLowerCase());
                    const hasAll = requiredAmenities.every(req =>
                        hotelAmenities.some(av => av.includes(req))
                    );
                    if (!hasAll) return false;
                }
            }

            // Must have rooms (optional, but good for UX)
            // if (hotel.roomCount === 0) return false; 

            return true;
        });

        // 4. Sorting
        if (sortBy === 'price') {
            hotels.sort((a, b) => {
                return order === 'asc' ? a.startPrice - b.startPrice : b.startPrice - a.startPrice;
            });
        }
        // 'newest' is default from DB fetch, but good to keep if re-sorting needed

        // 5. Pagination
        const page = parseInt(req.query.page) || 1;
        const limitInt = parseInt(limit) || 10;
        const startIndex = (page - 1) * limitInt;

        const total = hotels.length;
        const totalPages = Math.ceil(total / limitInt);

        const paginatedHotels = hotels.slice(startIndex, startIndex + limitInt);

        res.json({
            data: paginatedHotels,
            pagination: {
                total,
                page,
                totalPages,
                hasMinPrice: !!minPrice,
                hasMaxPrice: !!maxPrice
            }
        });
    } catch (error) {
        console.error("Filter Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getHotelById = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await prisma.hotel.findUnique({
            where: { id },
            include: { rooms: true }, // Include rooms when viewing details
        });

        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existingHotel = await prisma.hotel.findUnique({ where: { id } });
        if (!existingHotel) return res.status(404).json({ message: 'Hotel not found' });

        if (existingHotel.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this hotel' });
        }

        const data = updateHotelSchema.parse(req.body);

        const updatedHotel = await prisma.hotel.update({
            where: { id },
            data,
        });

        res.json({ message: 'Hotel updated', hotel: updatedHotel });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;

        const existingHotel = await prisma.hotel.findUnique({ where: { id } });
        if (!existingHotel) return res.status(404).json({ message: 'Hotel not found' });

        if (existingHotel.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this hotel' });
        }

        // Manual Cascade Deletion
        await prisma.$transaction(async (tx) => {
            // 1. Delete all bookings for this hotel
            await tx.booking.deleteMany({ where: { hotelId: id } });

            // 2. Delete all saved entries for this hotel
            await tx.savedHotel.deleteMany({ where: { hotelId: id } });

            // 3. Delete all rooms for this hotel
            await tx.room.deleteMany({ where: { hotelId: id } });

            // 4. Finally delete the hotel
            await tx.hotel.delete({ where: { id } });
        });

        res.json({ message: 'Hotel and all related data deleted successfully' });
    } catch (error) {
        console.error("Delete Hotel Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createHotel,
    getMyHotels,
    getAllHotels,
    getHotelById,
    updateHotel,
    deleteHotel
};
