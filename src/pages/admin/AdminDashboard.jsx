import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Users, Shield, Briefcase, UserCheck, AlertCircle, Ban } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalAgencies: 0,
        totalExperts: 0,
        totalAdmins: 0,
        totalBanned: 0,
        recentSignups: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        setLoading(true)
        setError(null)

        try {
            // Use the admin function to get stats
            const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats')

            if (statsError) {
                console.error('Stats fetch error:', {
                    message: statsError.message,
                    details: statsError.details,
                    hint: statsError.hint,
                    code: statsError.code
                })
                setError(statsError.message)
            }

            // Get recent signups
            const { data: recentData, error: recentError } = await supabase.rpc('get_all_profiles')

            if (recentError) {
                console.error('Recent signups fetch error:', recentError)
            }

            setStats({
                totalAgencies: statsData?.[0]?.total_agencies || 0,
                totalExperts: statsData?.[0]?.total_experts || 0,
                totalAdmins: statsData?.[0]?.total_admins || 0,
                totalBanned: statsData?.[0]?.total_banned || 0,
                recentSignups: (recentData || []).slice(0, 5)
            })
        } catch (err) {
            console.error('Error fetching admin stats:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Error Loading Dashboard</h2>
                <p style={{ color: '#dc2626' }}>{error}</p>
                <button
                    onClick={fetchStats}
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem' }}>Platform Overview</h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    icon={<Users color="#3b82f6" />}
                    iconBg="#eff6ff"
                    label="Agencies"
                    value={stats.totalAgencies}
                />
                <StatCard
                    icon={<UserCheck color="#8b5cf6" />}
                    iconBg="#f5f3ff"
                    label="Experts"
                    value={stats.totalExperts}
                />
                <StatCard
                    icon={<Shield color="#b45309" />}
                    iconBg="#fef3c7"
                    label="Admins"
                    value={stats.totalAdmins}
                />
                <StatCard
                    icon={<Ban color="#dc2626" />}
                    iconBg="#fef2f2"
                    label="Banned"
                    value={stats.totalBanned}
                />
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Registrations</h2>
                </div>

                {stats.recentSignups.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        No users registered yet
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Name</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Email</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Role</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentSignups.map((user) => (
                                <tr key={user.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#1e293b' }}>
                                        {user.full_name || 'No name'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{user.email}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <StatusBadge status={user.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

function StatCard({ icon, iconBg, label, value }) {
    return (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center' }}>
            <div style={{ backgroundColor: iconBg, padding: '1rem', borderRadius: '0.5rem', marginRight: '1rem' }}>
                {icon}
            </div>
            <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</p>
            </div>
        </div>
    )
}

function RoleBadge({ role }) {
    const colors = {
        admin: { bg: '#dbeafe', text: '#1e40af' },
        agency: { bg: '#f0fdf4', text: '#166534' },
        expert: { bg: '#f5f3ff', text: '#5b21b6' }
    }
    const style = colors[role] || { bg: '#f1f5f9', text: '#475569' }

    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: style.bg,
            color: style.text,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'capitalize'
        }}>
            {role || 'unknown'}
        </span>
    )
}

function StatusBadge({ status }) {
    const colors = {
        active: { bg: '#f0fdf4', text: '#166534' },
        banned: { bg: '#fef2f2', text: '#991b1b' },
        suspended: { bg: '#fffbeb', text: '#92400e' }
    }
    const style = colors[status] || colors.active

    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: style.bg,
            color: style.text,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'capitalize'
        }}>
            {status || 'active'}
        </span>
    )
}
