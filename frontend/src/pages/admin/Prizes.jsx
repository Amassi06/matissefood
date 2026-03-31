import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/AdminLayout'
import { getPrizes, updatePrize, createPrize } from '../../services/api'

const TIER_LABELS = {
    LOSS: { label: 'Perte', emoji: '❌' },
    SMALL: { label: 'Petit lot', emoji: '🎁' },
    MEDIUM: { label: 'Lot moyen', emoji: '🔥' },
    JACKPOT: { label: 'Jackpot', emoji: '🏆' }
}

export default function AdminPrizes() {
    const [prizes, setPrizes] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [showNew, setShowNew] = useState(false)
    const [newForm, setNewForm] = useState({ name: '', description: '', probability: 0, tier: 'SMALL' })
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()

    const fetchPrizes = async () => {
        try {
            const res = await getPrizes()
            setPrizes(res.data.prizes)
        } catch {
            navigate('/admin/login')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (!token) { navigate('/admin/login'); return }
        fetchPrizes()
    }, [])

    const totalProb = prizes.reduce((s, p) => s + p.probability, 0)

    const handleEdit = (prize) => {
        setEditingId(prize.id)
        setEditForm({ name: prize.name, description: prize.description, probability: prize.probability, isActive: prize.isActive })
    }

    const handleSave = async (id) => {
        try {
            await updatePrize(id, editForm)
            setEditingId(null)
            setMsg('✅ Lot mis à jour')
            fetchPrizes()
            setTimeout(() => setMsg(''), 3000)
        } catch {
            setMsg('❌ Erreur de mise à jour')
        }
    }

    const handleCreate = async () => {
        try {
            await createPrize(newForm)
            setShowNew(false)
            setNewForm({ name: '', description: '', probability: 0, tier: 'SMALL' })
            setMsg('✅ Lot créé')
            fetchPrizes()
            setTimeout(() => setMsg(''), 3000)
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.error || 'Erreur'}`)
        }
    }

    return (
        <AdminLayout title="🎁 Lots & Probabilités">
            {/* Probability summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-3"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Probabilités totales</span>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: Math.abs(totalProb - 100) < 0.1 ? 'var(--success)' : 'var(--danger)' }}>
                            {totalProb.toFixed(1)}%
                        </div>
                    </div>
                    {Math.abs(totalProb - 100) >= 0.1 && (
                        <div className="alert alert--error" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                            ⚠️ Les probabilités doivent totaliser 100%
                        </div>
                    )}
                </div>
            </motion.div>

            {msg && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`alert ${msg.includes('✅') ? 'alert--success' : 'alert--error'} mb-2`}
                >
                    {msg}
                </motion.div>
            )}

            {/* Prizes list */}
            {loading ? (
                <div className="flex justify-center mt-4">
                    <div className="spinner" style={{ width: 40, height: 40 }}></div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {prizes.map((prize, i) => (
                        <motion.div
                            key={prize.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`card ${!prize.isActive ? '' : ''}`}
                            style={{ opacity: prize.isActive ? 1 : 0.5 }}
                        >
                            {editingId === prize.id ? (
                                /* Edit mode */
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2 flex-wrap">
                                        <div style={{ flex: 1, minWidth: 160 }}>
                                            <label className="label">Nom</label>
                                            <input
                                                className="input"
                                                value={editForm.name}
                                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                            />
                                        </div>
                                        <div style={{ width: 120 }}>
                                            <label className="label">Probabilité (%)</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={editForm.probability}
                                                onChange={e => setEditForm(f => ({ ...f, probability: parseFloat(e.target.value) || 0 }))}
                                                step={0.1}
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Description</label>
                                        <input
                                            className="input"
                                            value={editForm.description}
                                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <label className="flex items-center gap-1" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isActive}
                                                onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                                            />
                                            Actif
                                        </label>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleSave(prize.id)} className="btn btn--primary btn--sm">
                                            💾 Enregistrer
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="btn btn--secondary btn--sm">
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Display mode */
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {TIER_LABELS[prize.tier]?.emoji || '🎁'}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{prize.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {TIER_LABELS[prize.tier]?.label} • {prize.description?.slice(0, 50)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                                                {prize.probability}%
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEdit(prize)}
                                            className="btn btn--secondary btn--sm"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add new prize */}
            <div className="mt-3">
                {!showNew ? (
                    <button onClick={() => setShowNew(true)} className="btn btn--secondary btn--full">
                        ➕ Ajouter un lot
                    </button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <h3 className="heading heading--md mb-2">Nouveau lot</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 flex-wrap">
                                <div style={{ flex: 1, minWidth: 160 }}>
                                    <label className="label">Nom</label>
                                    <input
                                        className="input"
                                        value={newForm.name}
                                        onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Ex: Café Offert"
                                    />
                                </div>
                                <div style={{ width: 120 }}>
                                    <label className="label">Probabilité (%)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={newForm.probability}
                                        onChange={e => setNewForm(f => ({ ...f, probability: parseFloat(e.target.value) || 0 }))}
                                        step={0.1}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <input
                                    className="input"
                                    value={newForm.description}
                                    onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Description du lot..."
                                />
                            </div>
                            <div>
                                <label className="label">Niveau</label>
                                <select
                                    className="input"
                                    value={newForm.tier}
                                    onChange={e => setNewForm(f => ({ ...f, tier: e.target.value }))}
                                >
                                    <option value="LOSS">Perte</option>
                                    <option value="SMALL">Petit lot</option>
                                    <option value="MEDIUM">Lot moyen</option>
                                    <option value="JACKPOT">Jackpot</option>
                                </select>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={handleCreate} className="btn btn--primary btn--sm" disabled={!newForm.name}>
                                    ✅ Créer
                                </button>
                                <button onClick={() => setShowNew(false)} className="btn btn--secondary btn--sm">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    )
}
