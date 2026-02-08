
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../components/AuthProvider'
import { FileText, CheckCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

export default function ExpertAgreement() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const { user } = useAuth() // Access the authenticated user from context

    // Fallback logic: prefer context user, then location state userId
    const initialUserId = user?.id || state?.userId

    const userId = initialUserId

    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
    const [typedName, setTypedName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const contentRef = useRef(null)

    useEffect(() => {
        // If neither source provides a user ID, redirect to login
        if (!userId) {
            console.warn("ExpertAgreement: No User ID found (checked context and location state). Redirecting to login.")
            navigate('/login')
        }
    }, [userId, navigate])

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setHasScrolledToBottom(true)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        if (!userId) {
            setError("Session error: Missing user ID. Please log in again.")
            setSubmitting(false)
            return
        }

        try {
            // Record acceptance
            const { error: agError } = await supabase
                .from('agreement_acceptances')
                .insert({
                    user_id: userId,
                    agreement_version: 'v1.0-expert',
                    agreement_content: 'Expert Service Agreement v1.0 (Full Text)',
                    agreement_type: 'expert',
                    role: 'expert',
                    signature: typedName,
                    ip_address: '0.0.0.0',
                    user_agent: navigator.userAgent
                })

            if (agError) throw agError

            // SUCCESS - Stop loading first
            setSubmitting(false)

            // Clear session and go to login
            await supabase.auth.signOut()
            alert("Agreement accepted! Please log in to your new expert panel.")
            navigate('/login')

        } catch (err) {
            console.error('Agreement error:', err)
            setError(`Failed: ${err.message}`)
            setSubmitting(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem' }}>
            <div style={{ maxWidth: '800px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ backgroundColor: '#eff6ff', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <ShieldCheck size={32} color="#2563eb" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Expert Service Agreement</h1>
                    <p style={{ color: '#64748b' }}>Please review and acknowledge our terms of engagement for the expert network.</p>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    {/* Progress Bar */}
                    <div style={{ height: '4px', backgroundColor: '#f1f5f9', width: '100%' }}>
                        <div style={{ height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s', width: hasScrolledToBottom ? '100%' : '50%' }}></div>
                    </div>

                    <div
                        ref={contentRef}
                        onScroll={handleScroll}
                        style={{ height: '450px', overflowY: 'auto', padding: '2.5rem', fontSize: '0.9375rem', lineHeight: '1.7', color: '#334155' }}
                    >
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>1. Professional Relationship</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            This agreement governs your relationship as an Independent Contractor within the Platform. You acknowledge that you are not an employee, agent, or representative of the platform owner. You are responsible for your own taxes, equipment, and professional conduct.
                        </p>

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>2. Confidentiality & IP</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            All project information, client data, and platform materials provided during your engagement remain strictly confidential. You grant the platform an irrevocable license to use any work product specifically commissioned through the platform while retaining your background expertise and methodologies.
                        </p>

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>3. Professional Standards</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            You agree to perform all services with reasonable care and skill. Any breach of professional standards or ethics may result in immediate revocation of your expert status and access to the network.
                        </p>

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>4. Non-Circumvention</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            You agree not to directly solicit or perform services for clients introduced through the platform outside of the platform framework for a period of 12 months following the introduction.
                        </p>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <p style={{ fontStyle: 'italic', color: '#64748b' }}>End of Service Agreement v1.0-expert</p>
                        </div>
                    </div>

                    <div style={{ padding: '2.5rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                        <form onSubmit={handleSubmit}>
                            {!hasScrolledToBottom && (
                                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 500 }}>
                                    <AlertCircle size={18} />
                                    Please scroll to the bottom of the agreement to continue.
                                </div>
                            )}

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>Type your full name to sign:</label>
                                <input
                                    required
                                    disabled={!hasScrolledToBottom}
                                    type="text"
                                    placeholder="Enter your full name..."
                                    value={typedName}
                                    onChange={e => setTypedName(e.target.value)}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', shadow: 'inset 0 1px 2px rgba(0,0,0,0.05)', backgroundColor: !hasScrolledToBottom ? '#f1f5f9' : 'white' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!hasScrolledToBottom || !typedName || submitting}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: (!hasScrolledToBottom || !typedName || submitting) ? 'not-allowed' : 'pointer',
                                    opacity: (!hasScrolledToBottom || !typedName || submitting) ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    fontSize: '1rem'
                                }}
                            >
                                {submitting ? 'Finalizing...' : 'Accept Agreement & Complete Onboarding'}
                                {!submitting && <ArrowRight size={20} />}
                            </button>

                            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
                        </form>
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Need help? Contact support@platform.com
                </p>
            </div>
        </div>
    )
}
