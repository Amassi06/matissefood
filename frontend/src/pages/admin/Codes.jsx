import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/AdminLayout'
import { generateCodes, getCodes } from '../../services/api'

export default function AdminCodes() {
    const [codes, setCodes] = useState([])
    const [pagination, setPagination] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [count, setCount] = useState(10)
    const [filterStatus, setFilterStatus] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [successMsg, setSuccessMsg] = useState('')
    const navigate = useNavigate()

    const fetchCodes = async (page = 1, status = '') => {
        try {
            const params = { page, limit: 30 }
            if (status) params.status = status
            const res = await getCodes(params)
            setCodes(res.data.codes)
            setPagination(res.data.pagination)
        } catch {
            navigate('/admin/login')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (!token) { navigate('/admin/login'); return }
        fetchCodes(currentPage, filterStatus)
    }, [currentPage, filterStatus])

    const handleGenerate = async () => {
        setGenerating(true)
        setSuccessMsg('')
        try {
            const res = await generateCodes(count)
            setSuccessMsg(`✅ ${res.data.generated} codes générés avec succès !`)
            fetchCodes(1, filterStatus)
            setCurrentPage(1)
        } catch (err) {
            setSuccessMsg('❌ Erreur lors de la génération.')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <AdminLayout title="🎟️ Gestion des Codes">
            {/* Generate section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-3"
            >
                <h2 className="heading heading--md mb-2">Générer des codes</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <div>
                        <label className="label">Nombre de codes</label>
                        <input
                            type="number"
                            className="input"
                            value={count}
                            onChange={e => setCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                            min={1}
                            max={500}
                            style={{ width: 120 }}
                            id="code-count-input"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        className="btn btn--primary"
                        disabled={generating}
                        style={{ marginTop: 20 }}
                        id="generate-codes-btn"
                    >
                        {generating ? '⏳ Génération...' : '🎲 Générer'}
                    </button>
                </div>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`alert ${successMsg.includes('✅') ? 'alert--success' : 'alert--error'} mt-2`}
                    >
                        {successMsg}
                    </motion.div>
                )}
            </motion.div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Filtrer :</span>
                {['', 'GENERATED', 'PLAYED', 'REDEEMED'].map(status => (
                    <button
                        key={status}
                        onClick={() => { setFilterStatus(status); setCurrentPage(1) }}
                        className={`btn btn--sm ${filterStatus === status ? 'btn--primary' : 'btn--secondary'}`}
                    >
                        {status || 'Tous'}
                    </button>
                ))}
            </div>

            {/* Codes table */}
            {loading ? (
                <div className="flex justify-center mt-4">
                    <div className="spinner" style={{ width: 40, height: 40 }}></div>
                </div>
            ) : (
                <>
                    <div className="card">
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Statut</th>
                                        <th>Lot</th>
                                        <th>Créé le</th>
                                        <th>Joué le</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {codes.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                                                {c.code}
                                            </td>
                                            <td>
                                                <span className={`badge badge--${c.status.toLowerCase()}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td>
                                                {c.prize ? (
                                                    <span className={`badge badge--${c.prize.tier.toLowerCase()}`}>
                                                        {c.prize.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {c.playedAt ? new Date(c.playedAt).toLocaleString('fr-FR') : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {codes.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted" style={{ padding: '40px' }}>
                                                Aucun code trouvé
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <button
                                className="btn btn--sm btn--secondary"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                ←
                            </button>
                            <span className="text-secondary" style={{ fontSize: '0.85rem', padding: '0 12px' }}>
                                Page {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                className="btn btn--sm btn--secondary"
                                disabled={currentPage >= pagination.totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                →
                            </button>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    )
}
