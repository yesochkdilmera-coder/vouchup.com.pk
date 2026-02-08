import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import { Plus, Users, Briefcase, CheckCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AgencyDashboard() {
    const { profile, user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [counts, setCounts] = useState({
        experts: 0,
        contracts: 0,
        workspaces: 0,
        pending: 0
    })

    useEffect(() => {
        if (user) {
            fetchDashboardMetrics()
        }
    }, [user])

    const fetchDashboardMetrics = async () => {
        setLoading(true)
        try {
            // Get expert count from contracts (unique expert_id)
            const { count: expertCount, error: expertErr } = await supabase
                .from('contracts')
                .select('*', { count: 'exact', head: true })
                .eq('agency_id', user.id)
                .eq('status', 'active')

            // Get pending requests count
            const { count: pendingCount, error: pendingErr } = await supabase
                .from('hire_requests')
                .select('*', { count: 'exact', head: true })
                .eq('agency_id', user.id)
                .eq('status', 'pending')

            // Get workspace count
            const { count: workspaceCount, error: wsErr } = await supabase
                .from('workspaces')
                .select('*', { count: 'exact', head: true })
                .eq('agency_id', user.id)

            setCounts({
                experts: expertCount || 0,
                contracts: expertCount || 0, // In this model, 1 active expert = 1 active contract
                workspaces: workspaceCount || 0,
                pending: pendingCount || 0
            })
        } catch (err) {
            console.error('Error fetching dashboard counts:', err)
        } finally {
            setLoading(false)
        }
    }

    const stats = [
        { label: 'Hired Experts', value: counts.experts, icon: <Users size={20} />, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Active Contracts', value: counts.contracts, icon: <CheckCircle size={20} />, color: '#10b981', bg: '#f0fdf4' },
        { label: 'Running Workspaces', value: counts.workspaces, icon: <Briefcase size={20} />, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Pending Approvals', value: counts.pending, icon: <Clock size={20} />, color: '#6366f1', bg: '#eef2ff' },
    ]

    return (
        <div className="agency-dashboard">
            <header className="page-header">
                <div>
                    <h1>Good afternoon, {profile?.full_name?.split(' ')[0] || 'Agency'}</h1>
                    <p>Here's what's happening with your talent network today.</p>
                </div>
                <Link to="/talents" className="btn-primary">
                    <Plus size={18} />
                    <span>Hire New Expert</span>
                </Link>
            </header>

            <div className="stats-shelf">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-pill">
                        <div className="stat-pill-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-pill-info">
                            <span className="stat-pill-val">{stat.value}</span>
                            <span className="stat-pill-lab">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <section className="dashboard-section">
                <div className="section-header">
                    <h2>Recent Activities</h2>
                </div>
                <div className="empty-card">
                    <div className="empty-illustration">
                        <div className="circle"></div>
                        <div className="circle"></div>
                    </div>
                    <h3>No active hiring cycles</h3>
                    <p>Start your first workspace by hiring a verified product expert from the marketplace.</p>
                    <Link to="/talents" className="btn-secondary">Browse Marketplace</Link>
                </div>
            </section>

            <style>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2.5rem;
                    gap: 1.5rem;
                }

                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 0.25rem;
                    letter-spacing: -0.03em;
                }

                .page-header p {
                    color: #64748b;
                    font-size: 1.125rem;
                    font-weight: 500;
                    margin: 0;
                }

                .btn-primary {
                    background: #0f172a;
                    color: white;
                    padding: 0.875rem 1.5rem;
                    border-radius: 1rem;
                    text-decoration: none;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15);
                }

                .stats-shelf {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 3rem;
                }

                .stat-pill {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 1.5rem;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    transition: all 0.2s;
                }

                .stat-pill:hover {
                    border-color: #cbd5e1;
                    transform: scale(1.02);
                }

                .stat-pill-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-pill-info {
                    display: flex;
                    flex-direction: column;
                }

                .stat-pill-val {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                    margin-bottom: 0.25rem;
                }

                .stat-pill-lab {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .dashboard-section h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 1.5rem;
                }

                .empty-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 2rem;
                    padding: 4rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .empty-illustration {
                    position: relative;
                    width: 120px;
                    height: 80px;
                    margin-bottom: 1rem;
                }

                .circle {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: 3px solid #e2e8f0;
                }

                .circle:nth-child(2) {
                    right: 0;
                    bottom: 0;
                    border-color: #3b82f6;
                    border-style: dashed;
                }

                .empty-card h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #1e293b;
                }

                .empty-card p {
                    margin: 0;
                    color: #64748b;
                    max-width: 320px;
                    line-height: 1.6;
                    font-weight: 500;
                }

                .btn-secondary {
                    margin-top: 1rem;
                    color: #3b82f6;
                    text-decoration: none;
                    font-weight: 700;
                    padding: 0.75rem 1.25rem;
                    background: #eff6ff;
                    border-radius: 0.75rem;
                    transition: all 0.2s;
                }

                .btn-secondary:hover {
                    background: #dbeafe;
                }

                @media (max-width: 640px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .btn-primary {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}
