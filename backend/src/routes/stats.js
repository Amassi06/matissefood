const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/stats — Dashboard statistics (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [
            totalCodes,
            generatedCodes,
            playedCodes,
            redeemedCodes,
            prizeDistribution,
            recentActivity
        ] = await Promise.all([
            prisma.code.count(),
            prisma.code.count({ where: { status: 'GENERATED' } }),
            prisma.code.count({ where: { status: 'PLAYED' } }),
            prisma.code.count({ where: { status: 'REDEEMED' } }),
            prisma.code.groupBy({
                by: ['prizeId'],
                where: { status: { in: ['PLAYED', 'REDEEMED'] } },
                _count: true
            }),
            prisma.code.findMany({
                where: { status: { not: 'GENERATED' } },
                include: { prize: true },
                orderBy: { playedAt: 'desc' },
                take: 20
            })
        ]);

        // Get prize details for distribution
        const prizeIds = prizeDistribution.map(d => d.prizeId).filter(Boolean);
        const prizes = await prisma.prize.findMany({
            where: { id: { in: prizeIds } }
        });

        const distribution = prizeDistribution.map(d => {
            const prize = prizes.find(p => p.id === d.prizeId);
            return {
                prizeName: prize ? prize.name : 'Inconnu',
                prizeTier: prize ? prize.tier : 'UNKNOWN',
                count: d._count
            };
        });

        const usedCodes = playedCodes + redeemedCodes;
        const conversionRate = totalCodes > 0 ? ((usedCodes / totalCodes) * 100).toFixed(1) : 0;
        const redemptionRate = usedCodes > 0 ? ((redeemedCodes / usedCodes) * 100).toFixed(1) : 0;

        res.json({
            overview: {
                totalCodes,
                generatedCodes,
                playedCodes,
                redeemedCodes,
                conversionRate: parseFloat(conversionRate),
                redemptionRate: parseFloat(redemptionRate)
            },
            distribution,
            recentActivity: recentActivity.map(a => ({
                code: a.code,
                status: a.status,
                prize: a.prize ? a.prize.name : null,
                prizeTier: a.prize ? a.prize.tier : null,
                playedAt: a.playedAt,
                redeemedAt: a.redeemedAt
            }))
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques.' });
    }
});

module.exports = router;
