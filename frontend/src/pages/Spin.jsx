import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wheel } from 'react-custom-roulette'
import { spinWheel, getPublicPrizes } from '../services/api'

const WHEEL_COLORS = [
    '#1a4d2e', '#2a2a2a', '#2d6b45', '#3d2b1a',
    '#143d25', '#1f1f1f', '#c6943d', '#18503a'
]

const WHEEL_TEXT_COLORS = ['#ffffff']

export default function Spin() {
    const navigate = useNavigate()
    const [prizes, setPrizes] = useState([])
    const [mustSpin, setMustSpin] = useState(false)
    const [prizeNumber, setPrizeNumber] = useState(0)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const codeId = sessionStorage.getItem('codeId')
        if (!codeId) {
            navigate('/play')
            return
        }

        // Load prize display names for the wheel
        getPublicPrizes()
            .then(res => {
                const wheelData = res.data.prizes.map((p, i) => ({
                    option: p.name,
                    style: {
                        backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length],
                        textColor: '#ffffff',
                        fontSize: p.name.length > 12 ? 12 : 14
                    }
                }))

                if (wheelData.length === 0) {
                    setError('Configuration invalide. Veuillez contacter le restaurant.')
                    return
                }

                setPrizes(wheelData)
                setLoading(false)
            })
            .catch(() => {
                setError('Erreur de chargement.')
            })
    }, [navigate])

    const handleSpin = async () => {
        if (spinning) return
        setSpinning(true)
        setError('')

        const codeId = sessionStorage.getItem('codeId')

        try {
            // Server determines the result FIRST
            const res = await spinWheel(codeId)
            const serverResult = res.data.result

            // Find the index of the winning prize on the wheel
            const winIndex = prizes.findIndex(p => p.option === serverResult.prize.name)
            const resolvedIndex = winIndex >= 0 ? winIndex : 0

            // Store result for the result page
            sessionStorage.setItem('spinResult', JSON.stringify(serverResult))

            // NOW spin the wheel to land on the server-determined result
            setPrizeNumber(resolvedIndex)
            setMustSpin(true)
            setResult(serverResult)
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors du tirage.')
            setSpinning(false)
        }
    }

    const handleSpinComplete = () => {
        // Navigate to result page after animation
        setTimeout(() => {
            navigate('/result')
        }, 1500)
    }

    if (loading && !error) {
        return (
            <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 48, height: 48 }}></div>
            </div>
        )
    }

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <h1 className="heading heading--xl mb-1">Matisse Food</h1>
                <p className="text-secondary mb-2">
                    Cliquez pour découvrir votre récompense !
                </p>
            </motion.div>

            {error && (
                <div className="alert alert--error mb-2 text-center">{error}</div>
            )}

            {prizes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="wheel-container"
                >
                    <div style={{ position: 'relative' }}>
                        <Wheel
                            mustStartSpinning={mustSpin}
                            prizeNumber={prizeNumber}
                            data={prizes}
                            onStopSpinning={handleSpinComplete}
                            backgroundColors={WHEEL_COLORS}
                            textColors={WHEEL_TEXT_COLORS}
                            outerBorderColor="#2d8a4e"
                            outerBorderWidth={3}
                            innerBorderColor="#0c1a12"
                            innerBorderWidth={8}
                            innerRadius={15}
                            radiusLineColor="rgba(255,255,255,0.1)"
                            radiusLineWidth={1}
                            spinDuration={0.6}
                            fontSize={13}
                            perpendicularText={true}
                            textDistance={60}
                        />
                    </div>
                </motion.div>
            )}

            {!spinning && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-3"
                >
                    <button
                        onClick={handleSpin}
                        className="btn btn--primary btn--lg btn--full pulse-glow"
                        id="spin-btn"
                    >
                        🎰 Tourner la Roue !
                    </button>
                </motion.div>
            )}
        </div>
    )
}
