import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/Matisse+Food+Ivry/@48.8177259,2.3704562,485m/data=!3m1!1e3!4m8!3m7!1s0x47e673e44823606b:0x3e9e5c3d56cea04a!8m2!3d48.8177259!4d2.3730365!9m1!1b1!16s%2Fg%2F11trls3d2h?entry=ttu'

export default function Engage() {
    const navigate = useNavigate()
    const [timer, setTimer] = useState(15)
    const [hasEngaged, setHasEngaged] = useState(false)
    const [canProceed, setCanProceed] = useState(false)

    // Check that user came from the code entry
    useEffect(() => {
        const codeId = sessionStorage.getItem('codeId')
        if (!codeId) {
            navigate('/play')
        }
    }, [navigate])

    // Countdown timer after engagement
    useEffect(() => {
        if (!hasEngaged) return

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setCanProceed(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [hasEngaged])

    const handleGoogleReview = useCallback(() => {
        window.open(GOOGLE_MAPS_URL, '_blank')
        setHasEngaged(true)
    }, [])

    const handleProceed = () => {
        navigate('/spin')
    }

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <div className="emoji-decoration mb-2">⭐</div>
                <h1 className="heading heading--xl mb-1">Une petite étape</h1>
                <p className="text-secondary mb-3" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                    Avant de faire tourner la roue, soutenez <strong style={{ color: 'var(--accent-primary)' }}>Matisse Food</strong> en nous laissant un avis Google !
                </p>
            </motion.div>

            {!hasEngaged ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <button
                        onClick={handleGoogleReview}
                        className="card card--glow"
                        style={{
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            width: '100%',
                            border: '1px solid rgba(45, 138, 78, 0.25)'
                        }}
                        id="google-review-btn"
                    >
                        <span style={{ fontSize: '2.8rem' }}>⭐</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--accent-primary)' }}>
                                Laisser un avis Google
                            </div>
                            <div className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                Partagez votre expérience chez Matisse Food et aidez d'autres gourmands à nous découvrir !
                            </div>
                        </div>
                    </button>

                    <p className="text-center text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                        Après avoir laissé votre avis, la roue sera débloquée
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="card card--glow text-center" style={{ padding: '40px 24px' }}>
                        {!canProceed ? (
                            <>
                                <p className="text-secondary mb-3" style={{ fontSize: '0.95rem' }}>
                                    Merci ! 🙏 Veuillez patienter pendant que vous rédigez votre avis...
                                </p>
                                <div className="timer-circle" style={{ margin: '0 auto 24px' }}>
                                    {timer}
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    La roue sera disponible dans {timer} secondes
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="emoji-decoration mb-2">🎉</div>
                                <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>
                                    Merci pour votre avis !
                                </p>
                                <p className="text-secondary mb-3">
                                    Vous pouvez maintenant tenter votre chance.
                                </p>
                                <button
                                    onClick={handleProceed}
                                    className="btn btn--primary btn--lg btn--full pulse-glow"
                                    id="proceed-spin-btn"
                                >
                                    🎰 Faire tourner la roue !
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
