const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'https://book-my-stay-sigma.vercel.app' // Fallback for the current deployment
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logging for debugging
app.use((req, res, next) => {
    if (req.path.includes('/payments/')) {
        console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
        console.log('Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
    }
    next();
});

// Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

module.exports = app;
