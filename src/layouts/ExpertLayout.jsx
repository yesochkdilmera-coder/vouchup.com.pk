import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, UserCircle, Settings, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../components/AuthProvider'

export default function ExpertLayout() {
    const { signOut, profile } = useAuth()

    return (
        <div className="expert-app-container">
            {/* iOS Style Fixed Header */}
            <header className="expert-header">
                <div className="header-inner">
                    <div className="brand">
                        <div className="brand-icon">
                            <Briefcase size={18} />
                        </div>
                        <span className="brand-text">Expert<span>Fleet</span></span>
                    </div>
                    <button onClick={signOut} className="sign-out-btn">
                        <LogOut size={16} /> <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <main className="expert-main">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>

            {/* iOS Style Bottom Dock Navigation */}
            <nav className="expert-dock">
                <div className="dock-inner">
                    <NavButton to="/expert" icon={<LayoutDashboard size={22} />} label="Dash" />
                    <NavButton to="/expert/workspaces" icon={<Briefcase size={22} />} label="Work" />
                    <NavButton to="/expert/profile" icon={<UserCircle size={22} />} label="Profile" />
                    <NavButton to="/expert/settings" icon={<Settings size={22} />} label="Settings" />
                </div>
            </nav>

            <style>{`
                :root {
                    --dock-height: 80px;
                    --header-height: 64px;
                    --safe-area-bottom: env(safe-area-inset-bottom, 20px);
                }

                * {
                    box-sizing: border-box;
                    -webkit-tap-highlight-color: transparent;
                }

                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    overflow-x: hidden;
                    background-color: #f8fafc;
                }

                .expert-app-container {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                }

                /* Fixed Header */
                .expert-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: var(--header-height);
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid #e2e8f0;
                    z-index: 1000;
                }

                .header-inner {
                    max-width: 1000px;
                    margin: 0 auto;
                    height: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 1.25rem;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                }

                .brand-icon {
                    width: 32px;
                    height: 32px;
                    background: #2563eb;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .brand-text {
                    font-weight: 800;
                    font-size: 1.125rem;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .brand-text span {
                    color: #2563eb;
                }

                .sign-out-btn {
                    background: #f1f5f9;
                    border: none;
                    color: #64748b;
                    padding: 0.5rem 0.875rem;
                    border-radius: 9999px;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .sign-out-btn:active {
                    transform: scale(0.95);
                    background: #e2e8f0;
                }

                /* Main Area */
                .expert-main {
                    flex: 1;
                    padding-top: var(--header-height);
                    padding-bottom: calc(var(--dock-height) + var(--safe-area-bottom));
                    width: 100%;
                }

                .content-wrapper {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 1.5rem 1.25rem;
                    width: 100%;
                }

                /* Fixed Dock Navigation */
                .expert-dock {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-top: 1px solid #e2e8f0;
                    padding-bottom: var(--safe-area-bottom);
                    z-index: 1000;
                }

                .dock-inner {
                    max-width: 500px;
                    margin: 0 auto;
                    height: var(--dock-height);
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                }

                .nav-link {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                    text-decoration: none;
                    color: #94a3b8;
                    transition: all 0.2s;
                    width: 70px;
                    height: 100%;
                }

                .nav-link.active {
                    color: #2563eb;
                }

                .nav-link:active {
                    transform: scale(0.92);
                }

                .nav-label {
                    font-size: 0.625rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* Global Responsive Utils */
                @media (max-width: 640px) {
                    .sign-out-btn span {
                        display: none;
                    }
                    .sign-out-btn {
                        padding: 0.5rem;
                    }
                }

                /* Modal Responsiveness Fix */
                .responsive-modal {
                    width: 95% !important;
                    max-width: 600px !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                    border-radius: 1.5rem !important;
                }
            `}</style>
        </div>
    )
}

function NavButton({ to, icon, label }) {
    return (
        <NavLink to={to} end={to === '/expert'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {icon}
            <span className="nav-label">{label}</span>
        </NavLink>
    )
}
