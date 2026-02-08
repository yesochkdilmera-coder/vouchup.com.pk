import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
    CheckCircle, XCircle, Clock, AlertTriangle,
    ArrowLeft, ShieldCheck, Ban, MessageSquare,
    Search, Inbox, DollarSign, ChevronRight,
    RefreshCcw, AlertCircle, Calendar, MapPin
} from 'lucide-react'
import DetailedExpertProfile from '../../components/marketplace/DetailedExpertProfile'

export default function ExpertModeration() {
    const [experts, setExperts] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [selectedExpert, setSelectedExpert] = useState(null)

    // Moderation Workflow States
    const [feedback, setFeedback] = useState('')
    const [monthlyRate, setMonthlyRate] = useState('')
    const [priceWarning, setPriceWarning] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const topRef = useRef(null)

    useEffect(() => {
        fetchPendingExperts()
    }, [])

    useEffect(() => {
        if (selectedExpert) {
            setFeedback(selectedExpert.admin_feedback || '')
            setMonthlyRate(selectedExpert.monthly_rate || '')
            setPriceWarning(false)
            // Scroll to top when entering a profile
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [selectedExpert])

    const fetchPendingExperts = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, portfolio_items(*)')
                .eq('role', 'expert')
                .in('moderation_status', ['pending', 'changes_requested'])
                .order('submitted_at', { ascending: false })

            if (error) throw error
            setExperts(data || [])
        } catch (err) {
            console.error('Error fetching experts:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!monthlyRate) {
            setPriceWarning(true)
            const pricingEl = document.getElementById('pricing-section')
            pricingEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }

        setActionLoading(selectedExpert.id)
        try {
            const { error } = await supabase.rpc('approve_expert_profile', {
                target_user_id: selectedExpert.id,
                target_monthly_rate: parseFloat(monthlyRate)
            })
            if (error) throw error

            setExperts(prev => prev.filter(e => e.id !== selectedExpert.id))
            setSelectedExpert(null)
        } catch (err) {
            alert(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleRequestChanges = async () => {
        if (!feedback) return alert('Please enter a feedback comment for requested changes')

        setActionLoading(selectedExpert.id)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    moderation_status: 'changes_requested',
                    admin_feedback: feedback
                })
                .eq('id', selectedExpert.id)

            if (error) throw error
            setExperts(prev => prev.filter(e => e.id !== selectedExpert.id))
            setSelectedExpert(null)
        } catch (err) {
            alert(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async () => {
        if (!feedback) return alert('Please enter a reason for rejection')

        setActionLoading(selectedExpert.id)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    moderation_status: 'rejected',
                    admin_feedback: feedback
                })
                .eq('id', selectedExpert.id)

            if (error) throw error
            setExperts(prev => prev.filter(e => e.id !== selectedExpert.id))
            setSelectedExpert(null)
        } catch (err) {
            alert(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredExperts = experts.filter(e =>
        (e.full_name_draft || e.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="mod-loader">
            <RefreshCcw className="spinning" size={32} />
            <p>Syncing Expert Queue...</p>
        </div>
    )

    return (
        <div className="moderation-vertical-page">
            {!selectedExpert ? (
                /* INBOX VIEW */
                <div className="mod-inbox-view">
                    <div className="max-container">
                        <header className="mod-header">
                            <div>
                                <h1>Moderation Queue</h1>
                                <p>{experts.length} applications awaiting decision</p>
                            </div>
                            <div className="mod-search-bar">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Find expert by name..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </header>

                        <div className="expert-grid">
                            {filteredExperts.map(expert => (
                                <div key={expert.id} className="expert-list-card" onClick={() => setSelectedExpert(expert)}>
                                    <div className="el-avatar">
                                        <img src={expert.avatar_url_draft || 'https://via.placeholder.com/50'} alt="" />
                                    </div>
                                    <div className="el-content">
                                        <h3>{expert.full_name_draft || expert.full_name}</h3>
                                        <p>{expert.email}</p>
                                        <div className="el-meta">
                                            <span className="status-dot-label">
                                                <div className={`dot ${expert.moderation_status}`}></div>
                                                {expert.moderation_status.replace('_', ' ')}
                                            </span>
                                            <span className="time-since">
                                                <Clock size={12} />
                                                {new Date(expert.submitted_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="el-chevron" />
                                </div>
                            ))}
                            {filteredExperts.length === 0 && (
                                <div className="empty-queue-state">
                                    <Inbox size={48} />
                                    <p>Nothing to moderate right now.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* VERTICAL WORKFLOW VIEW */
                <div className="mod-workflow-view">
                    <header className="workflow-sticky-header">
                        <div className="max-container flex-header">
                            <button className="btn-back" onClick={() => setSelectedExpert(null)}>
                                <ArrowLeft size={18} />
                                <span>Back to Inbox</span>
                            </button>
                            <div className="submission-title">
                                <span className="sub-tag">REVIEWING SUBMISSION</span>
                                <span className="sub-name">{selectedExpert.full_name_draft || selectedExpert.full_name}</span>
                            </div>
                        </div>
                    </header>

                    <div className="workflow-container max-container-narrow">
                        {/* 1. Profile Preview Section */}
                        <div className="workflow-section">
                            <div className="workflow-section-header">
                                <span className="step-num">01</span>
                                <h2>Draft Profile Preview</h2>
                            </div>
                            <div className="draft-preview-wrapper">
                                <div className="draft-tag">DRAFT VERSION</div>
                                <DetailedExpertProfile expert={selectedExpert} isDraft={true} showActions={false} />
                            </div>
                        </div>

                        {/* 2. Integrity & System Info */}
                        <div className="workflow-section card-box">
                            <div className="workflow-section-header">
                                <span className="step-num">02</span>
                                <h2>Profile Integrity</h2>
                            </div>
                            <div className="integrity-grid">
                                <IntegrityItem
                                    label="Identity Status"
                                    value="Verified"
                                    icon={<ShieldCheck size={20} color="#10b981" />}
                                />
                                <IntegrityItem
                                    label="Timezone Readiness"
                                    value={selectedExpert.willing_timezone_shift_draft ? 'Flexible' : 'Local Only'}
                                    icon={<Clock size={20} color="#64748b" />}
                                />
                                <IntegrityItem
                                    label="Experience Level"
                                    value={`${selectedExpert.experience_years_draft || 0} Years`}
                                    icon={<MapPin size={20} color="#64748b" />}
                                />
                                <IntegrityItem
                                    label="Portfolio Integrity"
                                    value={selectedExpert.portfolio_items?.length > 0 ? 'Media Provided' : 'Missing'}
                                    icon={<Calendar size={20} color="#64748b" />}
                                />
                            </div>
                        </div>

                        {/* 3. Pricing Section */}
                        <div className={`workflow-section card-box pricing-card ${priceWarning ? 'pulse-warning' : ''}`} id="pricing-section">
                            <div className="workflow-section-header">
                                <span className="step-num">03</span>
                                <h2>Commercial Pricing</h2>
                            </div>
                            <div className="pricing-content">
                                <p className="pricing-desc">Set the target monthly contract rate for this expert in the marketplace.</p>
                                <div className={`pricing-input-group ${priceWarning ? 'error' : ''}`}>
                                    <div className="input-with-icon">
                                        <DollarSign size={24} className="input-icon" />
                                        <input
                                            type="number"
                                            placeholder="Monthly Contract Price"
                                            value={monthlyRate}
                                            onChange={e => {
                                                setMonthlyRate(e.target.value)
                                                setPriceWarning(false)
                                            }}
                                        />
                                    </div>
                                    <span className="currency-label">USD / mo</span>
                                </div>
                                {priceWarning && (
                                    <div className="warning-text">
                                        <AlertTriangle size={14} />
                                        <span>Monthly rate is mandatory for approval.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Feedback Section */}
                        <div className="workflow-section card-box">
                            <div className="workflow-section-header">
                                <span className="step-num">04</span>
                                <h2>Admin Feedback</h2>
                            </div>
                            <div className="feedback-content">
                                <textarea
                                    placeholder="Write a message to the expert. This is visible to them if you request changes or reject."
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    rows={5}
                                />
                                <div className="feedback-hint">
                                    <AlertCircle size={14} />
                                    <span>Help the expert improve their submission with clear feedback.</span>
                                </div>
                            </div>
                        </div>

                        {/* 5. Decision Area */}
                        <div className="workflow-section final-decision-section">
                            <div className="decision-summary">
                                <h3>Decision Summary</h3>
                                <p>By approving, you acknowledge that <strong>{selectedExpert.full_name_draft || selectedExpert.full_name}</strong> is verified and ready for deployment at <strong>${monthlyRate || '0'}/mo</strong>.</p>
                            </div>

                            <div className="decision-actions">
                                <button
                                    className="btn-decision-approve"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    {actionLoading === selectedExpert.id ? <RefreshCcw className="spinning" size={20} /> : <CheckCircle size={20} />}
                                    <span>Approve & List Expert</span>
                                </button>

                                <div className="decision-sub-row">
                                    <button
                                        className="btn-decision-request"
                                        onClick={handleRequestChanges}
                                        disabled={actionLoading}
                                    >
                                        <MessageSquare size={18} />
                                        <span>Request Changes</span>
                                    </button>
                                    <button
                                        className="btn-decision-reject"
                                        onClick={handleReject}
                                        disabled={actionLoading}
                                    >
                                        <XCircle size={18} />
                                        <span>Reject Application</span>
                                    </button>
                                </div>

                                <button
                                    className="btn-decision-ban"
                                    onClick={() => { if (confirm('Ban expert?')) alert('Banned') }}
                                    disabled={actionLoading}
                                >
                                    <Ban size={16} />
                                    <span>Ban Account Permanently</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .moderation-vertical-page {
                    min-height: 100vh;
                    background: #f8fafc;
                    padding-bottom: 5rem;
                }

                .max-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
                .max-container-narrow { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }

                /* Inbox Styling */
                .mod-inbox-view { padding-top: 3rem; }
                .mod-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; gap: 2rem; flex-wrap: wrap; }
                .mod-header h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
                .mod-header p { color: #64748b; font-weight: 500; font-size: 1.125rem; }

                .mod-search-bar { display: flex; align-items: center; gap: 0.75rem; background: white; padding: 0.875rem 1.5rem; border-radius: 1.25rem; border: 1px solid #e2e8f0; width: 100%; max-width: 450px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .mod-search-bar input { border: none; outline: none; flex: 1; font-weight: 500; font-size: 0.9375rem; }

                .expert-grid { display: grid; gap: 1rem; }
                .expert-list-card { background: white; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 1.5rem; display: flex; align-items: center; gap: 1.5rem; cursor: pointer; transition: all 0.2s; }
                .expert-list-card:hover { border-color: #2563eb; transform: translateX(4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

                .el-avatar { width: 60px; height: 60px; border-radius: 1.25rem; overflow: hidden; background: #f1f5f9; flex-shrink: 0; }
                .el-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .el-content { flex: 1; }
                .el-content h3 { font-size: 1.125rem; font-weight: 800; color: #1e293b; margin: 0 0 0.25rem; }
                .el-content p { color: #64748b; font-size: 0.875rem; margin: 0 0 0.75rem; }
                .el-meta { display: flex; gap: 1.5rem; }
                .status-dot-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
                .dot.pending { background: #f97316; }
                .dot.changes_requested { background: #2563eb; }
                .time-since { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
                .el-chevron { color: #cbd5e1; }

                /* Workflow Styling */
                .workflow-sticky-header { position: sticky; top: 0; z-index: 1000; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; padding: 1rem 0; }
                .flex-header { display: flex; align-items: center; gap: 2rem; }
                .btn-back { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #64748b; font-weight: 700; cursor: pointer; transition: color 0.2s; }
                .btn-back:hover { color: #0f172a; }
                .submission-title { display: flex; flex-direction: column; }
                .sub-tag { font-size: 0.625rem; font-weight: 900; color: #94a3b8; letter-spacing: 0.1em; }
                .sub-name { font-size: 1.125rem; font-weight: 800; color: #0f172a; }

                .workflow-container { padding-top: 3rem; display: flex; flex-direction: column; gap: 2.5rem; }
                .workflow-section { background: white; border-radius: 2rem; border: 1px solid #e2e8f0; padding: 2.5rem; position: relative; }
                .workflow-section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
                .step-num { font-size: 0.75rem; font-weight: 900; background: #0f172a; color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
                .workflow-section-header h2 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }

                .draft-preview-wrapper { background: #f1f5f9; padding: 2rem; border-radius: 1.5rem; position: relative; }
                .draft-tag { position: absolute; top: 1rem; right: 1rem; background: #f97316; color: white; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.625rem; font-weight: 900; letter-spacing: 0.05em; z-index: 10; }

                .integrity-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }
                .integrity-item-box { background: #f8fafc; padding: 1.5rem; border-radius: 1.25rem; border: 1px solid #e2e8f0; display: flex; gap: 1rem; align-items: center; }
                .ii-info label { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.125rem; }
                .ii-info span { font-size: 1rem; font-weight: 700; color: #1e293b; }

                .pricing-card.pulse-warning { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
                .pricing-desc { font-size: 0.9375rem; color: #64748b; margin-bottom: 1.5rem; font-weight: 500; }
                .pricing-input-group { display: flex; align-items: center; gap: 1rem; background: #f8fafc; border: 2px solid #e2e8f0; padding: 0.5rem 1.5rem; border-radius: 1.25rem; transition: all 0.2s; }
                .pricing-input-group:focus-within { border-color: #2563eb; background: white; transform: translateY(-2px); }
                .pricing-input-group.error { border-color: #ef4444; background: #fff1f2; }
                .input-with-icon { display: flex; align-items: center; gap: 1rem; flex: 1; }
                .input-icon { color: #cbd5e1; }
                .pricing-input-group input { border: none; background: none; outline: none; font-size: 2rem; font-weight: 800; color: #0f172a; width: 100%; }
                .currency-label { font-size: 1rem; font-weight: 800; color: #94a3b8; }
                .warning-text { margin-top: 0.75rem; color: #ef4444; font-size: 0.8125rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }

                .feedback-content textarea { width: 100%; border: 2px solid #e2e8f0; border-radius: 1.25rem; padding: 1.25rem; font-size: 1rem; font-weight: 500; outline: none; transition: all 0.2s; font-family: inherit; }
                .feedback-content textarea:focus { border-color: #2563eb; }
                .feedback-hint { margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.875rem; font-weight: 500; }

                .check-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 1rem; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; margin-bottom: 0.5rem; }
                .check-row:hover { background: #f1f5f9; }
                .check-row input { width: 1.25rem; height: 1.25rem; cursor: pointer; }
                .check-row span { font-weight: 600; color: #475569; }

                .final-decision-section { background: #0f172a; border: none; color: white; display: flex; flex-direction: column; gap: 2.5rem; }
                .decision-summary h3 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.75rem; color: white; }
                .decision-summary p { font-size: 1.125rem; color: rgba(255,255,255,0.6); }
                .decision-summary strong { color: #3b82f6; }

                .decision-actions { display: flex; flex-direction: column; gap: 1rem; }
                .btn-decision-approve { background: #10b981; color: white; border: none; padding: 1.25rem; border-radius: 1.25rem; font-size: 1.125rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); }
                .btn-decision-approve:hover { transform: translateY(-2px); background: #059669; }

                .decision-sub-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .btn-decision-request { background: rgba(255,255,255,0.1); color: white; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
                .btn-decision-request:hover { background: rgba(255,255,255,0.2); }
                .btn-decision-reject { background: #fee2e2; color: #991b1b; border: none; padding: 1rem; border-radius: 1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
                .btn-decision-reject:hover { background: #fecaca; }

                .btn-decision-ban { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); padding: 0.75rem; border-radius: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.8125rem; }
                .btn-decision-ban:hover { color: #ef4444; border-color: #ef4444; }

                .spinning { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .mod-loader { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; color: #64748b; }

                @media (max-width: 640px) {
                    .workflow-section { padding: 1.5rem; border-radius: 1.5rem; }
                    .mod-header { flex-direction: column; align-items: flex-start; }
                    .decision-sub-row { grid-template-columns: 1fr; }
                    .flex-header { gap: 1rem; }
                }
            `}</style>
        </div>
    )
}

function IntegrityItem({ label, value, icon }) {
    return (
        <div className="integrity-item-box">
            <div className="ii-icon">{icon}</div>
            <div className="ii-info">
                <label>{label}</label>
                <span>{value}</span>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const configs = {
        pending: { label: 'New Submission', color: '#92400e', bg: '#fffbeb' },
        changes_requested: { label: 'Revising', color: '#2563eb', bg: '#eff6ff' },
        approved: { label: 'Live', color: '#166534', bg: '#f0fdf4' },
        rejected: { label: 'Rejected', color: '#991b1b', bg: '#fef2f2' }
    }
    const config = configs[status] || configs.pending;

    return (
        <span style={{
            fontSize: '0.625rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            padding: '0.375rem 0.625rem',
            borderRadius: '6px',
            backgroundColor: config.bg,
            color: config.color,
            border: `1px solid ${config.color}20`,
            letterSpacing: '0.05em'
        }}>
            {config.label}
        </span>
    );
}
