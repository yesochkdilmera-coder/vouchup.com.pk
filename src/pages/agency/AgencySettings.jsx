import { useAuth } from '../../components/AuthProvider'
import {
    Building, CreditCard, FileText, Bell,
    Shield, History, LogOut, ChevronRight, User
} from 'lucide-react'

export default function AgencySettings() {
    const { profile, user, signOut } = useAuth()

    const settingGroups = [
        {
            title: 'Organization',
            items: [
                { id: 'org', label: 'Company Profile', icon: <Building size={18} />, desc: 'Name, logo, and brand info' },
                { id: 'team', label: 'Team Members', icon: <User size={18} />, desc: 'Manage admin access' },
            ]
        },
        {
            title: 'Commercial',
            items: [
                { id: 'billing', label: 'Billing & Invoices', icon: <CreditCard size={18} />, desc: 'Payment methods and tax info' },
                { id: 'legal', label: 'Agreements', icon: <FileText size={18} />, desc: 'Platform terms and data processing' },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { id: 'notifs', label: 'Notifications', icon: <Bell size={18} />, desc: 'Push, email, and slack alerts' },
                { id: 'security', label: 'Security', icon: <Shield size={18} />, desc: 'Password and 2FA settings' },
                { id: 'logs', label: 'Activity Logs', icon: <History size={18} />, desc: 'Review recent system actions' },
            ]
        }
    ]

    return (
        <div className="agency-settings-page">
            <header className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account and platform preferences.</p>
                </div>
            </header>

            <div className="profile-hero">
                <div className="ph-avatar">
                    {profile?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="ph-info">
                    <h3>{profile?.full_name || 'Admin'}</h3>
                    <p>{user?.email}</p>
                </div>
                <button className="ph-edit-btn">Edit Profile</button>
            </div>

            <div className="settings-groups">
                {settingGroups.map((group, gIdx) => (
                    <div key={gIdx} className="settings-section">
                        <h2 className="section-label">{group.title}</h2>
                        <div className="settings-card">
                            {group.items.map((item, iIdx) => (
                                <div key={item.id} className={`setting-row ${iIdx === group.items.length - 1 ? 'last' : ''}`}>
                                    <div className="sr-icon-box">
                                        {item.icon}
                                    </div>
                                    <div className="sr-info">
                                        <span className="sr-label">{item.label}</span>
                                        <span className="sr-desc">{item.desc}</span>
                                    </div>
                                    <ChevronRight size={18} color="#cbd5e1" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="danger-zone">
                <button className="logout-button" onClick={() => signOut()}>
                    <LogOut size={18} />
                    <span>Sign Out from Workspace</span>
                </button>
            </div>

            <style>{`
                .page-header {
                    margin-bottom: 2.5rem;
                }
                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 0.25rem;
                    letter-spacing: -0.03em;
                }
                .page-header p {
                    color: #64748b;
                    font-size: 1.125rem;
                    font-weight: 500;
                    margin: 0;
                }

                .profile-hero {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 1.5rem;
                    border-radius: 1.75rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 3rem;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .ph-avatar {
                    width: 64px;
                    height: 64px;
                    background: #3b82f6;
                    color: white;
                    border-radius: 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 800;
                }
                .ph-info h3 {
                    margin: 0 0 0.125rem;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .ph-info p {
                    margin: 0;
                    color: #64748b;
                    font-weight: 500;
                    font-size: 0.875rem;
                }
                .ph-edit-btn {
                    margin-left: auto;
                    background: #f1f5f9;
                    border: none;
                    padding: 0.625rem 1rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    font-size: 0.8125rem;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ph-edit-btn:hover { background: #e2e8f0; }

                .settings-section {
                    margin-bottom: 2.5rem;
                }
                .section-label {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin: 0 0 0.875rem 1rem;
                }

                .settings-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.75rem;
                    overflow: hidden;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .setting-row {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .setting-row:hover { background: #f8fafc; }
                .setting-row.last { border-bottom: none; }

                .sr-icon-box {
                    width: 36px;
                    height: 36px;
                    background: #f8fafc;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #475569;
                    border: 1px solid #f1f5f9;
                }

                .sr-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .sr-label {
                    font-size: 0.9375rem;
                    font-weight: 700;
                    color: #1e293b;
                }
                .sr-desc {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 500;
                }

                .danger-zone {
                    margin-top: 2rem;
                    padding: 0 1rem;
                }
                .logout-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: #fff1f2;
                    color: #be123c;
                    border: 1px solid #fecdd3;
                    border-radius: 1.25rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .logout-button:hover { background: #ffe4e6; }

                @media (max-width: 480px) {
                    .profile-hero { flex-direction: column; text-align: center; }
                    .ph-edit-btn { margin: 1rem 0 0; width: 100%; }
                    .setting-row { padding: 1rem; gap: 0.75rem; }
                }
            `}</style>
        </div>
    )
}
