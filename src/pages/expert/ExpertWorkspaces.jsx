import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import { Briefcase, ChevronRight, Calendar, Target, ListChecks, User, ArrowLeft, ExternalLink } from 'lucide-react'

export default function ExpertWorkspaces() {
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedWorkspace, setSelectedWorkspace] = useState(null)

    useEffect(() => {
        fetchWorkspaces()
    }, [])

    const fetchWorkspaces = async () => {
        try {
            const { data, error } = await supabase
                .from('workspace_experts')
                .select(`
                    workspace_id,
                    workspaces (
                        id,
                        name,
                        description,
                        status,
                        created_at,
                        agency:profiles (
                            agency_name,
                            full_name,
                            email
                        )
                    )
                `)

            if (error) throw error
            setWorkspaces(data.map(d => d.workspaces))
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>

    if (selectedWorkspace) {
        return <WorkspaceDetail workspace={selectedWorkspace} onBack={() => setSelectedWorkspace(null)} />
    }

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>My Workspaces</h1>
                <p style={{ color: '#64748b' }}>Projects you are currently assigned to.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workspaces.length > 0 ? (
                    workspaces.map(ws => (
                        <div
                            key={ws.id}
                            onClick={() => setSelectedWorkspace(ws)}
                            style={{
                                backgroundColor: 'white',
                                padding: '1.25rem',
                                borderRadius: '1rem',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2563eb'
                                }}>
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.125rem' }}>{ws.name}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Target size={12} /> {ws.status || 'Active'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>•</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{ws.agency?.agency_name || 'Individual Agency'}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                        <Briefcase size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#64748b', fontWeight: 600 }}>No project assignments found</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Contact your agency admin to get assigned.</p>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}

function WorkspaceDetail({ workspace, onBack }) {
    return (
        <div style={{ animation: 'slideIn 0.3s ease-out' }}>
            <button
                onClick={onBack}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: 0, fontWeight: 600 }}
            >
                <ArrowLeft size={18} /> Back to projects
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                {/* Main Info */}
                <div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{workspace.name}</h1>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Badge text={workspace.status} color="#2563eb" />
                            <Badge text="Staff Augmentation" color="#64748b" />
                        </div>
                    </div>

                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={20} color="#2563eb" /> Project Description
                        </h2>
                        <div style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap', backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                            {workspace.description || "No description provided for this project."}
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ListChecks size={20} color="#2563eb" /> Key Deliverables
                        </h2>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {['Initial Strategy Audit', 'Monthly Reporting', 'Execution of Campaigns'].map((item, i) => (
                                <div key={i} style={{ backgroundColor: 'white', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '8px', height: '8px', backgroundColor: '#bfdbfe', borderRadius: '50%' }} />
                                    <span style={{ color: '#475569', fontSize: '0.9375rem' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div>
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', sticky: 'top', top: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>Agency Contact</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700 }}>
                                {workspace.agency?.agency_name?.substring(0, 1) || 'A'}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{workspace.agency?.agency_name || 'Agency Admin'}</p>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Project Owner</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <SidebarInfo icon={<User size={16} />} label="Manager" value={workspace.agency?.full_name || 'Unassigned'} />
                            <SidebarInfo icon={<Calendar size={16} />} label="Started" value={new Date(workspace.created_at).toLocaleDateString()} />
                        </div>

                        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />

                        <button style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#1e293b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            Open Shared Drive <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}

function Badge({ text, color }) {
    return (
        <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}30`
        }}>
            {text}
        </span>
    )
}

function SidebarInfo({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>
                {value}
            </div>
        </div>
    )
}
