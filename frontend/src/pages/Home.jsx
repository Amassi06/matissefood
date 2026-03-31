import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { validateCode } from '../services/api'

export default function Home() {
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await validateCode(code)
            sessionStorage.setItem('codeId', res.data.codeId)
            sessionStorage.setItem('codeValue', code.toUpperCase())
            navigate('/engage')
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de connexion au serveur.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-center"
            >
                <img
                    src="/logo.png"
                    alt="Matisse Food"
                    style={{ width: 160, height: 'auto', margin: '0 auto 16px', display: 'block', borderRadius: 16 }}
                />
                <h1 className="heading heading--xl mb-1">Tentez Votre Chance</h1>
                <p className="text-secondary mb-3" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                    Saisissez le code donné pour faire tourner la roue et gagner des récompenses chez <strong style={{ color: 'var(--accent-primary)' }}>Matisse Food</strong> !
                </p>
            </motion.div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="card card--glow mb-3">
                    <label className="label text-center mb-1" style={{ fontSize: '0.9rem' }}>
                        Votre code unique
                    </label>
                    <input
                        type="text"
                        className="input input--code"
                        placeholder="M4X9"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                        maxLength={6}
                        autoFocus
                        autoComplete="off"
                        id="code-input"
                    />
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="alert alert--error mb-2 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <button
                    type="submit"
                    className="btn btn--primary btn--lg btn--full pulse-glow"
                    disabled={code.length < 3 || loading}
                    id="validate-btn"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-1">
                            <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                            Vérification...
                        </span>
                    ) : (
                        '🎯 Valider mon code'
                    )}
                </button>
            </motion.form>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-muted mt-3"
                style={{ fontSize: '0.8rem' }}
            >
                Le code est donné à la caisse du matisse
            </motion.p>
        </div>
    )
}
