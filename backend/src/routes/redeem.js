const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/redeem/lookup/code — Look up a code by its value (admin/staff only)
router.post('/lookup/code', authMiddleware, async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code requis.' });
        }

        const foundCode = await prisma.code.findUnique({
            where: { code: code.toUpperCase().trim() },
            include: { prize: true }
        });

        if (!foundCode) {
            return res.status(404).json({ error: 'Code introuvable.' });
        }

        res.json({
            id: foundCode.id,
            code: foundCode.code,
            status: foundCode.status,
            prize: foundCode.prize ? {
                name: foundCode.prize.name,
                description: foundCode.prize.description,
                tier: foundCode.prize.tier
            } : null,
            playedAt: foundCode.playedAt,
            redeemedAt: foundCode.redeemedAt
        });
    } catch (err) {
        console.error('Lookup error:', err);
        res.status(500).json({ error: 'Erreur lors de la recherche.' });
    }
});

// POST /api/redeem/:codeId — Mark a prize as redeemed (admin/staff only)
router.post('/:codeId', authMiddleware, async (req, res) => {
    try {
        const { codeId } = req.params;

        const code = await prisma.code.findUnique({
            where: { id: codeId },
            include: { prize: true }
        });

        if (!code) {
            return res.status(404).json({ error: 'Code introuvable.' });
        }

        if (code.status === 'GENERATED') {
            return res.status(400).json({ error: 'Ce code n\'a pas encore été joué.' });
        }

        if (code.status === 'REDEEMED') {
            return res.status(409).json({ error: 'Ce lot a déjà été réclamé.' });
        }

        const updated = await prisma.code.update({
            where: { id: codeId },
            data: {
                status: 'REDEEMED',
                redeemedAt: new Date()
            },
            include: { prize: true }
        });

        res.json({
            success: true,
            code: updated.code,
            prize: updated.prize ? {
                name: updated.prize.name,
                description: updated.prize.description,
                tier: updated.prize.tier
            } : null,
            redeemedAt: updated.redeemedAt
        });
    } catch (err) {
        console.error('Redeem error:', err);
        res.status(500).json({ error: 'Erreur lors de la réclamation.' });
    }
});

module.exports = router;
