import React from 'react';
import {
    CheckCircle2, Briefcase, Globe, Mail, ExternalLink,
    Star, Clock, ShieldCheck, MapPin,
    Calendar, Link as LinkIcon, Send, Check, XCircle
} from 'lucide-react';

/**
 * DetailedExpertProfile Component - Glass UI Edition
 * 
 * A high-fidelity detailed view of an expert profile with glassmorphism effects.
 */
const DetailedExpertProfile = ({
    expert,
    isDraft = false,
    isRequested = false,
    requestLoading = false,
    onHireClick
}) => {
    if (!expert) return null;

    // Resolve fields based on mode
    const fullName = isDraft ? (expert.full_name_draft || expert.full_name) : (expert.public_full_name || expert.full_name);
    const avatarUrl = isDraft ? (expert.avatar_url_draft || expert.avatar_url) : (expert.avatar_url_public || expert.avatar_url);
    const bio = isDraft ? expert.bio_draft : expert.bio_public;
    const skills = isDraft ? (expert.skills_draft || []) : (expert.skills_public || []);
    const experience = isDraft ? expert.experience_years_draft : expert.experience_years_public;
    const tzFlexible = isDraft ? expert.willing_timezone_shift_draft : expert.willing_timezone_shift_public;
    const monthlyRate = expert.monthly_rate;

    const displayImage = avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400';

    const formatPrice = (rate) => {
        if (!rate) return "$TBD";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(rate);
    };

    return (
        <div className="glass-profile-wrapper">
            <div className="glass-profile-layout">
                {/* Main Content Column */}
                <div className="glass-main-col">
                    {/* Header Card (Glass) */}
                    <div className="glass-card hero-card">
                        <div className="hero-top">
                            <div className="hero-avatar-wrapper">
                                <img src={displayImage} alt="" className="hero-img" />
                                <div className="vetted-seal">
                                    <ShieldCheck size={16} />
                                </div>
                            </div>
                            <div className="hero-core-info">
                                <div className="name-row">
                                    <h1>{fullName}</h1>
                                    <CheckCircle2 size={24} fill="#10b981" color="white" />
                                </div>
                                <div className="meta-grid">
                                    <div className="meta-pill">
                                        <Briefcase size={14} />
                                        <span>{experience || 0} Years Experience</span>
                                    </div>
                                    <div className="meta-pill">
                                        <MapPin size={14} />
                                        <span>Remote / Worldwide</span>
                                    </div>
                                    <div className="meta-pill">
                                        <Clock size={14} />
                                        <span>{tzFlexible ? 'Timezone Flexible' : 'Local Hours'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hero-pricing">
                                <span className="price-label">Monthly Rate</span>
                                <span className="price-val">{formatPrice(monthlyRate)}</span>
                            </div>
                        </div>

                        <div className="hero-divider"></div>

                        <div className="hero-cta-area">
                            <button
                                className={`glass-btn-primary ${isRequested ? 'requested cancel-mode' : ''} ${expert.marketplace_status !== 'available' ? 'unavailable' : ''}`}
                                onClick={onHireClick}
                                disabled={requestLoading || expert.marketplace_status !== 'available'}
                            >
                                {expert.marketplace_status !== 'available' ? (
                                    <><XCircle size={20} /> Not Available</>
                                ) : requestLoading ? 'Processing...' : isRequested ? (
                                    <><XCircle size={20} /> Cancel Request</>
                                ) : (
                                    <><Send size={18} /> Request Hire</>
                                )}
                            </button>
                            <p className="cta-note">Managed placement. Our team facilitates the interview and contract.</p>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="glass-card section-card">
                        <h2>Expertise & Professional Background</h2>
                        <p className="glass-bio-text">{bio || 'No bio provided for this published expert.'}</p>
                    </div>

                    {/* Portfolio Section */}
                    <div className="glass-card section-card">
                        <h2>Portfolio & Evidence</h2>
                        <div className="glass-portfolio-grid">
                            {expert.portfolio_items?.map(item => (
                                <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="glass-portfolio-item">
                                    <div className="pi-icon-box">
                                        {item.type === 'file' ? <LinkIcon size={20} /> : <Globe size={20} />}
                                    </div>
                                    <div className="pi-content">
                                        <h3>{item.title}</h3>
                                        <div className="pi-link">View Project <ExternalLink size={12} /></div>
                                    </div>
                                </a>
                            ))}
                            {(!expert.portfolio_items || expert.portfolio_items.length === 0) && (
                                <div className="glass-empty">No public assets available.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="glass-side-col">
                    <div className="glass-card sidebar-card">
                        <h3>Availability Status</h3>
                        <div className="status-badge-row">
                            <div className="status-indicator">
                                <div className="dot pulse"></div>
                                <span>Available Now</span>
                            </div>
                        </div>
                        <div className="availability-list">
                            <div className="avail-item">
                                <Check size={16} />
                                <span>✔ Full-time (40h/week)</span>
                            </div>
                            <div className="avail-item">
                                <Check size={16} />
                                <span>✔ Contract Basis</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card sidebar-card trust-card">
                        <ShieldCheck size={24} color="#10b981" />
                        <div>
                            <h4>Identity Verified</h4>
                            <p>Platform vetted. Background and skills check complete.</p>
                        </div>
                    </div>

                    <div className="glass-card sidebar-card skills-card">
                        <h3>Technical Stack</h3>
                        <div className="glass-skills-wrap">
                            {skills.map(skill => (
                                <span key={skill} className="glass-skill-pill">{skill}</span>
                            ))}
                            {skills.length === 0 && <span className="glass-empty">No skills listed.</span>}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .glass-profile-wrapper {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .glass-profile-layout {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    align-items: start;
                }

                .glass-main-col {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .glass-side-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    position: sticky;
                    top: 100px;
                }

                /* GLASS CARD BASE */
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 2rem;
                    padding: 2.5rem;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                }

                .hero-card {
                    padding: 3rem;
                }

                .hero-top {
                    display: flex;
                    gap: 2.5rem;
                    align-items: center;
                }

                .hero-avatar-wrapper {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    flex-shrink: 0;
                }

                .hero-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 2.5rem;
                    border: 4px solid white;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }

                .vetted-seal {
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    background: #0f172a;
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                }

                .hero-core-info {
                    flex: 1;
                }

                .name-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .name-row h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0;
                }

                .meta-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .meta-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.82);
                    padding: 0.5rem 0.875rem;
                    border-radius: 0.75rem;
                    font-size: 0.8125rem;
                    font-weight: 700;
                    color: #475569;
                    border: 1px solid rgba(0,0,0,0.03);
                }

                .hero-pricing {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                }

                .price-label {
                    font-size: 0.6875rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .price-val {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #0f172a;
                }

                .hero-divider {
                    height: 1px;
                    background: linear-gradient(to right, transparent, rgba(0,0,0,0.05), transparent);
                    margin: 2.5rem 0;
                }

                .hero-cta-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .glass-btn-primary {
                    width: 100%;
                    max-width: 400px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 1.125rem;
                    border-radius: 1.25rem;
                    font-weight: 800;
                    font-size: 1.125rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .glass-btn-primary:hover:not(:disabled) {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.4);
                }

                .glass-btn-primary.requested.cancel-mode {
                    background: #fef2f2;
                    color: #ef4444;
                    border: 2px solid #fee2e2;
                    box-shadow: none;
                }

                .glass-btn-primary.requested.cancel-mode:hover {
                    background: #fee2e2;
                    border-color: #fecaca;
                }

                .glass-btn-primary.unavailable {
                    background: #f1f5f9;
                    color: #94a3b8;
                    border: 1px solid #e2e8f0;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .cta-note {
                    margin-top: 1rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #94a3b8;
                }

                .section-card h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 1.5rem;
                }

                .glass-bio-text {
                    font-size: 1.0625rem;
                    color: #475569;
                    line-height: 1.7;
                    font-weight: 500;
                    white-space: pre-wrap;
                }

                .glass-portfolio-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .glass-portfolio-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 1.5rem;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .glass-portfolio-item:hover {
                    background: white;
                    border-color: #2563eb;
                    transform: translateX(4px);
                }

                .pi-icon-box {
                    width: 48px;
                    height: 48px;
                    background: #f1f5f9;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                }

                .pi-content h3 {
                    margin: 0 0 0.125rem;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .pi-link {
                    font-size: 0.75rem;
                    color: #2563eb;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                /* SIDEBAR */
                .sidebar-card {
                    padding: 1.5rem 2rem;
                }

                .sidebar-card h3 {
                    font-size: 0.875rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1rem;
                }

                .status-badge-row {
                    margin-bottom: 1.5rem;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    font-weight: 700;
                    color: #166534;
                    font-size: 0.875rem;
                    background: #f0fdf4;
                    padding: 0.5rem 1rem;
                    border-radius: 999px;
                    width: fit-content;
                }

                .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
                .dot.pulse { animation: pulse-green 2s infinite; }

                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                .availability-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .avail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #10b981;
                    font-size: 0.875rem;
                    font-weight: 700;
                }

                .trust-card {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    background: rgba(16, 185, 129, 0.05);
                    border-color: rgba(16, 185, 129, 0.1);
                }

                .trust-card h4 { font-size: 0.875rem; font-weight: 800; color: #065f46; margin: 0 0 0.125rem; }
                .trust-card p { font-size: 0.75rem; color: #065f46; opacity: 0.8; margin: 0; line-height: 1.4; font-weight: 500; }

                .glass-skills-wrap {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .glass-skill-pill {
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(0,0,0,0.05);
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #475569;
                }

                .glass-empty {
                    color: #94a3b8;
                    font-style: italic;
                    font-size: 0.875rem;
                    grid-column: 1 / -1;
                    padding: 1rem;
                    text-align: center;
                    border: 1px dashed rgba(0,0,0,0.1);
                    border-radius: 1rem;
                }

                /* RESPONSIVENESS */
                @media (max-width: 1024px) {
                    .glass-profile-layout {
                        grid-template-columns: 1fr;
                    }
                    .glass-side-col {
                        position: static;
                        order: -1;
                    }
                }

                @media (max-width: 640px) {
                    .glass-card { padding: 1.5rem; }
                    .hero-card { padding: 2rem; }
                    .hero-top { flex-direction: column; text-align: center; gap: 1.5rem; }
                    .hero-pricing { text-align: center; }
                    .name-row { justify-content: center; flex-direction: column; }
                    .meta-grid { justify-content: center; }
                    .glass-portfolio-grid { grid-template-columns: 1fr; }
                    .glass-btn-primary { max-width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default DetailedExpertProfile;
