const { PrismaClient } = require('@prisma/client');
const { randomInt } = require('crypto');
const prisma = new PrismaClient();

/**
 * Weighted random prize selection algorithm.
 * All probability logic is server-side only — NEVER exposed to the client.
 */
async function spinWheel(codeId) {
    // Get the code and verify it's valid
    const code = await prisma.code.findUnique({ where: { id: codeId } });

    if (!code) {
        throw new Error('Code introuvable.');
    }
    if (code.status !== 'GENERATED') {
        throw new Error('Ce code a déjà été utilisé.');
    }

    // Get all active prizes
    const prizes = await prisma.prize.findMany({
        where: { isActive: true },
        orderBy: { probability: 'desc' }
    });

    if (prizes.length === 0) {
        throw new Error('Aucun lot configuré.');
    }

    // Normalize probabilities to sum to 1
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    const normalizedPrizes = prizes.map(p => ({
        ...p,
        normalizedProb: p.probability / totalProbability
    }));

    // Weighted random selection using a CSPRNG
    // Scale to integer range to avoid floating-point accumulation errors
    const PROBABILITY_SCALE = 1_000_000;
    const totalScaled = Math.round(totalProbability * PROBABILITY_SCALE);
    const random = randomInt(0, totalScaled);
    let cumulative = 0;
    let selectedPrize = normalizedPrizes[normalizedPrizes.length - 1]; // fallback

    for (const prize of normalizedPrizes) {
        cumulative += Math.round(prize.probability * PROBABILITY_SCALE);
        if (random < cumulative) {
            selectedPrize = prize;
            break;
        }
    }

    // Burn the code — atomic update with optimistic lock
    let updatedCode;
    try {
        updatedCode = await prisma.code.update({
            where: {
                id: codeId,
                status: 'GENERATED' // Optimistic lock
            },
            data: {
                status: 'PLAYED',
                prizeId: selectedPrize.id,
                playedAt: new Date()
            },
            include: {
                prize: true
            }
        });
    } catch (e) {
        // P2025 = record not found (status changed between check and update)
        if (e.code === 'P2025') {
            throw new Error('Ce code a déjà été utilisé.');
        }
        throw e;
    }

    return {
        codeId: updatedCode.id,
        code: updatedCode.code,
        prize: {
            id: selectedPrize.id,
            name: selectedPrize.name,
            description: selectedPrize.description,
            tier: selectedPrize.tier
        }
    };
}

module.exports = { spinWheel };
