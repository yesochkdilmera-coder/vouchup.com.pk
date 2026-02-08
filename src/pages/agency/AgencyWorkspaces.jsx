import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import { Plus, Briefcase, Calendar, Users, ArrowRight } from 'lucide-react'

export default function AgencyWorkspaces() {
    const { user } = useAuth()
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchWorkspaces()
        }
    }, [user])

    const fetchWorkspaces = async () => {
        setLoading(true)
        try {
            // Fetch workspaces and join with workspace_experts count
            const { data, error } = await supabase
                .from('workspaces')
                .select(`
                    *,
                    experts_count:workspace_experts(count)
                `)
                .eq('agency_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Format count
            const formatted = (data || []).map(ws => ({
                ...ws,
                experts_count: ws.experts_count?.[0]?.count || 0
            }))

            setWorkspaces(formatted)
        } catch (err) {
            console.error('Error fetching workspaces:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="agency-workspaces-page">
            <header className="page-header">
                <div>
                    <h1>Workspaces</h1>
                    <p>Track project progress and team allocation.</p>
                </div>
                <button className="btn-add">
                    <Plus size={18} />
                    <span>Create Workspace</span>
                </button>
            </header>

            <div className="workspaces-grid">
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                        <p>Syncing workspaces...</p>
                    </div>
                ) : workspaces.length === 0 ? (
                    <div className="empty-workspaces">
                        <div className="ws-illustration">
                            <Briefcase size={40} color="#94a3b8" />
                        </div>
                        <h3>No active workspaces</h3>
                        <p>Workspaces help you organize experts around specific projects or company departments.</p>
                    </div>
                ) : (
                    workspaces.map(ws => (
                        <div key={ws.id} className="workspace-card">
                            <div className="ws-header">
                                <div className="ws-title-box">
                                    <h3 className="ws-name">{ws.name}</h3>
                                    <span className={`ws-status-pill ${ws.status}`}>{ws.status}</span>
                                </div>
                                <ArrowRight size={20} className="ws-arrow" />
                            </div>

                            <div className="ws-body">
                                <div className="ws-meta-item">
                                    <Users size={16} />
                                    <span>{ws.experts_count || 0} Experts Assigned</span>
                                </div>
                                <div className="ws-meta-item">
                                    <Calendar size={16} />
                                    <span>Started {new Date(ws.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="ws-footer">
                                <div className="experts-avatars">
                                    {/* Small avatar stack could go here */}
                                    <div className="avatar-placeholder"></div>
                                    <div className="avatar-placeholder"></div>
                                </div>
                                <button className="ws-manage-btn">Manage</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

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

                .btn-add {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.875rem 1.5rem;
                    border-radius: 1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
                }
                .btn-add:hover {
                    background: #2563eb;
                    transform: translateY(-2px);
                }

                .empty-workspaces {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 2rem;
                    padding: 5rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                .ws-illustration {
                    width: 80px;
                    height: 80px;
                    background: #f8fafc;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    border: 1px solid #e2e8f0;
                }
                .empty-workspaces h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .empty-workspaces p {
                    margin: 0 auto;
                    color: #64748b;
                    max-width: 320px;
                    font-weight: 500;
                    line-height: 1.6;
                }

                .workspace-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.75rem;
                    padding: 1.5rem;
                    margin-bottom: 1.25rem;
                    transition: all 0.2s;
                }
                .workspace-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
                }
                .ws-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }
                .ws-title-box {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .ws-name {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .ws-status-pill {
                    font-size: 0.625rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 0.25rem 0.625rem;
                    border-radius: 6px;
                    width: fit-content;
                    background: #f1f5f9;
                    color: #475569;
                }
                .ws-status-pill.active { background: #f0fdf4; color: #166534; }

                .ws-body {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 1rem;
                }
                .ws-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #64748b;
                }

                .ws-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .experts-avatars {
                    display: flex;
                    align-items: center;
                }
                .avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    border: 2px solid white;
                    margin-right: -8px;
                }
                .ws-manage-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-weight: 700;
                    font-size: 0.8125rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ws-manage-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                @media (max-width: 640px) {
                    .page-header { flex-direction: column; align-items: flex-start; }
                    .btn-add { width: 100%; }
                    .ws-body { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    )
}
