import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Clock, Search, Filter, RefreshCw, AlertCircle, Info } from 'lucide-react'

export default function AuditTrail() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAction, setFilterAction] = useState('all')
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase.rpc('get_admin_audit_logs')

            if (fetchError) throw fetchError
            setLogs(data || [])
        } catch (err) {
            console.error('Error fetching audit logs:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.actor_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log.action?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesAction = filterAction === 'all' || log.action === filterAction
        return matchesSearch && matchesAction
    })

    const actionTypes = ['all', ...new Set(logs.map(l => l.action))]

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner"></div>
        </div>
    )

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Audit Trail</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Track all administrative actions across the platform</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.875rem' }}
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', backgroundColor: 'white' }}
                    >
                        {actionTypes.map(type => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Actions' : type.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={fetchLogs}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} color="#475569" />
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} /> Error: {error}
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Timestamp</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Actor</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Action</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Entity</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    No audit logs found.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{log.actor_name || log.actor_email || 'System'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.actor_email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '9999px',
                                            backgroundColor: getActionColor(log.action).bg,
                                            color: getActionColor(log.action).text,
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.025em'
                                        }}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 500, color: '#475569' }}>{log.entity_type}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>{log.entity_id}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{
                                            backgroundColor: '#f8fafc',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            color: '#475569',
                                            border: '1px solid #f1f5f9',
                                            maxWidth: '300px',
                                            maxHeight: '100px',
                                            overflowY: 'auto'
                                        }}>
                                            {Object.entries(log.details || {}).map(([key, val]) => (
                                                <div key={key} style={{ marginBottom: '0.125rem' }}>
                                                    <span style={{ fontWeight: 600, color: '#64748b' }}>{key}:</span> {String(val)}
                                                </div>
                                            ))}
                                            {Object.keys(log.details || {}).length === 0 && <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No extra details</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                Total logs: {filteredLogs.length}
            </div>
        </div>
    )
}

function getActionColor(action) {
    if (action.includes('DELETE')) return { bg: '#fee2e2', text: '#991b1b' }
    if (action.includes('BAN') || action.includes('UPDATE_STATUS')) return { bg: '#fffbeb', text: '#92400e' }
    if (action.includes('CREATE')) return { bg: '#f0fdf4', text: '#166534' }
    return { bg: '#f1f5f9', text: '#475569' }
}
