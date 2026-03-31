import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../../services/api'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await login(username, password)
            localStorage.setItem('admin_token', res.data.token)
            navigate('/admin')
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de connexion.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-3"
            >
                <div className="emoji-decoration mb-2" style={{ fontSize: '3rem' }}>🔐</div>
                <h1 className="heading heading--xl mb-1">Administration</h1>
                <p className="text-secondary">Connectez-vous pour accéder au tableau de bord</p>
            </motion.div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
                    <div className="mb-2">
                        <label className="label">Nom d'utilisateur</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            autoFocus
                            id="admin-username"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="label">Mot de passe</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            id="admin-password"
                        />
                    </div>

                    {error && (
                        <div className="alert alert--error mb-2">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="btn btn--primary btn--full"
                        disabled={!username || !password || loading}
                        id="admin-login-btn"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </div>
            </motion.form>
        </div>
    )
}
