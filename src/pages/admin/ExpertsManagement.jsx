import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { UserCheck, Search, Ban, Trash2, CheckCircle, AlertCircle, RefreshCw, UserPlus, X, Mail, Link, Copy } from 'lucide-react'

export default function ExpertsManagement() {
    const [experts, setExperts] = useState([])
    const [invites, setInvites] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionLoading, setActionLoading] = useState(null)
    const [message, setMessage] = useState(null)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
    const [generatedInvite, setGeneratedInvite] = useState(null)
    const [view, setView] = useState('active') // 'active' or 'pending'

    const [inviteForm, setInviteForm] = useState({
        email: '',
        full_name: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        setError(null)

        try {
            const [profilesRes, invitesRes] = await Promise.all([
                supabase.rpc('get_all_profiles'),
                supabase.from('expert_invites').select('*').order('created_at', { ascending: false })
            ])

            if (profilesRes.error) throw profilesRes.error
            if (invitesRes.error) throw invitesRes.error

            const expertsOnly = (profilesRes.data || []).filter(p => p.role === 'expert')
            setExperts(expertsOnly)
            setInvites(invitesRes.data || [])
        } catch (err) {
            console.error('Error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleInvite(e) {
        e.preventDefault()
        setActionLoading('invite')
        setMessage(null)

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 72) // 72 hour expiry

        try {
            const { data, error } = await supabase
                .from('expert_invites')
                .insert({
                    email: inviteForm.email,
                    full_name: inviteForm.full_name,
                    token: token,
                    status: 'pending',
                    expires_at: expiresAt.toISOString(),
                    created_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select()
                .single()

            if (error) throw error

            const inviteUrl = `${window.location.origin}/expert/onboard?token=${token}`
            setGeneratedInvite({ ...data, url: inviteUrl })
            setIsInviteModalOpen(false)
            setIsLinkModalOpen(true)
            setInviteForm({ email: '', full_name: '' })
            fetchData()
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleBan(userId, currentStatus) {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned'
        setActionLoading(userId)
        setMessage(null)

        try {
            const { error } = await supabase.rpc('update_user_status', {
                target_user_id: userId,
                new_status: newStatus
            })

            if (error) throw error

            setMessage({ type: 'success', text: `Expert ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully` })
            await fetchData()
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleDelete(userId) {
        if (!confirm('Are you sure you want to delete this expert? This action cannot be undone.')) {
            return
        }

        setActionLoading(userId)
        setMessage(null)

        try {
            const { error } = await supabase.rpc('delete_user_profile', {
                target_user_id: userId
            })

            if (error) throw error

            setMessage({ type: 'success', text: 'Expert profile deleted successfully' })
            await fetchData()
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleRevokeInvite(inviteId) {
        if (!confirm('Revoke this invitation?')) return
        setActionLoading(inviteId)
        try {
            const { error } = await supabase.from('expert_invites').delete().eq('id', inviteId)
            if (error) throw error
            fetchData()
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alert('Invite link copied to clipboard!')
    }

    const filteredExperts = experts.filter(e =>
        e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredInvites = invites.filter(i =>
        i.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Experts Management</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage registered experts and send invitations</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={fetchData}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                        <UserPlus size={18} /> Invite Expert
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <button
                    onClick={() => setView('active')}
                    style={{
                        padding: '0.75rem 0.25rem',
                        borderBottom: view === 'active' ? '2px solid #2563eb' : '2px solid transparent',
                        color: view === 'active' ? '#2563eb' : '#64748b',
                        fontWeight: view === 'active' ? 600 : 400,
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Registered Experts ({experts.length})
                </button>
                <button
                    onClick={() => setView('pending')}
                    style={{
                        padding: '0.75rem 0.25rem',
                        borderBottom: view === 'pending' ? '2px solid #2563eb' : '2px solid transparent',
                        color: view === 'pending' ? '#2563eb' : '#64748b',
                        fontWeight: view === 'pending' ? 600 : 400,
                        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Pending Invites ({invites.length})
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '0.375rem',
                    backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    color: message.type === 'error' ? '#991b1b' : '#166534',
                    display: 'flex',
                    alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem'
                }}>
                    {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder={view === 'active' ? "Search registered experts..." : "Search pending invites..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                />
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {view === 'active' ? (
                    filteredExperts.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            <UserCheck size={48} style={{ marginBottom: '1rem', opacity: 0.2, margin: '0 auto' }} />
                            <p>No experts found</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Name</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Email</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExperts.map((expert) => (
                                    <tr key={expert.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#1e293b' }}>{expert.full_name}</td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: '#64748b' }}>{expert.email}</td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><StatusBadge status={expert.status} /></td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleBan(expert.id, expert.status)} style={{ padding: '0.4rem 0.75rem', backgroundColor: expert.status === 'banned' ? '#f0fdf4' : '#fef2f2', color: expert.status === 'banned' ? '#166534' : '#991b1b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {expert.status === 'banned' ? <CheckCircle size={14} /> : <Ban size={14} />} {expert.status === 'banned' ? 'Unban' : 'Ban'}
                                                </button>
                                                <button onClick={() => handleDelete(expert.id)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#fef2f2', color: '#991b1b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    filteredInvites.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.2, margin: '0 auto' }} />
                            <p>No pending invitations</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Name</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Email</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Quick Link</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvites.map((invite) => (
                                    <tr key={invite.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#1e293b' }}>{invite.full_name}</td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: '#64748b' }}>{invite.email}</td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <button
                                                onClick={() => copyToClipboard(`${window.location.origin}/expert/onboard?token=${invite.token}`)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <Link size={14} /> Copy Link
                                            </button>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <button onClick={() => handleRevokeInvite(invite.id)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#fef2f2', color: '#991b1b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <X size={14} /> Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Invite New Expert</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
                                <input required className="input-field" style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={inviteForm.full_name} onChange={e => setInviteForm({ ...inviteForm, full_name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email Address</label>
                                <input required type="email" className="input-field" style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }} value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
                            </div>
                            <button type="submit" disabled={actionLoading === 'invite'} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                                {actionLoading === 'invite' ? 'Generating...' : 'Generate Invite Link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Link Success Modal */}
            {isLinkModalOpen && generatedInvite && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 101 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                        <div style={{ backgroundColor: '#f0fdf4', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle size={32} color="#166534" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Invitation Ready!</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Copy this unique link and send it to <strong>{generatedInvite.full_name}</strong>. It expires in 72 hours.</p>

                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                            <input
                                readOnly
                                value={generatedInvite.url}
                                style={{ width: '100%', padding: '1rem 3.5rem 1rem 1rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.875rem', fontWeight: 500 }}
                            />
                            <button
                                onClick={() => copyToClipboard(generatedInvite.url)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer' }}
                            >
                                <Copy size={18} />
                            </button>
                        </div>

                        <button onClick={() => setIsLinkModalOpen(false)} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }) {
    const colors = { active: { bg: '#f0fdf4', text: '#166534' }, banned: { bg: '#fef2f2', text: '#991b1b' }, suspended: { bg: '#fffbeb', text: '#92400e' } }
    const style = colors[status] || colors.active
    return <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', backgroundColor: style.bg, color: style.text, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{status || 'active'}</span>
}
