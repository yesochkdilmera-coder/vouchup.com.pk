
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react'

export default function Landing() {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <header className="landing-header">
                <div className="nav-container">
                    <div className="flex items-center">
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>StaffAug</span>
                    </div>

                    <nav className="nav-links">
                        <Link to="/login" className="btn btn-secondary" style={{ border: 'none' }}>
                            Sign in
                        </Link>
                        <Link to="/signup" className="btn btn-primary">
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="hero-section">
                <div className="hero-content">
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                        Coming soon
                    </span>
                    <h1>
                        <span style={{ display: 'block' }}>Scale your agency</span>
                        <span style={{ display: 'block', color: 'var(--color-primary)' }}>with on-demand talent</span>
                    </h1>
                    <p>
                        Access a vetted network of top-tier developers, designers, and project managers.
                        Build your team instantly without the overhead.
                    </p>

                    <div className="hero-cta">
                        <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                            Start Hiring <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                        </Link>
                        <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                            Client Login
                        </Link>
                    </div>
                </div>

                {/* Feature List */}
                <div className="hero-image">
                    <div className="features-card">
                        <div className="features-header">
                            <h3 style={{ margin: 0 }}>Why choose us?</h3>
                        </div>

                        <div className="features-list">
                            <div className="feature-item">
                                <CheckCircle className="feature-icon" color="#22c55e" />
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>Pre-vetted professionals</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>Top 1% of talent passed our screening.</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <Shield className="feature-icon" color="#3b82f6" />
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>Secure Contracts</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>Standardized SLAs and NDAs included.</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <Zap className="feature-icon" color="#eab308" />
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>Fast Deployment</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>Get staff ready in under 48 hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '6rem', padding: '3rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div className="max-w-7xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} StaffAug Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
