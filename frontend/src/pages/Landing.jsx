import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const STEPS = [
    {
        icon: '🍔',
        title: 'Commandez chez Matisse Food',
        desc: 'Passez votre commande.',
        color: '#e8b84b'
    },
    {
        icon: '🎟️',
        title: 'Trouvez votre code unique',
        desc: 'Un code unique est donné à la caisse du fast-food.',
        color: '#5bb8d4'
    },
    {
        icon: '⭐',
        title: 'Laissez un avis Google',
        desc: 'Partagez votre expérience pour débloquer la roue.',
        color: '#e85d4a'
    },
    {
        icon: '🎰',
        title: 'Tournez la roue !',
        desc: 'Tentez votre chance et gagnez des récompenses !',
        color: '#2d8a4e'
    }
]

const PRIZES_PREVIEW = [
    { emoji: '🥤', name: 'Boisson' },
    { emoji: '🍋', name: 'Jus citron fait maison | Bissap' },
    { emoji: '🍪', name: 'Cookie' },
    { emoji: '🥙', name: 'Kebab' },
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🍔', name: 'Burger' },
]

export default function Landing() {
    const navigate = useNavigate()

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>

            {/* Logo + Hero */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <img
                    src="/logo.png"
                    alt="Matisse Food"
                    style={{ width: 130, height: 'auto', margin: '0 auto 12px', display: 'block', borderRadius: 16 }}
                />
                <h1 className="heading heading--xl mb-1" style={{ fontSize: '1.9rem' }}>
                    Matisse Food
                </h1>
                <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                    Tentez votre chance et gagnez des <strong style={{ color: 'var(--warm)' }}>récompenses gratuites</strong> chez Matisse Food !
                </p>
            </motion.div>

            {/* Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ marginTop: 32 }}
            >
                <h2 style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    marginBottom: 16,
                    textAlign: 'center'
                }}>
                    Comment ça marche ?
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                padding: '16px 18px',
                                borderLeft: `3px solid ${step.color}`
                            }}
                        >
                            <div style={{
                                fontSize: '2rem',
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {step.icon}
                            </div>
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 4
                                }}>
                                    <span style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        background: step.color,
                                        color: '#fff',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>{i + 1}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{step.title}</span>
                                </div>
                                <p className="text-secondary" style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Prizes preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: 32 }}
            >
                <h2 style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    marginBottom: 16,
                    textAlign: 'center'
                }}>
                    Les lots à gagner
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10
                }}>
                    {PRIZES_PREVIEW.map((prize, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 + i * 0.05 }}
                            style={{
                                background: 'var(--bg-glass)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 'var(--radius-md)',
                                padding: '14px 8px',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>{prize.emoji}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {prize.name}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                style={{ marginTop: 32 }}
            >
                <button
                    onClick={() => navigate('/play')}
                    className="btn btn--primary btn--lg btn--full pulse-glow"
                    id="start-btn"
                    style={{ fontSize: '1.15rem' }}
                >
                    🎯 J'ai mon code, c'est parti !
                </button>
                <p className="text-center text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                    Matisse food Ivry - Jeu gratuit sans obligation d'achat - Voir conditions en magasin
                </p>
            </motion.div>
        </div>
    )
}
