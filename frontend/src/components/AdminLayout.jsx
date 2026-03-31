import { NavLink, useNavigate } from 'react-router-dom'

export default function AdminLayout({ children, title }) {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        navigate('/admin/login')
    }

    const links = [
        { to: '/admin', label: '📊 Tableau de bord', end: true },
        { to: '/admin/codes', label: '🎟️ Codes' },
        { to: '/admin/prizes', label: '🎁 Lots & Probabilités' },
        { to: '/admin/redeem', label: '✅ Réclamation' },
    ]

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__logo">🎰 Matisse Food</div>
                <nav className="admin-sidebar__nav">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <button
                    onClick={handleLogout}
                    className="admin-sidebar__link"
                    style={{ marginTop: 'auto', color: 'var(--danger)' }}
                >
                    🚪 Déconnexion
                </button>
            </aside>

            <main className="admin-content">
                {title && (
                    <h1 className="heading heading--lg mb-3">{title}</h1>
                )}
                {children}
            </main>
        </div>
    )
}
