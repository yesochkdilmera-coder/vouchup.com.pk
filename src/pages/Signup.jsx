
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, User, Building, Mail, Phone, Lock, Scroll, CheckCircle } from 'lucide-react'

export default function Signup() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Step 1: User Info State
    const [formData, setFormData] = useState({
        fullName: '',
        agencyName: '',
        email: '',
        password: ''
    })

    // Step 2: SLA State
    const [slaScrolled, setSlaScrolled] = useState(false)
    const [signature, setSignature] = useState('')
    const scrollRef = useRef(null)

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // --- Step 1 Helpers ---
    const validateStep1 = () => {
        if (!formData.fullName || !formData.email || !formData.password) {
            setError("Please fill in all required fields.")
            return false
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.")
            return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.")
            return false
        }
        return true
    }

    const handleNextStep = (e) => {
        e.preventDefault()
        setError(null)
        if (validateStep1()) {
            setStep(2)
        }
    }

    // --- Step 2 Helpers ---
    const handleScroll = () => {
        const el = scrollRef.current
        if (!el) return
        if (el.scrollHeight - el.scrollTop <= el.clientHeight + 10) {
            setSlaScrolled(true)
        }
    }

    const handleCreateAccount = async () => {
        setError(null)
        setLoading(true)

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        agency_name: formData.agencyName,
                        role: 'agency'
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        full_name: formData.fullName,
                        agency_name: formData.agencyName,
                        email: formData.email,
                        role: 'agency'
                    })


                if (profileError) {
                    console.error("Profile creation failed:", profileError)
                }
            }

            // 3. Record Agreement Acceptance
            const { error: agreementError } = await supabase
                .from('agreement_acceptances')
                .insert({
                    user_id: authData.user.id,
                    agreement_version: '1.0',
                    agreement_content: 'Full text of the agreement v1.0...', // In a real app, capture exact text shown
                    signature: signature,
                    user_agent: navigator.userAgent
                })


            if (agreementError) {
                console.error("Agreement recording failed:", agreementError)
            }

            // AuthGate will handle the transition
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: step === 2 ? '36rem' : '28rem' }}>

                {/* Header */}
                <div className="auth-header">
                    <h2 className="auth-title">
                        {step === 1 ? "Create your account" : "Sign Agreement"}
                    </h2>
                    <p className="auth-subtitle">
                        Step {step} of 2
                    </p>
                </div>

                {error && (
                    <div className="error-alert">
                        <p>{error}</p>
                    </div>
                )}

                {/* --- Step 1: User Info --- */}
                {step === 1 && (
                    <form className="auth-form" onSubmit={handleNextStep}>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-icon-wrapper">
                                <User className="input-icon" />
                                <input name="fullName" type="text" required className="input-field" placeholder="John Doe"
                                    value={formData.fullName} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Agency Name</label>
                            <div className="input-icon-wrapper">
                                <Building className="input-icon" />
                                <input name="agencyName" type="text" required className="input-field" placeholder="Acme Inc."
                                    value={formData.agencyName} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-icon-wrapper">
                                <Mail className="input-icon" />
                                <input name="email" type="email" required className="input-field" placeholder="you@example.com"
                                    value={formData.email} onChange={handleInputChange} />
                            </div>
                        </div>


                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-icon-wrapper">
                                <Lock className="input-icon" />
                                <input name="password" type="password" required className="input-field" placeholder="••••••••"
                                    value={formData.password} onChange={handleInputChange} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Continue
                        </button>

                        <div className="text-center mt-4">
                            <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </form>
                )}

                {/* --- Step 2: SLA --- */}
                {step === 2 && (
                    <div className="sla-wrapper" style={{ marginTop: '2rem' }}>
                        <div className="sla-container" ref={scrollRef} onScroll={handleScroll}>
                            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Service Level Agreement</h4>
                            <p className="mb-2">Please read the following agreement carefully.</p>
                            <p className="mb-2">1. Terms of Service... (Scroll to confirm you have read this)</p>
                            {Array.from({ length: 20 }).map((_, i) => (
                                <p key={i} className="mb-2">
                                    Clause {i + 2}: By using this service, you agree to comply with all applicable laws and regulations.
                                    Any violation may result in termination of your account. We reserve the right to modify these terms.
                                </p>
                            ))}
                            <p style={{ fontWeight: 700, marginTop: '1rem' }}>End of Agreement.</p>
                        </div>

                        {!slaScrolled && (
                            <p style={{ fontSize: '0.75rem', color: '#ea580c', textAlign: 'center', marginTop: '0.5rem' }}>
                                Please scroll to the bottom of the agreement to proceed.
                            </p>
                        )}

                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label className="form-label">
                                Signature (Type your full name: <strong>{formData.fullName}</strong>)
                            </label>
                            <input
                                type="text"
                                disabled={!slaScrolled}
                                className="input-field"
                                style={!slaScrolled ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                                placeholder="Type your full name"
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back
                            </button>

                            <button
                                onClick={handleCreateAccount}
                                disabled={!slaScrolled || signature !== formData.fullName || loading}
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                            >
                                {loading ? 'Creating Account...' : 'Agree & Create Account'}
                            </button>
                        </div>

                        {slaScrolled && signature !== formData.fullName && (
                            <p style={{ fontSize: '0.75rem', color: '#ef4444', textAlign: 'center', marginTop: '0.5rem' }}>Signature must exactly match your full name.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
