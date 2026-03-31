require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const codesRoutes = require('./routes/codes');
const prizesRoutes = require('./routes/prizes');
const playRoutes = require('./routes/play');
const redeemRoutes = require('./routes/redeem');
const statsRoutes = require('./routes/stats');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

const playLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { error: 'Trop de tentatives, veuillez patienter.' }
});

app.use('/api/', apiLimiter);
app.use('/api/play/', playLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/codes', codesRoutes);
app.use('/api/prizes', prizesRoutes);
app.use('/api/play', playRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
    console.log(`🎰 Roue de la Fortune API running on port ${PORT}`);
});

module.exports = app;
