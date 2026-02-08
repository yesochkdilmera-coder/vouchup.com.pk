import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Settings, Save, Shield, FileText, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

export default function AdminSettings() {
    const [settings, setSettings] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(null)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('admin_settings')
                .select('*')
                .order('key', { ascending: true })

            if (error) throw error
            setSettings(data || [])
        } catch (err) {
            console.error('Error fetching settings:', err)
            setMessage({ type: 'error', text: 'Error fetching settings: ' + err.message })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateJson = async (key, newValue) => {
        setSaving(key)
        setMessage(null)
        try {
            const { error } = await supabase
                .from('admin_settings')
                .update({
                    value: newValue,
                    updated_at: new Date().toISOString()
                })
                .eq('key', key)

            if (error) throw error
            setMessage({ type: 'success', text: `Setting '${key}' updated successfully` })

            // Log to audit trail
            await supabase.from('audit_logs').insert({
                action_type: 'UPDATE_SETTING',
                target_type: 'SETTING',
                target_id: key,
                metadata: { key, newValue },
                actor_id: (await supabase.auth.getUser()).data.user?.id,
                actor_email: (await supabase.auth.getUser()).data.user?.email
            })

        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update: ' + err.message })
            fetchSettings() // Reset UI
        } finally {
            setSaving(null)
        }
    }

    const toggleFeature = (config, feature) => {
        const newValue = { ...config.value, [feature]: !config.value[feature] }
        setSettings(settings.map(s => s.key === config.key ? { ...s, value: newValue } : s))
        handleUpdateJson(config.key, newValue)
    }

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner"></div>
        </div>
    )

    const featureFlags = settings.find(s => s.key === 'feature_flags')
    const agreementConfig = settings.find(s => s.key === 'agreement_config')

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>System Configuration</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Global platform settings and feature management</p>
                </div>
                <button
                    onClick={fetchSettings}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Messages */}
            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '2rem',
                    borderRadius: '0.375rem',
                    backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    color: message.type === 'error' ? '#991b1b' : '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                }}>
                    {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                {/* Feature Toggles */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <Shield size={20} color="#2563eb" />
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Feature Toggles</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {featureFlags ? Object.entries(featureFlags.value).map(([feature, enabled]) => (
                            <div key={feature} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{ fontWeight: 600, textTransform: 'capitalize', color: '#1e293b' }}>{feature.replace(/_/g, ' ')}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{enabled ? 'Feature is currently active' : 'Feature is currently disabled'}</div>
                                </div>
                                <button
                                    onClick={() => toggleFeature(featureFlags, feature)}
                                    disabled={saving === 'feature_flags'}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: enabled ? '#2563eb' : '#94a3b8', transition: 'color 0.2s' }}
                                >
                                    {enabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                </button>
                            </div>
                        )) : <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No feature flags configured</div>}
                    </div>
                </div>

                {/* Agreement Policy */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <FileText size={20} color="#2563eb" />
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Legal Agreement Versions</h2>
                    </div>

                    {agreementConfig ? (
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Current Global Version</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="text"
                                        defaultValue={agreementConfig.value.current_version}
                                        onBlur={(e) => {
                                            if (e.target.value !== agreementConfig.value.current_version) {
                                                handleUpdateJson(agreementConfig.key, { ...agreementConfig.value, current_version: e.target.value })
                                            }
                                        }}
                                        style={{ flex: 1, padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                                    />
                                    {saving === agreementConfig.key && (
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                                            <div className="spinner-small" style={{ marginRight: '0.5rem' }}></div> Saving
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>Users will be prompted to re-sign if their signed version is lower than this.</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Version History</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {(agreementConfig.value.versions || []).map(v => (
                                        <div key={v} style={{
                                            backgroundColor: v === agreementConfig.value.current_version ? '#eff6ff' : '#f1f5f9',
                                            color: v === agreementConfig.value.current_version ? '#1e40af' : '#475569',
                                            border: v === agreementConfig.value.current_version ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {v} {v === agreementConfig.value.current_version && '(Active)'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Agreement configuration not found</div>}
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Settings size={20} color="#b45309" style={{ marginTop: '0.125rem' }} />
                <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>Administrative Warning</h4>
                    <p style={{ fontSize: '0.875rem', color: '#b45309' }}>Changes made here take effect immediately for all users. Be cautious when toggling production feature flags or forcing agreement re-signs.</p>
                </div>
            </div>
        </div>
    )
}
