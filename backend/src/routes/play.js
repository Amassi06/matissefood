const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { spinWheel } = require('../services/spinService');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/play/validate — Validate a code (public)
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || code.length < 3 || code.length > 10) {
            return res.status(400).json({ error: 'Code invalide.' });
        }

        const normalizedCode = code.toUpperCase().trim();

        const foundCode = await prisma.code.findUnique({
            where: { code: normalizedCode }
        });

        if (!foundCode) {
            return res.status(404).json({ error: 'Code introuvable. Veuillez vérifier votre ticket.' });
        }

        if (foundCode.status !== 'GENERATED') {
            return res.status(409).json({ error: 'Ce code a déjà été utilisé.' });
        }

        // Return only what the client needs — no probabilities, no prize data
        res.json({
            valid: true,
            codeId: foundCode.id,
            message: 'Code valide ! Prêt à jouer.'
        });
    } catch (err) {
        console.error('Validate error:', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// POST /api/play/spin — Spin the wheel (public, requires valid codeId)
router.post('/spin', async (req, res) => {
    try {
        const { codeId } = req.body;

        if (!codeId) {
            return res.status(400).json({ error: 'Code ID requis.' });
        }

        const result = await spinWheel(codeId);

        // Return the result — the frontend just displays it
        res.json({
            success: true,
            result
        });
    } catch (err) {
        console.error('Spin error:', err);

        if (err.message.includes('introuvable') || err.message.includes('utilisé') || err.message.includes('configuré')) {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// GET /api/play/prizes — Get prize names only for wheel display (public)
router.get('/prizes', async (req, res) => {
    try {
        const prizes = await prisma.prize.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                tier: true
                // NO probability exposed!
            }
        });

        res.json({ prizes });
    } catch (err) {
        console.error('Get prizes error:', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;
