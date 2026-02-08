import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Plus, ExternalLink, Trash2, X, Briefcase, Users, Search, AlertCircle, CheckCircle } from 'lucide-react'

export default function WorkspacesManagement() {
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [agencies, setAgencies] = useState([])
    const [newWorkspace, setNewWorkspace] = useState({ name: '', agency_id: '' })
    const [actionLoading, setActionLoading] = useState(null)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [wsRes, agenciesRes] = await Promise.all([
                supabase.rpc('get_admin_workspaces'),
                supabase.from('profiles').select('id, agency_name, full_name').eq('role', 'agency').order('agency_name', { ascending: true })
            ])

            if (wsRes.error) throw wsRes.error
            if (agenciesRes.error) throw agenciesRes.error

            setWorkspaces(wsRes.data || [])
            setAgencies(agenciesRes.data || [])
        } catch (err) {
            console.error('Error fetching data:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateWorkspace = async (e) => {
        e.preventDefault()
        setMessage(null)
        setActionLoading('create')

        try {
            const { error } = await supabase
                .from('workspaces')
                .insert({
                    name: newWorkspace.name,
                    agency_id: newWorkspace.agency_id,
                    status: 'active'
                })

            if (error) throw error

            setMessage({ type: 'success', text: 'Workspace created successfully' })
            fetchData()
            setIsCreateModalOpen(false)
            setNewWorkspace({ name: '', agency_id: '' })
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this workspace and all its data?")) return

        setActionLoading(id)
        setMessage(null)

        try {
            const { error } = await supabase.from('workspaces').delete().eq('id', id)
            if (error) throw error

            setMessage({ type: 'success', text: 'Workspace deleted' })
            setWorkspaces(workspaces.filter(w => w.id !== id))
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredWorkspaces = workspaces.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.agency_name || w.agency_full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner"></div>
        </div>
    )

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Workspaces</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Monitor agency environments and expert allocation</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Filter workspaces..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', outline: 'none' }}
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> New Workspace
                    </button>
                </div>
            </div>

            {/* Messages */}
            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '0.375rem',
                    backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    color: message.type === 'error' ? '#991b1b' : '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    {message.text}
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '0.375rem' }}>
                    Error: {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredWorkspaces.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'white', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', color: '#64748b' }}>
                        No workspaces found
                    </div>
                ) : (
                    filteredWorkspaces.map(ws => (
                        <div key={ws.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <Briefcase size={24} />
                                </div>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '9999px',
                                    backgroundColor: ws.status === 'active' ? '#dcfce7' : '#fee2e2',
                                    color: ws.status === 'active' ? '#15803d' : '#991b1b',
                                    fontWeight: 600
                                }}>
                                    {(ws.status || 'inactive').toUpperCase()}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{ws.name}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Agency: {ws.agency_name || ws.agency_full_name || 'N/A'}</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#475569', fontSize: '0.875rem' }}>
                                    <Users size={16} /> {ws.expert_count || 0} Experts
                                </div>
                                <div style={{ flex: 1 }} />
                                <button
                                    onClick={() => handleDelete(ws.id)}
                                    disabled={actionLoading === ws.id}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', hover: { color: '#ef4444' } }}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Initialize Workspace</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X /></button>
                        </div>
                        <form onSubmit={handleCreateWorkspace}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#475569' }}>Workspace Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newWorkspace.name}
                                    onChange={e => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                                    placeholder="e.g. Marketing Dev v1"
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#475569' }}>Assign Agency</label>
                                <select
                                    required
                                    value={newWorkspace.agency_id}
                                    onChange={e => setNewWorkspace({ ...newWorkspace, agency_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                                >
                                    <option value="">Select an agency...</option>
                                    {agencies.map(a => (
                                        <option key={a.id} value={a.id}>{a.agency_name || a.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading === 'create'}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    opacity: actionLoading === 'create' ? 0.7 : 1
                                }}
                            >
                                {actionLoading === 'create' ? 'Creating...' : 'Create Workspace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
