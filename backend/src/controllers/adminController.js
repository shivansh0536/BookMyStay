const prisma = require('../prisma');
const { logAction } = require('../utils/logger');

// Get System Stats
const getStats = async (req, res) => {
    try {
        const [userCount, hotelCount, bookingCount] = await Promise.all([
            prisma.user.count(),
            prisma.hotel.count(),
            prisma.booking.count()
        ]);

        res.json({
            users: userCount,
            hotels: hotelCount,
            bookings: bookingCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Manual Cascade Deletion for MongoDB/Prisma
        await prisma.$transaction(async (tx) => {
            // 1. Delete all bookings made by the user
            await tx.booking.deleteMany({ where: { userId: id } });

            // 2. Delete all saved hotel entries for the user
            await tx.savedHotel.deleteMany({ where: { userId: id } });

            // 3. Delete all audit logs where the user is the actor
            await tx.auditLog.deleteMany({ where: { userId: id } });

            // 4. Handle hotels owned by the user (if any)
            const ownedHotels = await tx.hotel.findMany({ where: { ownerId: id }, select: { id: true } });
            const ownedHotelIds = ownedHotels.map(h => h.id);

            if (ownedHotelIds.length > 0) {
                // Delete bookings for these hotels
                await tx.booking.deleteMany({ where: { hotelId: { in: ownedHotelIds } } });
                // Delete saved hotel entries for these hotels
                await tx.savedHotel.deleteMany({ where: { hotelId: { in: ownedHotelIds } } });
                // Delete rooms for these hotels
                await tx.room.deleteMany({ where: { hotelId: { in: ownedHotelIds } } });
                // Finally delete the hotels
                await tx.hotel.deleteMany({ where: { ownerId: id } });
            }

            // 5. Finally delete the user
            await tx.user.delete({ where: { id } });
        });

        // Log the admin action
        await logAction(req.user.userId, 'USER_DELETED', `Deleted user ${id} and all related data`, id);

        res.json({ message: 'User and all related data deleted successfully' });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
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

// Update User Role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['CUSTOMER', 'OWNER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        // Log it
        await logAction(req.user.userId, 'ROLE_UPDATED', `Updated user ${updatedUser.email} role to ${role}`, id);

        res.json({ message: 'User role updated', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Revenue Analytics (Last 30 Days)
const getAnalytics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const bookings = await prisma.booking.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: 'CONFIRMED'
            },
            select: {
                createdAt: true,
                totalPrice: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Aggregate by date
        const revenueMap = {};

        // Initialize last 30 days with 0
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
            revenueMap[dateStr] = 0;
        }

        bookings.forEach(booking => {
            const dateStr = booking.createdAt.toISOString().split('T')[0];
            if (revenueMap[dateStr] !== undefined) {
                revenueMap[dateStr] += booking.totalPrice;
            }
        });

        // Convert to array for Chart
        const chartData = Object.keys(revenueMap)
            .sort() // Sort by date asc
            .map(date => ({
                date,
                revenue: revenueMap[date]
            }));

        res.json(chartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Audit Logs
const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                actor: { select: { name: true, email: true, role: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to last 100 actions for now
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Verify/Unverify Hotel
const verifyHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        const updatedHotel = await prisma.hotel.update({
            where: { id },
            data: { isVerified },
        });

        // Log it
        await logAction(req.user.userId, 'HOTEL_VERIFICATION_UPDATED', `Updated hotel ${updatedHotel.name} verification for ${id} to ${isVerified}`, id);

        res.json({ message: `Hotel verification status updated to ${isVerified}`, hotel: updatedHotel });
    } catch (error) {
        console.error("Verify Hotel Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getStats, getAllUsers, deleteUser, getAllBookings, updateUserRole, getAnalytics, getAuditLogs, verifyHotel };
