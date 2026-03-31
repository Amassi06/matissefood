const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/prizes — List all prizes (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const prizes = await prisma.prize.findMany({
            orderBy: { tier: 'asc' }
        });

        res.json({ prizes });
    } catch (err) {
        console.error('List prizes error:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des lots.' });
    }
});

// PUT /api/prizes/:id — Update a prize (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, probability, isActive } = req.body;

        const updateData = {};
        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (!trimmedName || trimmedName.length > 100) {
                return res.status(400).json({ error: 'Le nom doit contenir entre 1 et 100 caractères.' });
            }
            updateData.name = trimmedName;
        }
        if (description !== undefined) updateData.description = String(description).trim().slice(0, 500);
        if (probability !== undefined) {
            const prob = parseFloat(probability);
            if (isNaN(prob) || prob < 0 || prob > 100) {
                return res.status(400).json({ error: 'La probabilité doit être entre 0 et 100.' });
            }
            updateData.probability = prob;
        }
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const prize = await prisma.prize.update({
            where: { id },
            data: updateData
        });

        res.json({ prize });
    } catch (err) {
        console.error('Update prize error:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du lot.' });
    }
});

// POST /api/prizes — Create a new prize (admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, probability, tier } = req.body;

        const trimmedName = name ? String(name).trim() : '';
        if (!trimmedName || trimmedName.length > 100) {
            return res.status(400).json({ error: 'Le nom doit contenir entre 1 et 100 caractères.' });
        }
        if (probability === undefined || probability === null) {
            return res.status(400).json({ error: 'Probabilité requise.' });
        }
        const prob = parseFloat(probability);
        if (isNaN(prob) || prob < 0 || prob > 100) {
            return res.status(400).json({ error: 'La probabilité doit être entre 0 et 100.' });
        }
        if (!tier) {
            return res.status(400).json({ error: 'Nom, probabilité et niveau requis.' });
        }

        const validTiers = ['LOSS', 'SMALL', 'MEDIUM', 'JACKPOT'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({ error: 'Niveau invalide (LOSS, SMALL, MEDIUM, JACKPOT).' });
        }

        const prize = await prisma.prize.create({
            data: {
                name: trimmedName,
                description: description ? String(description).trim().slice(0, 500) : '',
                probability: prob,
                tier
            }
        });

        res.json({ prize });
    } catch (err) {
        console.error('Create prize error:', err);
        res.status(500).json({ error: 'Erreur lors de la création du lot.' });
    }
});

module.exports = router;
