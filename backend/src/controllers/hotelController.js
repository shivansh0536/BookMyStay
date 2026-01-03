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
        const { city, minPrice, maxPrice, amenities, sortBy, order, limit, search } = req.query;

        // 1. Build DB Query (Base filters)
        const where = {};

        // If searching without fuzzy or for specific city
        if (city && !search) {
            where.city = { contains: city, mode: 'insensitive' };
        }

        // 2. Fetch hotels with Rooms
        let hotels = await prisma.hotel.findMany({
            where,
            include: {
                rooms: {
                    select: { pricePerNight: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Process & Filter
        hotels = hotels.map(hotel => {
            const prices = hotel.rooms.map(r => r.pricePerNight);
            const startPrice = prices.length > 0 ? Math.min(...prices) : 0;
            return {
                ...hotel,
                startPrice,
                roomCount: hotel.rooms.length,
                // Ensure rating exists for sorting
                rating: hotel.rating || 0
            };
        });

        // 4. Fuzzy Search (if search query provided)
        if (search) {
            const Fuse = require('fuse.js');
            const fuse = new Fuse(hotels, {
                keys: ['name', 'city', 'description'],
                threshold: 0.3,
                distance: 100
            });
            hotels = fuse.search(search).map(result => result.item);
        }

        // 5. Secondary Filtering (Price & Amenities)
        hotels = hotels.filter(hotel => {
            if (minPrice && hotel.startPrice < parseFloat(minPrice)) return false;
            if (maxPrice && hotel.startPrice > parseFloat(maxPrice)) return false;

            if (amenities && amenities.length > 0) {
                let requiredAmenities = Array.isArray(amenities) ? amenities : [amenities];
                requiredAmenities = requiredAmenities.map(a => a.trim().toLowerCase());

                const hotelAmenities = (hotel.amenities || []).map(a => a.toLowerCase());
                const hasAll = requiredAmenities.every(req =>
                    hotelAmenities.some(av => av.includes(req))
                );
                if (!hasAll) return false;
            }
            return true;
        });

        // 6. Advanced Sorting
        if (sortBy === 'best-value') {
            // "Best Value" Calculation: High Rating + Low Price
            // Normalize values for comparison
            const maxPriceVal = Math.max(...hotels.map(h => h.startPrice), 1);
            const minPriceVal = Math.min(...hotels.map(h => h.startPrice), 0);

            hotels.sort((a, b) => {
                const getScore = (h) => {
                    const priceScore = maxPriceVal === minPriceVal ? 100 : 100 - ((h.startPrice - minPriceVal) / (maxPriceVal - minPriceVal) * 100);
                    const ratingScore = (h.rating / 5) * 100;
                    return (ratingScore * 0.7) + (priceScore * 0.3); // 70% weight on rating, 30% on price
                };
                return getScore(b) - getScore(a);
            });
        } else if (sortBy === 'price') {
            hotels.sort((a, b) => {
                return order === 'asc' ? a.startPrice - b.startPrice : b.startPrice - a.startPrice;
            });
        } else if (sortBy === 'rating') {
            hotels.sort((a, b) => b.rating - a.rating);
        }

        // 7. Pagination
        const page = parseInt(req.query.page) || 1;
        const limitInt = parseInt(limit) || 10;
        const startIndex = (page - 1) * limitInt;
        const total = hotels.length;
        const paginatedHotels = hotels.slice(startIndex, startIndex + limitInt);

        res.json({
            data: paginatedHotels,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limitInt)
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
