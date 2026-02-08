import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import {
    LayoutDashboard,
    Users,
    LogOut,
    Shield,
    FileText,
    Briefcase,
    UserCheck,
    History,
    Settings,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    CircleUser,
    MessageSquare
} from 'lucide-react'

/**
 * BRAND NEW ADMIN SIDEBAR IMPLEMENTATION
 * Zero dependencies on old CSS or layout logic.
 * Built for perfect flex-box responsiveness.
 */

export default function AdminLayout() {
    const { signOut, user, profile } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // States for the new system
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('fleet_admin_collapsed')
        return saved === 'true'
    })
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Save preference
    useEffect(() => {
        localStorage.setItem('fleet_admin_collapsed', isCollapsed)
    }, [isCollapsed])

    // Navigation Items
    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/agencies', label: 'Agencies', icon: <Users size={20} /> },
        { path: '/admin/experts', label: 'Experts', icon: <UserCheck size={20} /> },
        { path: '/admin/experts/moderation', label: 'Moderation', icon: <Shield size={20} /> },
        { path: '/admin/workspaces', label: 'Workspaces', icon: <Briefcase size={20} /> },
        { path: '/admin/agreements', label: 'Legal Audit', icon: <FileText size={20} /> },
        { path: '/admin/requests', label: 'Hire Requests', icon: <MessageSquare size={20} /> },
        { path: '/admin/audit', label: 'Audit Trail', icon: <History size={20} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    ]

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const currentPath = location.pathname

    return (
        <div className="new-admin-root">
            {/* 1. Mobile Top Bar - Only visible on small screens */}
            <header className="new-mobile-header">
                <div className="mobile-brand">
                    <Shield size={24} color="#3b82f6" />
                    <span>Fleet Admin</span>
                </div>
                <button className="hamburger-btn" onClick={() => setIsDrawerOpen(true)}>
                    <Menu size={24} />
                </button>
            </header>

            <div className="new-admin-body">
                {/* 2. Backdrop - Only active when mobile drawer is open */}
                {isDrawerOpen && (
                    <div className="new-sidebar-backdrop" onClick={() => setIsDrawerOpen(false)} />
                )}

                {/* 3. The Sidebar - This is the core rebuild */}
                <aside className={`new-sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isDrawerOpen ? 'mobile-drawer-open' : ''}`}>

                    {/* Sidebar: Header Section */}
                    <div className="new-sidebar-header">
                        <div className="brand-lockup">
                            <div className="icon-wrapper">
                                <Shield size={28} color="#3b82f6" strokeWidth={2.5} />
                            </div>
                            <span className="brand-name">Fleet Admin</span>
                        </div>

                        {/* Desktop Toggle Button */}
                        <button
                            className="new-sidebar-toggle-btn"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>

                        {/* Mobile Close Button */}
                        <button className="new-mobile-close-btn" onClick={() => setIsDrawerOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Sidebar: Navigation List */}
                    <nav className="new-sidebar-nav">
                        <ul className="new-nav-list">
                            {navItems.map((item) => (
                                <li key={item.path} className="new-nav-item">
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsDrawerOpen(false)}
                                        className={`new-nav-link ${currentPath === item.path ? 'active' : ''}`}
                                    >
                                        <div className="new-nav-icon-box">{item.icon}</div>
                                        <span className="new-nav-label">{item.label}</span>
                                        {/* Rail Tooltip (Desktop Collapsed only) */}
                                        {isCollapsed && <div className="rail-tip">{item.label}</div>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Sidebar: Footer / User Area */}
                    <div className="new-sidebar-footer">
                        <div className="new-user-card">
                            <div className="avatar-box">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" />
                                ) : (
                                    <CircleUser size={24} />
                                )}
                            </div>
                            <div className="user-text">
                                <span className="u-name">{profile?.full_name || 'Admin'}</span>
                                <span className="u-role">Platform Admin</span>
                            </div>
                        </div>
                        <button className="new-logout-action" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span className="logout-label">Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* 4. The Content Area - Direct Flex Sibling */}
                <main className="new-content-area">
                    <div className="new-scroll-container">
                        <Outlet />
                    </div>
                </main>
            </div>

            <style>{`
                /* REBUILD CSS - ZERO DEPENDENCIES */
                :root {
                    --new-sb-expanded: 260px;
                    --new-sb-collapsed: 72px;
                    --new-bg-main: #f8fafc;
                    --new-bg-sidebar: #0f172a;
                    --new-bg-accent: #1e293b;
                    --new-primary: #3b82f6;
                    --new-text: #94a3b8;
                    --new-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .new-admin-root {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    width: 100vw;
                    overflow: hidden;
                    background: var(--new-bg-main);
                }

                .new-admin-body {
                    display: flex;
                    flex: 1;
                    width: 100%;
                    height: 100%;
                }

                /* Mobile Header */
                .new-mobile-header {
                    display: none;
                    height: 64px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 0 1.25rem;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }
                .mobile-brand { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; color: #0f172a; }
                .hamburger-btn { background: #f1f5f9; border: none; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; color: #64748b; }

                /* Sidebar Baseline */
                .new-sidebar {
                    background: var(--new-bg-sidebar);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: var(--new-sb-expanded);
                    transition: var(--new-transition);
                    position: relative;
                    flex-shrink: 0;
                    z-index: 100;
                }

                .new-sidebar.collapsed {
                    width: var(--new-sb-collapsed);
                }

                /* Sidebar Toggle (Floating on Desktop) */
                .new-sidebar-toggle-btn {
                    position: absolute;
                    right: -12px;
                    top: 24px;
                    width: 24px;
                    height: 24px;
                    background: var(--new-primary);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    z-index: 10;
                }
                .new-sidebar-toggle-btn:hover { transform: scale(1.1); }

                /* Header: Brand Styling */
                .new-sidebar-header {
                    height: 80px;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    overflow: hidden;
                }
                .brand-lockup { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
                .brand-name { font-size: 1.125rem; font-weight: 800; white-space: nowrap; transition: var(--new-transition); }
                .collapsed .brand-name { opacity: 0; transform: translateX(-10px); }

                /* Navigation List */
                .new-sidebar-nav { flex: 1; padding: 1.25rem 0.75rem; overflow-y: auto; overflow-x: hidden; }
                .new-nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
                
                .new-nav-link {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    color: var(--new-text);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    position: relative;
                }
                .new-nav-link:hover { color: white; background: var(--new-bg-accent); }
                .new-nav-link.active { color: white; background: var(--new-primary); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }

                .new-nav-icon-box { min-width: 40px; display: flex; justify-content: center; flex-shrink: 0; }
                .new-nav-label { white-space: nowrap; transition: var(--new-transition); }
                .collapsed .new-nav-label { opacity: 0; transform: translateX(10px); pointer-events: none; }

                /* Tooltips for Collapsed State */
                .rail-tip {
                    position: absolute;
                    left: 100%;
                    margin-left: 1rem;
                    background: #1e293b;
                    color: white;
                    padding: 0.5rem 0.875rem;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transform: translateX(-10px);
                    transition: all 0.2s;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
                    z-index: 1000;
                }
                .new-nav-link:hover .rail-tip { opacity: 1; visibility: visible; transform: translateX(0); }

                /* Footer / User Block */
                .new-sidebar-footer { padding: 1.25rem; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
                .new-user-card { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1.25rem; overflow: hidden; }
                .avatar-box { width: 32px; height: 32px; background: var(--new-bg-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--new-text); flex-shrink: 0; }
                .user-text { display: flex; flex-direction: column; transition: var(--new-transition); }
                .collapsed .user-text { opacity: 0; width: 0; }
                .u-name { font-size: 0.8125rem; font-weight: 700; white-space: nowrap; }
                .u-role { font-size: 0.6875rem; color: var(--new-text); white-space: nowrap; }

                .new-logout-action {
                    width: 100%;
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 0.75rem; border: none; border-radius: 0.75rem;
                    background: #ef4444; color: white; cursor: pointer;
                    font-weight: 700; font-size: 0.8125rem; transition: all 0.2s;
                    justify-content: center;
                }
                .new-logout-action:hover { background: #dc2626; transform: translateY(-1px); }
                .collapsed .logout-label { display: none; }
                .collapsed .new-logout-action { width: 40px; padding: 0.75rem 0; margin: 0 auto; }

                /* Main Viewport Implementation */
                .new-content-area {
                    flex: 1;
                    min-width: 0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .new-scroll-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2.5rem;
                }

                /* Mobile Sizing & Breakpoints */
                @media (max-width: 1024px) {
                    .new-mobile-header { display: flex; }
                    .new-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 280px !important;
                        height: 100vh;
                        transform: translateX(-100%);
                        transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                        z-index: 1001;
                        pointer-events: auto;
                    }
                    .new-sidebar.mobile-drawer-open { transform: translateX(0); }
                    .new-sidebar-toggle-btn { display: none; }
                    .new-mobile-close-btn { display: block; border: none; background: none; color: white; cursor: pointer; }
                    
                    /* Force labels in mobile drawer regardless of collapsed state */
                    .new-nav-label, .brand-name, .user-text, .logout-label { opacity: 1 !important; transform: none !important; width: auto !important; display: block !important; visibility: visible !important; }
                    .new-logout-action { width: 100% !important; }

                    .new-sidebar-backdrop {
                        position: fixed;
                        inset: 0;
                        background: rgba(15, 23, 42, 0.5);
                        backdrop-filter: blur(4px);
                        z-index: 1000;
                    }

                    .new-scroll-container { padding: 1.5rem; }
                }

                @media (min-width: 1025px) {
                    .new-mobile-close-btn { display: none; }
                }

                /* Custom Scrollbar for Sidebar */
                .new-sidebar-nav::-webkit-scrollbar { width: 4px; }
                .new-sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    )
}
