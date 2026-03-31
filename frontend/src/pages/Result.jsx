import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const TIER_CONFIG = {
    LOSS: {
        emoji: '😔',
        title: 'Pas de chance...',
        color: 'var(--text-secondary)',
        subtitle: 'Ce n\'est que partie remise !',
    },
    SMALL: {
        emoji: '🎉',
        title: 'Félicitations !',
        color: 'var(--success)',
        subtitle: 'Vous avez gagné un lot !',
    },
    MEDIUM: {
        emoji: '🔥',
        title: 'Félicitations !',
        color: 'var(--warning)',
        subtitle: 'Quelle chance incroyable !',
    },
    JACKPOT: {
        emoji: '🏆',
        title: 'JACKPOT !',
        color: 'var(--warm)',
        subtitle: 'Vous avez décroché le gros lot !',
    }
}

export default function Result() {
    const navigate = useNavigate()
    const [result, setResult] = useState(null)
    const hasLoaded = useRef(false)

    useEffect(() => {
        // Prevent double-mount in StrictMode from clearing storage
        if (hasLoaded.current) return
        hasLoaded.current = true

        const stored = sessionStorage.getItem('spinResult')
        const codeValue = sessionStorage.getItem('codeValue')
        if (!stored) {
            navigate('/')
            return
        }
        const parsed = JSON.parse(stored)
        // Attach code to result for display
        parsed.displayCode = codeValue || parsed.code || '—'
        setResult(parsed)
    }, [navigate])

    if (!result) return null

    const tier = TIER_CONFIG[result.prize.tier] || TIER_CONFIG.LOSS
    const isWin = result.prize.tier !== 'LOSS'

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Confetti for wins */}
            {isWin && (
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -100, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), rotate: 0, opacity: 1 }}
                            animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100, rotate: 720, opacity: 0 }}
                            transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 0.5, ease: 'easeIn' }}
                            style={{
                                position: 'absolute',
                                width: 10,
                                height: 10,
                                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                                background: ['#2d8a4e', '#e8b84b', '#34a853', '#e85d4a', '#5bb8d4', '#f5f0e1'][i % 6]
                            }}
                        />
                    ))}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                className="text-center"
                style={{ position: 'relative', zIndex: 1 }}
            >
                <motion.div
                    className="emoji-decoration"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                    style={{ fontSize: '5rem', marginBottom: '16px' }}
                >
                    {tier.emoji}
                </motion.div>

                <motion.h1
                    className="heading heading--xl mb-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        background: result.prize.tier === 'JACKPOT'
                            ? 'linear-gradient(135deg, #e8b84b, #e85d4a, #e8b84b)'
                            : undefined,
                        WebkitBackgroundClip: result.prize.tier === 'JACKPOT' ? 'text' : undefined,
                        WebkitTextFillColor: result.prize.tier === 'JACKPOT' ? 'transparent' : tier.color,
                    }}
                >
                    {tier.title}
                </motion.h1>

                <motion.p
                    className="text-secondary mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '1.05rem' }}
                >
                    {tier.subtitle}
                </motion.p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className={`card ${isWin ? 'card--glow' : ''}`}
                style={{ textAlign: 'center', padding: '32px 24px' }}
            >
                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: tier.color }}>
                    {result.prize.name}
                </div>
                {result.prize.description && (
                    <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                        {result.prize.description}
                    </p>
                )}

                {isWin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-3"
                        style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(45, 138, 78, 0.1), rgba(232, 184, 75, 0.06))',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(45, 138, 78, 0.2)'
                        }}
                    >
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--warm)', marginBottom: '8px' }}>
                            🎫 Montrez ceci en caisse pour récupérer votre lot !
                        </p>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            letterSpacing: '0.3em',
                            color: 'var(--text-primary)',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '12px',
                            marginBottom: '8px',
                            fontFamily: 'monospace'
                        }}>
                            {result.displayCode}
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Ce code est à usage unique et vérifiable par le restaurant.
                        </p>
                    </motion.div>
                )}

                {!isWin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-3"
                    >
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                            Revenez lors de votre prochaine visite pour retenter votre chance ! 💪
                        </p>
                    </motion.div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-3 text-center"
            >
                <button
                    onClick={() => {
                        sessionStorage.clear()
                        navigate('/')
                    }}
                    className="btn btn--secondary"
                    id="home-btn"
                >
                    ← Retour à l'accueil
                </button>
            </motion.div>
        </div>
    )
}
