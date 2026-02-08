import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { FileText, Search, RefreshCw, AlertCircle } from 'lucide-react'

export default function AdminAgreements() {
    const [agreements, setAgreements] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAgreements()
    }, [])

    const fetchAgreements = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase.rpc('get_admin_agreements')

            if (fetchError) throw fetchError
            setAgreements(data || [])
        } catch (err) {
            console.error('Error fetching agreements:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredAgreements = agreements.filter(agm =>
        (agm.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agm.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agm.agency_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agm.signature || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Legal Agreements Audit</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Review all signed expert and agency terms</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search signatures..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', outline: 'none' }}
                        />
                    </div>
                    <button
                        onClick={fetchAgreements}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} />
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
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>User / Agency</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Agreement Ver.</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Signed At</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Signature</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569' }}>Meta Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgreements.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.2, margin: '0 auto' }} />
                                    <p>No agreement acceptances found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredAgreements.map((agm) => (
                                <tr key={agm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{agm.full_name || 'N/A'}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{agm.agency_name || 'Individual'}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{agm.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            backgroundColor: '#eff6ff',
                                            color: '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {agm.agreement_version}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#334155' }}>
                                        {agm.accepted_at ? new Date(agm.accepted_at).toLocaleString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 500 }}>
                                        {agm.signature}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                        <div>IP: <span style={{ color: '#475569' }}>{agm.ip_address || 'N/A'}</span></div>
                                        <div title={agm.user_agent} style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            UA: {agm.user_agent}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                Total records: {filteredAgreements.length}
            </div>
        </div>
    )
}
