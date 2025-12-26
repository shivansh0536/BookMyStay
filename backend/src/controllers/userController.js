const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const toggleSavedHotel = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { hotelId } = req.body;

        if (!hotelId) {
            return res.status(400).json({ message: "Hotel ID is required" });
        }

        const existing = await prisma.savedHotel.findUnique({
            where: {
                userId_hotelId: {
                    userId,
                    hotelId
                }
            }
        });

        if (existing) {
            // Remove
            await prisma.savedHotel.delete({
                where: {
                    id: existing.id
                }
            });
            return res.status(200).json({ message: "Removed from saved hotels", isSaved: false });
        } else {
            // Add
            await prisma.savedHotel.create({
                data: {
                    userId,
                    hotelId
                }
            });
            return res.status(200).json({ message: "Added to saved hotels", isSaved: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to toggle saved hotel" });
    }
};

const getSavedHotels = async (req, res) => {
    try {
        const userId = req.user.userId;
        const saved = await prisma.savedHotel.findMany({
            where: { userId },
            include: {
                hotel: true
            }
        });
        res.status(200).json(saved.map(s => s.hotel));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch saved hotels" });
    }
};

module.exports = {
    toggleSavedHotel,
    getSavedHotels
};
