
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { User, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Get message from previous step (e.g. signup success)
    const [message, setMessage] = useState(location.state?.message)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // AuthGate will handle the transition based on the new session
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">
                        Sign in
                    </h2>
                    <p className="auth-subtitle">
                        Or{' '}
                        <Link to="/signup" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                            create a new account
                        </Link>
                    </p>
                </div>

                {(error || message) && (
                    <div className="error-alert" style={!error ? { backgroundColor: '#f0fdf4', borderColor: '#22c55e', color: '#15803d' } : {}}>
                        <p>
                            {error || message}
                        </p>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <div className="input-icon-wrapper">
                            <User className="input-icon" />
                            <input
                                name="email"
                                type="email"
                                required
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-icon-wrapper">
                            <Lock className="input-icon" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
}
