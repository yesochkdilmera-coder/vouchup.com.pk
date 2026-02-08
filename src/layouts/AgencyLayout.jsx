import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, Settings } from 'lucide-react'

export default function AgencyLayout() {
    const location = useLocation()
    const currentPath = location.pathname

    const navItems = [
        { path: '/agency', label: 'Dashboard', icon: <LayoutDashboard size={24} /> },
        { path: '/agency/experts', label: 'Experts', icon: <Users size={24} /> },
        { path: '/agency/workspaces', label: 'Workspaces', icon: <Briefcase size={24} /> },
        { path: '/agency/settings', label: 'Settings', icon: <Settings size={24} /> },
    ]

    const isActive = (path) => {
        if (path === '/agency') return currentPath === '/agency'
        return currentPath.startsWith(path)
    }

    return (
        <div className="agency-app-root">
            {/* Main Content Area */}
            <main className="agency-viewport">
                <div className="agency-content-container">
                    <Outlet />
                </div>
            </main>

            {/* iOS Style Dock Navigation */}
            <nav className="agency-dock-container">
                <div className="agency-dock">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`dock-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <div className="dock-icon-box">
                                {item.icon}
                            </div>
                            <span className="dock-label">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            <style>{`
                :root {
                    --dock-height: 80px;
                    --dock-bg: rgba(255, 255, 255, 0.8);
                    --dock-border: rgba(226, 232, 240, 0.5);
                    --active-blue: #3b82f6;
                    --text-muted: #64748b;
                }

                .agency-app-root {
                    min-height: 100vh;
                    background: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .agency-viewport {
                    flex: 1;
                    width: 100%;
                    padding-bottom: calc(var(--dock-height) + 2rem);
                }

                .agency-content-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }

                /* Mobile Adjustment */
                @media (max-width: 640px) {
                    .agency-content-container {
                        padding: 1.5rem 1rem;
                    }
                }

                /* Dock Styling */
                .agency-dock-container {
                    position: fixed;
                    bottom: 2rem;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: center;
                    padding: 0 1.5rem;
                    pointer-events: none;
                    z-index: 1000;
                }

                .agency-dock {
                    background: var(--dock-bg);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid var(--dock-border);
                    border-radius: 2rem;
                    padding: 0.75rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    pointer-events: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .dock-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    color: var(--text-muted);
                    text-decoration: none;
                    padding: 0.5rem;
                    min-width: 64px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 1rem;
                }

                .dock-item:hover {
                    color: #1e293b;
                    background: rgba(0, 0, 0, 0.03);
                }

                .dock-item.active {
                    color: var(--active-blue);
                }

                .dock-icon-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }

                .dock-item.active .dock-icon-box {
                    transform: translateY(-2px);
                }

                .dock-label {
                    font-size: 0.625rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                /* Mobile Dock Adjustment */
                @media (max-width: 480px) {
                    .agency-dock-container {
                        bottom: 1.25rem;
                    }
                    .agency-dock {
                        padding: 0.5rem 1rem;
                        gap: 0.75rem;
                        width: 100%;
                        max-width: 400px;
                        border-radius: 1.5rem;
                    }
                    .dock-item {
                        min-width: 60px;
                        flex: 1;
                    }
                }

                /* Tap Animation */
                .dock-item:active {
                    transform: scale(0.9);
                }
            `}</style>
        </div>
    )
}
