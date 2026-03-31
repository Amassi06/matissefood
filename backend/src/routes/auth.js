const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
        }

        const admin = await prisma.admin.findUnique({ where: { username } });

        if (!admin) {
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        const validPassword = await bcrypt.compare(password, admin.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;
