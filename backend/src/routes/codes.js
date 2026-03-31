const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate a unique short code (e.g., M4X9)
function generateShortCode(length = 4) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
    let code = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return code;
}

// POST /api/codes/generate — Generate N unique codes (admin only)
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { count = 10 } = req.body;
        const numCodes = Math.min(Math.max(1, parseInt(count)), 500);

        const codes = [];
        let attempts = 0;
        const maxAttempts = numCodes * 10;

        while (codes.length < numCodes && attempts < maxAttempts) {
            attempts++;
            const code = generateShortCode();

            try {
                const created = await prisma.code.create({ data: { code } });
                codes.push(created);
            } catch (e) {
                // P2002 = unique constraint violation — collision, just retry
                if (e.code !== 'P2002') throw e;
            }
        }

        res.json({
            generated: codes.length,
            codes: codes.map(c => ({
                id: c.id,
                code: c.code,
                status: c.status,
                createdAt: c.createdAt
            }))
        });
    } catch (err) {
        console.error('Code generation error:', err);
        res.status(500).json({ error: 'Erreur lors de la génération des codes.' });
    }
});

// GET /api/codes — List codes with optional filters (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) {
            where.status = status.toUpperCase();
        }

        const [codes, total] = await Promise.all([
            prisma.code.findMany({
                where,
                include: { prize: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.code.count({ where })
        ]);

        res.json({
            codes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('List codes error:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des codes.' });
    }
});

module.exports = router;
