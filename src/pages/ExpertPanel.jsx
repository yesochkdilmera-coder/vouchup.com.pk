
import { useAuth } from '../components/AuthProvider'
import { LogOut, Shield, Briefcase, Activity } from 'lucide-react'

export default function ExpertPanel() {
    const { user, profile, signOut } = useAuth()

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <Shield size={24} color="#2563eb" />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Expert Portal</span>
                    </div>

                    <button
                        onClick={signOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Expert'}!
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Here is an overview of your active projects and tasks.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {/* Status Card */}
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                <Activity size={24} color="#16a34a" />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: '#334155' }}>Status</h3>
                                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.125rem' }}>Active & Verified</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Your profile is visible to top agencies.</p>
                    </div>

                    {/* Projects Card */}
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                <Briefcase size={24} color="#9333ea" />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, color: '#334155' }}>Active Projects</h3>
                                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.125rem' }}>0</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>You have no active assignments yet.</p>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <p style={{ color: '#64748b' }}>More features coming soon...</p>
                </div>
            </main>
        </div>
    )
}
