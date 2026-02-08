import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Users, Search, Ban, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function AgenciesManagement() {
    const [agencies, setAgencies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionLoading, setActionLoading] = useState(null)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        fetchAgencies()
    }, [])

    async function fetchAgencies() {
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabase.rpc('get_all_profiles')

            if (fetchError) {
                console.error('Agencies fetch error:', {
                    message: fetchError.message,
                    details: fetchError.details,
                    hint: fetchError.hint,
                    code: fetchError.code
                })
                setError(fetchError.message)
                return
            }

            // Filter to only agencies
            const agenciesOnly = (data || []).filter(p => p.role === 'agency')
            console.log('AGENCIES LOADED:', agenciesOnly.length)
            setAgencies(agenciesOnly)
        } catch (err) {
            console.error('Error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
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

            if (error) {
                console.error('Ban error:', error)
                setMessage({ type: 'error', text: error.message })
                return
            }

            setMessage({ type: 'success', text: `User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully` })
            await fetchAgencies() // Refresh list
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleDelete(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        setActionLoading(userId)
        setMessage(null)

        try {
            const { error } = await supabase.rpc('delete_user_profile', {
                target_user_id: userId
            })

            if (error) {
                console.error('Delete error:', error)
                setMessage({ type: 'error', text: error.message })
                return
            }

            setMessage({ type: 'success', text: 'User deleted successfully' })
            await fetchAgencies() // Refresh list
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredAgencies = agencies.filter(a =>
        a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.agency_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Agencies Management</h1>
                <button
                    onClick={fetchAgencies}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                >
                    <RefreshCw size={16} /> Refresh
                </button>
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

            {/* Search */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    type="text"
                    placeholder="Search agencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 3rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                    }}
                />
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {filteredAgencies.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No agencies found</p>
                        {searchTerm && <p style={{ fontSize: '0.875rem' }}>Try adjusting your search</p>}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Name</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Agency</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Email</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Status</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgencies.map((agency) => (
                                <tr key={agency.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#1e293b' }}>
                                        {agency.full_name || 'No name'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>
                                        {agency.agency_name || '-'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>
                                        {agency.email}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <StatusBadge status={agency.status} />
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleBan(agency.id, agency.status)}
                                                disabled={actionLoading === agency.id}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    backgroundColor: agency.status === 'banned' ? '#f0fdf4' : '#fef2f2',
                                                    color: agency.status === 'banned' ? '#166534' : '#991b1b',
                                                    border: 'none',
                                                    borderRadius: '0.25rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {agency.status === 'banned' ? <CheckCircle size={14} /> : <Ban size={14} />}
                                                {agency.status === 'banned' ? 'Unban' : 'Ban'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(agency.id)}
                                                disabled={actionLoading === agency.id}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    backgroundColor: '#fef2f2',
                                                    color: '#991b1b',
                                                    border: 'none',
                                                    borderRadius: '0.25rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                Showing {filteredAgencies.length} of {agencies.length} agencies
            </div>
        </div>
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
