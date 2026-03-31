import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/AdminLayout'
import { getStats } from '../../services/api'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (!token) {
            navigate('/admin/login')
            return
        }

        getStats()
            .then(res => {
                setStats(res.data)
                setLoading(false)
            })
            .catch(() => {
                navigate('/admin/login')
            })
    }, [navigate])

    if (loading) {
        return (
            <AdminLayout title="Tableau de bord">
                <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                    <div className="spinner" style={{ width: 48, height: 48 }}></div>
                </div>
            </AdminLayout>
        )
    }

    const { overview, distribution, recentActivity } = stats

    const statCards = [
        { label: 'Codes générés', value: overview.totalCodes, icon: '🎟️', color: 'var(--info)' },
        { label: 'Disponibles', value: overview.generatedCodes, icon: '📋', color: 'var(--text-secondary)' },
        { label: 'Joués', value: overview.playedCodes, icon: '🎰', color: 'var(--warning)' },
        { label: 'Réclamés', value: overview.redeemedCodes, icon: '✅', color: 'var(--success)' },
        { label: 'Taux de conversion', value: `${overview.conversionRate}%`, icon: '📈', color: 'var(--accent-primary)' },
        { label: 'Taux de réclamation', value: `${overview.redemptionRate}%`, icon: '🔄', color: 'var(--success)' },
    ]

    return (
        <AdminLayout title="📊 Tableau de bord">
            {/* Stats Grid */}
            <div className="stats-grid mb-3">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                {card.label}
                            </span>
                            <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color }}>
                            {card.value}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Prize Distribution */}
            {distribution.length > 0 && (
                <div className="card mb-3">
                    <h2 className="heading heading--md mb-2">🎁 Distribution des lots</h2>
                    <div className="flex flex-col gap-1">
                        {distribution.map((d, i) => {
                            const total = distribution.reduce((s, x) => s + x.count, 0)
                            const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : 0
                            return (
                                <div key={i} className="flex items-center justify-between" style={{ padding: '8px 0' }}>
                                    <div className="flex items-center gap-1">
                                        <span className={`badge badge--${d.prizeTier.toLowerCase()}`}>{d.prizeTier}</span>
                                        <span style={{ fontSize: '0.9rem' }}>{d.prizeName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{d.count}x</span>
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>({pct}%)</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
                <div className="card">
                    <h2 className="heading heading--md mb-2">🕐 Activité récente</h2>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Statut</th>
                                    <th>Lot</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((a, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{a.code}</td>
                                        <td>
                                            <span className={`badge badge--${a.status.toLowerCase()}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td>
                                            {a.prize && (
                                                <span className={`badge badge--${a.prizeTier?.toLowerCase()}`}>
                                                    {a.prize}
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                                            {new Date(a.playedAt).toLocaleString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
