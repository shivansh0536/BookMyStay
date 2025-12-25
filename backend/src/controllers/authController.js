const { z } = require('zod');
const prisma = require('../prisma');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

// Zod Schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum(['CUSTOMER', 'OWNER']).optional(), // Admin not creatable via public API
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const register = async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(data.password);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role || 'CUSTOMER',
            },
        });

        const token = generateToken(user.id, user.role);

        // Exclude password from response
        const { password, ...userWithoutPassword } = user;

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await comparePassword(data.password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        // Basic validation - ideally use Zod
        if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== req.user.userId) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: { name, email }
        });

        const { password, ...userWithoutPassword } = updatedUser;
        res.json({ message: "Profile updated successfully", user: userWithoutPassword });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};
