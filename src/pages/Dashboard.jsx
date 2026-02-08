
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User, Building, Search } from 'lucide-react'
import { useAuth } from '../components/AuthProvider'

export default function Dashboard() {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
    }

    return (
        <div className="dashboard-page" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <nav className="dashboard-nav" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div className="dashboard-container">
                    <div className="dashboard-header" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Fleet Platform</h1>
                            <Link to="/talents" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>Marketplace</Link>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#991b1b', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                <div className="dashboard-container">
                    <div className="dashboard-section">
                        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
                                Dashboard Overview
                            </h2>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Welcome back, {profile?.full_name || user?.email}.
                            </p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                                    <User />
                                </div>
                                <div>
                                    <div className="stat-label">Full Name</div>
                                    <div className="stat-value" style={{ fontSize: '1.125rem' }}>{profile?.full_name || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                                    <Building />
                                </div>
                                <div>
                                    <div className="stat-label">Agency</div>
                                    <div className="stat-value" style={{ fontSize: '1.125rem' }}>{profile?.agency_name || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Next Steps</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Link to="/talents" style={{ textDecoration: 'none', textAlign: 'left' }}>
                                    <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '1rem', border: '1px solid #bfdbfe', transition: 'all 0.2s' }} className="hover-lift">
                                        <div style={{ backgroundColor: '#2563eb', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                            <Search size={20} />
                                        </div>
                                        <h4 style={{ margin: '0 0 0.25rem', color: '#1e40af', fontWeight: 700 }}>Discover Talent</h4>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#60a5fa' }}>Browse our curated list of product experts.</p>
                                    </div>
                                </Link>

                                <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '1rem', border: '1px solid #e2e8f0', opacity: 0.6 }}>
                                    <div style={{ backgroundColor: '#475569', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <Building size={20} />
                                    </div>
                                    <h4 style={{ margin: '0 0 0.25rem', color: '#334155', fontWeight: 700 }}>Workspace Setup</h4>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>Coming soon: Manage your active teams.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
