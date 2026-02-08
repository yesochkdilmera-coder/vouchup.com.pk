import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import { Settings, Bell, Lock, Shield, FileText, HelpCircle, LogOut, ChevronRight, UserX, AlertCircle } from 'lucide-react'

export default function ExpertSettings() {
    const { signOut, user } = useAuth()
    const [notifications, setNotifications] = useState({
        emails: true,
        push: false,
        marketing: false
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const handleUpdatePassword = async () => {
        const newPassword = prompt("Enter new password:")
        if (!newPassword || newPassword.length < 6) return alert("Password too short")

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error
            alert("Password updated successfully!")
        } catch (err) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Settings</h1>
                <p style={{ color: '#64748b' }}>Account preferences and security</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Security Section */}
                <section>
                    <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginLeft: '0.5rem' }}>Security</h2>
                    <div className="settings-card">
                        <SettingsItem
                            icon={<Lock size={20} color="#2563eb" />}
                            title="Change Password"
                            desc="Update your account password"
                            onClick={handleUpdatePassword}
                        />
                        <SettingsItem
                            icon={<Shield size={20} color="#10b981" />}
                            title="Two-Factor Auth"
                            desc="Not configured"
                            badge="Soon"
                        />
                    </div>
                </section>

                {/* Notifications Section */}
                <section>
                    <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginLeft: '0.5rem' }}>Notifications</h2>
                    <div className="settings-card">
                        <ToggleItem
                            icon={<Bell size={20} />}
                            title="Email Notifications"
                            active={notifications.emails}
                            onToggle={() => setNotifications({ ...notifications, emails: !notifications.emails })}
                        />
                        <ToggleItem
                            icon={<Bell size={20} />}
                            title="Push Notifications"
                            active={notifications.push}
                            onToggle={() => setNotifications({ ...notifications, push: !notifications.push })}
                        />
                    </div>
                </section>

                {/* Legal Section */}
                <section>
                    <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginLeft: '0.5rem' }}>Resources</h2>
                    <div className="settings-card">
                        <SettingsItem
                            icon={<FileText size={20} color="#64748b" />}
                            title="Legal Agreements"
                            desc="View your signed contracts"
                        />
                        <SettingsItem
                            icon={<HelpCircle size={20} color="#64748b" />}
                            title="Help & Support"
                            desc="Contact our concierge"
                        />
                    </div>
                </section>

                {/* Danger Zone */}
                <section style={{ marginTop: '1rem' }}>
                    <div className="settings-card" style={{ border: '1px solid #fee2e2' }}>
                        <SettingsItem
                            icon={<LogOut size={20} color="#ef4444" />}
                            title="Sign Out"
                            onClick={signOut}
                            danger
                        />
                    </div>
                </section>
            </div>

            <style>{`
                .settings-card {
                    background-color: white;
                    border-radius: 1rem;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .settings-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .settings-item:last-child { border-bottom: none; }
                .settings-item:hover { background-color: #f8fafc; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}

function SettingsItem({ icon, title, desc, badge, onClick, danger }) {
    return (
        <div className="settings-item" onClick={onClick}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: danger ? '#fef2f2' : '#f8fafc', padding: '0.625rem', borderRadius: '0.5rem' }}>{icon}</div>
                <div>
                    <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: danger ? '#ef4444' : '#1e293b' }}>{title}</h5>
                    {desc && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{desc}</p>}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {badge && <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.625rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{badge}</span>}
                <ChevronRight size={18} color="#cbd5e1" />
            </div>
        </div>
    )
}

function ToggleItem({ icon, title, active, onToggle }) {
    return (
        <div className="settings-item" onClick={onToggle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.625rem', borderRadius: '0.5rem', color: '#64748b' }}>{icon}</div>
                <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b' }}>{title}</h5>
            </div>
            <div style={{
                width: '44px',
                height: '24px',
                backgroundColor: active ? '#2563eb' : '#e2e8f0',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background-color 0.3s'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: active ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }} />
            </div>
        </div>
    )
}
