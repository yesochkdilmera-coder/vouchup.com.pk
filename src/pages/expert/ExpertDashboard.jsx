import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import { Briefcase, Calendar, Star, ArrowRight, ExternalLink, Clock, Shield, AlertCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import ExpertCard from '../../components/marketplace/ExpertCard'

export default function ExpertDashboard() {
    const { profile, user } = useAuth()
    const [stats, setStats] = useState(null)
    const [activeContract, setActiveContract] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        try {
            // Fetch stats
            const { data: statsData, error: statsError } = await supabase.rpc('get_expert_dashboard_stats')
            if (statsError) throw statsError
            setStats(statsData)

            // Fetch current active contract
            const { data: contracts, error: contractError } = await supabase
                .from('contracts')
                .select(`
                    *,
                    agency:agency_id (
                        id,
                        full_name,
                        agency_name,
                        email
                    )
                `)
                .eq('expert_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })

            if (contractError) throw contractError
            setActiveContract(contracts?.[0] || null)
        } catch (err) {
            console.error('Error fetching dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>

    const isPending = profile?.moderation_status === 'pending'
    const isRejected = profile?.moderation_status === 'rejected'

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '100%', overflowX: 'hidden' }}>
            {/* Status Banners */}
            {isPending && (
                <StatusBanner
                    icon={<Clock size={20} />}
                    color="#fffbeb"
                    textColor="#92400e"
                    borderColor="#fde68a"
                    text="Profile under review. Your public listing is currently paused until admin approval."
                />
            )}
            {isRejected && (
                <StatusBanner
                    icon={<AlertCircle size={20} />}
                    color="#fef2f2"
                    textColor="#991b1b"
                    borderColor="#fee2e2"
                    text="Changes were rejected. Please check your profile and assets for compliance."
                />
            )}

            {/* Active Assignment Glass Banner */}
            {activeContract && (
                <div style={{
                    background: 'rgba(37, 99, 235, 0.05)',
                    border: '1px solid rgba(37, 99, 235, 0.1)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ background: '#2563eb', width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Placement</p>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {activeContract.agency?.agency_name || 'Partner Agency'}
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                                <span>Period: {new Date(activeContract.start_date).toLocaleDateString()} — {activeContract.end_date ? new Date(activeContract.end_date).toLocaleDateString() : 'Ongoing'}</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/expert/workspaces" style={{
                        background: '#0f172a', color: 'white', padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                        fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none'
                    }}>
                        Enter Workspace
                    </Link>
                </div>
            )}

            {/* Hero Greeting */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    Hello, {profile?.full_name?.split(' ')[0] || 'Expert'}!
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9375rem', fontWeight: 500 }}>
                    {stats?.workspaces_count > 0
                        ? `Deployment active in ${stats?.workspaces_count} workspace${stats.workspaces_count > 1 ? 's' : ''}.`
                        : "Ready for assignment. Optimize your profile to increase visibility."}
                </p>
            </div>

            {/* Stats Grid - Responsive */}
            <div className="dashboard-stats-grid">
                <StatCard
                    label="Active Projects"
                    value={stats?.workspaces_count || 0}
                    icon={<Briefcase color="#2563eb" size={24} />}
                    color="#eff6ff"
                />
                <StatCard
                    label="Pool Status"
                    value={stats?.workspaces_count > 0 ? 'Assigned' : 'Available'}
                    icon={<Clock color="#0891b2" size={24} />}
                    color="#ecfeff"
                    note={profile?.willing_timezone_shift ? 'Flex Enabled' : 'Local Only'}
                />
                <StatCard
                    label="Compliance"
                    value={(profile?.moderation_status || 'PENDING').toUpperCase()}
                    icon={<Shield color="#d97706" size={24} />}
                    color="#fffbeb"
                />
            </div>

            {/* Assignments Section */}
            <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="dashboard-main-grid">
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>My Workspaces</h2>
                        <Link to="/expert/workspaces" style={{ color: '#2563eb', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            SEE ALL <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {stats?.active_workspaces?.length > 0 ? (
                            stats.active_workspaces.map(ws => (
                                <WorkspaceCard key={ws.id} workspace={ws} />
                            ))
                        ) : (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '1.25rem', border: '1px dashed #e2e8f0' }}>
                                <div style={{ backgroundColor: '#f8fafc', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <Briefcase size={20} color="#94a3b8" />
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>No active assignments yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>Marketplace Preview</h2>
                        <Link to="/expert/profile" style={{ color: '#2563eb', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            EDIT PROFILE <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'white', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}>
                        {profile ? (
                            <div style={{ width: '100%', maxWidth: '300px' }}>
                                <ExpertCard
                                    data={profile}
                                    isDraft={profile?.moderation_status !== 'approved'}
                                    actionLabel="Preview"
                                />
                                {!profile?.published_at && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '0.75rem', border: '1px solid #fde68a', fontSize: '0.75rem', color: '#92400e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} /> Not yet public
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Complete your profile to appear in the marketplace.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .dashboard-main-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 480px) {
                    .dashboard-stats-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

function StatusBanner({ icon, color, textColor, borderColor, text }) {
    return (
        <div style={{
            backgroundColor: color,
            border: `1px solid ${borderColor}`,
            padding: '0.875rem 1rem',
            borderRadius: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: textColor,
            fontSize: '0.8125rem',
            fontWeight: 600,
            lineHeight: 1.4
        }}>
            {icon}
            <span>{text}</span>
        </div>
    )
}

function StatCard({ label, value, icon, color, note }) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: color, padding: '0.5rem', borderRadius: '0.75rem' }}>
                    {icon}
                </div>
                {note && <span style={{ fontSize: '0.625rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{note}</span>}
            </div>
            <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{value}</h3>
            </div>
        </div>
    )
}

function WorkspaceCard({ workspace }) {
    return (
        <Link to={`/expert/workspaces/${workspace.id}`} style={{ textDecoration: 'none' }}>
            <div className="ws-card" style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                    <div style={{
                        backgroundColor: '#f1f5f9',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: '#64748b',
                        flexShrink: 0
                    }}>
                        {workspace.name.substring(0, 1)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9375rem', marginBottom: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workspace.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{workspace.agency || 'Platform Agency'}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                    }}>
                        {workspace.status || 'active'}
                    </span>
                </div>
            </div>
            <style>{`
                .ws-card:active { transform: scale(0.98); border-color: #2563eb; }
            `}</style>
        </Link>
    )
}
