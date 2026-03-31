import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/AdminLayout'
import { lookupCode, redeemCode } from '../../services/api'

export default function AdminRedeem() {
    const [searchCode, setSearchCode] = useState('')
    const [foundCode, setFoundCode] = useState(null)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (!token) navigate('/admin/login')
    }, [])

    const handleLookup = async (e) => {
        e.preventDefault()
        setFoundCode(null)
        setError('')
        setMsg('')
        setLoading(true)

        try {
            const res = await lookupCode(searchCode)
            setFoundCode(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Code introuvable.')
        } finally {
            setLoading(false)
        }
    }

    const handleRedeem = async () => {
        setMsg('')
        setError('')

        try {
            const res = await redeemCode(foundCode.id)
            setMsg(`✅ Lot "${res.data.prize?.name}" réclamé avec succès !`)
            // Refresh
            const updated = await lookupCode(searchCode)
            setFoundCode(updated.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la réclamation.')
        }
    }

    return (
        <AdminLayout title="✅ Réclamation de lot">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Search */}
                <form onSubmit={handleLookup} className="card mb-3">
                    <h2 className="heading heading--md mb-2">Rechercher un code</h2>
                    <p className="text-secondary mb-2" style={{ fontSize: '0.85rem' }}>
                        Saisissez le code du client pour vérifier et valider son lot.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input"
                            placeholder="M4X9"
                            value={searchCode}
                            onChange={e => setSearchCode(e.target.value.toUpperCase())}
                            style={{ flex: 1, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 700 }}
                            id="redeem-code-input"
                        />
                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={searchCode.length < 3 || loading}
                            id="redeem-lookup-btn"
                        >
                            {loading ? '⏳' : '🔍 Rechercher'}
                        </button>
                    </div>
                </form>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="alert alert--error mb-2"
                    >
                        {error}
                    </motion.div>
                )}

                {msg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="alert alert--success mb-2"
                    >
                        {msg}
                    </motion.div>
                )}

                {/* Code details */}
                {foundCode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Code</span>
                                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                                    {foundCode.code}
                                </div>
                            </div>
                            <span className={`badge badge--${foundCode.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
                                {foundCode.status}
                            </span>
                        </div>

                        {foundCode.prize && (
                            <div style={{
                                padding: '16px',
                                background: 'rgba(45, 138, 78, 0.06)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(45, 138, 78, 0.15)',
                                marginBottom: '16px'
                            }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Lot gagné</span>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{foundCode.prize.name}</div>
                                        <div className="text-secondary" style={{ fontSize: '0.85rem' }}>{foundCode.prize.description}</div>
                                    </div>
                                    <span className={`badge badge--${foundCode.prize.tier.toLowerCase()}`}>
                                        {foundCode.prize.tier}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 flex-wrap text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>
                            {foundCode.playedAt && (
                                <span>🎰 Joué le {new Date(foundCode.playedAt).toLocaleString('fr-FR')}</span>
                            )}
                            {foundCode.redeemedAt && (
                                <span>✅ Réclamé le {new Date(foundCode.redeemedAt).toLocaleString('fr-FR')}</span>
                            )}
                        </div>

                        {/* Redeem button */}
                        {foundCode.status === 'PLAYED' && foundCode.prize && foundCode.prize.tier !== 'LOSS' && (
                            <button
                                onClick={handleRedeem}
                                className="btn btn--primary btn--full btn--lg"
                                id="confirm-redeem-btn"
                            >
                                ✅ Valider la réclamation
                            </button>
                        )}

                        {foundCode.status === 'GENERATED' && (
                            <div className="alert alert--error">
                                ⚠️ Ce code n'a pas encore été utilisé par le client.
                            </div>
                        )}

                        {foundCode.status === 'REDEEMED' && (
                            <div className="alert alert--success">
                                ✅ Ce lot a déjà été réclamé.
                            </div>
                        )}

                        {foundCode.status === 'PLAYED' && foundCode.prize?.tier === 'LOSS' && (
                            <div className="alert alert--error">
                                ❌ Ce code correspond à une perte — pas de lot à réclamer.
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </AdminLayout>
    )
}
