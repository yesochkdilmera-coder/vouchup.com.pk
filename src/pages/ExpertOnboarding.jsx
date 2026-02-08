
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Shield, Lock, Mail, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'

export default function ExpertOnboarding() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [invite, setInvite] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Missing invitation token.')
            setLoading(false)
            return
        }
        verifyToken()
    }, [token])

    const verifyToken = async () => {
        const { data, error } = await supabase
            .from('expert_invites')
            .select('*')
            .eq('token', token)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single()

        if (error || !data) {
            setError('This invitation link is invalid, expired, or has already been used.')
        } else {
            setInvite(data)
        }
        setLoading(false)
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            // 1. Create Auth Account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invite.email,
                password: password,
                options: {
                    data: {
                        full_name: invite.full_name,
                        role: 'expert'
                    }
                }
            })

            if (authError) throw authError

            // 2. Claim Invite and Create Profile via RPC
            const { error: claimError } = await supabase.rpc('claim_expert_invite', {
                p_token: token,
                p_user_id: authData.user.id
            })

            if (claimError) throw claimError

            // success -> Agreement
            navigate('/expert/agreement', { state: { userId: authData.user.id } })

        } catch (err) {
            console.error('Signup error:', err)
            setError(err.message || 'An error occurred during account creation.')
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
            <div className="spinner"></div>
        </div>
    )

    if (error) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#fee2e2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <AlertCircle size={32} color="#ef4444" />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Invalid Invitation</h1>
                <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>{error}</p>
                <button
                    onClick={() => navigate('/login')}
                    style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                    Return to Login
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Left Side - Visual */}
            <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '4rem', display: 'flex', flexDirection: 'column', color: 'white', justifyContent: 'center' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <Shield size={48} color="#3b82f6" style={{ marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>Welcome to the <span style={{ color: '#3b82f6' }}>Expert Network</span></h1>
                    <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginTop: '1rem', maxWidth: '400px' }}>Complete your account setup to start accepting exclusive opportunities.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#334155', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <CheckCircle size={20} color="#3b82f6" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Verified Invitation Only</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#334155', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <CheckCircle size={20} color="#3b82f6" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Secure Professional Profile</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#334155', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <CheckCircle size={20} color="#3b82f6" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Compliant Agreement Framework</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ maxWidth: '480px', width: '100%' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a' }}>Set Your Password</h2>
                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>To finalize your verified account for <strong>{invite.email}</strong></p>
                    </div>

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', translate: '0 -50%', color: '#94a3b8' }} />
                                <input
                                    readOnly
                                    value={invite.full_name}
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', translate: '0 -50%', color: '#94a3b8' }} />
                                <input
                                    readOnly
                                    value={invite.email}
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', translate: '0 -50%', color: '#94a3b8' }} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', outline: 'none', transition: 'border-color 0.2s' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Use at least 8 characters with letters and numbers.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '0.875rem',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                border: 'none',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.7 : 1,
                                fontSize: '1rem',
                                marginTop: '1rem'
                            }}
                        >
                            {submitting ? 'Creating Account...' : 'Continue to Agreement'}
                        </button>

                        {error && (
                            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fee2e2' }}>
                                <AlertCircle size={18} color="#ef4444" />
                                <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{error}</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
