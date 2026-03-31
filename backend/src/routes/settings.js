const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/settings — Get all settings (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const settings = await prisma.settings.findMany();
        const settingsMap = {};
        settings.forEach(s => { settingsMap[s.key] = s.value; });
        res.json({ settings: settingsMap });
    } catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// PUT /api/settings — Update settings (admin only)
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { settings } = req.body;

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Settings object requis.' });
        }

        const updates = Object.entries(settings).map(([key, value]) =>
            prisma.settings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            })
        );

        await Promise.all(updates);

        res.json({ success: true });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// GET /api/settings/public — Get public settings (no auth)
router.get('/public', async (req, res) => {
    try {
        const publicKeys = ['googleMapsUrl', 'engagementTimerSeconds', 'welcomeMessage', 'restaurantName'];
        const settings = await prisma.settings.findMany({
            where: { key: { in: publicKeys } }
        });
        const settingsMap = {};
        settings.forEach(s => { settingsMap[s.key] = s.value; });
        res.json({ settings: settingsMap });
    } catch (err) {
        console.error('Get public settings error:', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;
