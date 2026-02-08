import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../components/AuthProvider';
import { useToast } from '../../components/ToastContext';
import {
    Clock, CheckCircle2, XCircle, PlayCircle,
    CheckSquare, Calendar, ChevronRight, Briefcase,
    MessageSquare, ExternalLink, ArrowRight
} from 'lucide-react';

const AgencyHireRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Join hire_requests with expert profiles and active contracts
            const { data, error } = await supabase
                .from('hire_requests')
                .select(`
                    *,
                    expert:profiles!expert_id (
                        id,
                        public_full_name,
                        full_name,
                        avatar_url_public,
                        avatar_url,
                        skills_public,
                        monthly_rate
                    ),
                    contracts (
                        start_date,
                        end_date,
                        status
                    )
                `)
                .eq('agency_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            console.error('Error fetching requests:', err);
            showToast('Failed to load request history.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fffbeb', text: '#b45309', icon: <Clock size={14} />, label: 'Pending Response' };
            case 'approved': return { bg: '#f0fdf4', text: '#15803d', icon: <CheckCircle2 size={14} />, label: 'Approved' };
            case 'rejected': return { bg: '#fef2f2', text: '#b91c1c', icon: <XCircle size={14} />, label: 'Declined' };
            case 'active': return { bg: '#eff6ff', text: '#1d4ed8', icon: <PlayCircle size={14} />, label: 'Active Placement' };
            case 'completed': return { bg: '#f8fafc', text: '#64748b', icon: <CheckSquare size={14} />, label: 'Completed' };
            default: return { bg: '#f1f5f9', text: '#475569', icon: <MessageSquare size={14} />, label: status };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) return (
        <div className="requests-loading">
            <div className="spinner"></div>
            <p>Loading request history...</p>
        </div>
    );

    return (
        <div className="agency-requests-container">
            <header className="page-header">
                <div>
                    <h1>Hire Requests</h1>
                    <p>Track your staffing pipeline and active expert placements.</p>
                </div>
                <button className="btn-browse" onClick={() => navigate('/talents')}>
                    Browse Experts <ArrowRight size={16} />
                </button>
            </header>

            {requests.length === 0 ? (
                <div className="empty-requests-glass">
                    <div className="empty-icon-box">
                        <Briefcase size={48} color="#94a3b8" />
                    </div>
                    <h3>No requests yet</h3>
                    <p>You haven’t requested any experts for your projects.</p>
                    <button className="btn-primary" onClick={() => navigate('/talents')}>
                        Go to Marketplace
                    </button>
                </div>
            ) : (
                <div className="requests-stack">
                    {requests.map((req) => {
                        const style = getStatusStyles(req.status);
                        const expert = req.expert;
                        const contract = req.contracts?.[0];

                        return (
                            <div key={req.id} className="request-card-glass">
                                <div className="req-main-info">
                                    <div className="req-expert-avatar">
                                        <img
                                            src={expert?.avatar_url_public || expert?.avatar_url || 'https://via.placeholder.com/150'}
                                            alt=""
                                        />
                                    </div>
                                    <div className="req-details">
                                        <div className="title-row">
                                            <h3>{expert?.public_full_name || expert?.full_name || 'Expert'}</h3>
                                            <div className="status-badge" style={{ backgroundColor: style.bg, color: style.text }}>
                                                {style.icon}
                                                <span>{style.label}</span>
                                            </div>
                                        </div>

                                        <div className="skills-row">
                                            {expert?.skills_public?.slice(0, 3).map((s, i) => (
                                                <span key={i} className="skill-tag">{s}</span>
                                            ))}
                                            {(expert?.skills_public?.length > 3) && (
                                                <span className="skill-tag">+{expert.skills_public.length - 3}</span>
                                            )}
                                        </div>

                                        <div className="meta-footer">
                                            <div className="meta-item">
                                                <Calendar size={14} />
                                                <span>Requested: {formatDate(req.created_at)}</span>
                                            </div>
                                            {contract && (
                                                <div className="meta-item contract-dates">
                                                    <Clock size={14} />
                                                    <span>Contract: {formatDate(contract.start_date)} - {formatDate(contract.end_date)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="req-actions">
                                    <div className="price-tag">
                                        <span className="price-val">${expert?.monthly_rate || 'TBD'}</span>
                                        <span className="price-period">/mo</span>
                                    </div>
                                    <button
                                        className="btn-view-profile"
                                        onClick={() => navigate(`/experts/${expert?.id}`)}
                                    >
                                        View Profile <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .agency-requests-container {
                    padding: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2.5rem;
                }

                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 0.5rem 0;
                    letter-spacing: -0.02em;
                }

                .page-header p {
                    color: #64748b;
                    font-weight: 500;
                }

                .btn-browse {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    color: #0f172a;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-browse:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }

                /* GLASS CARD */
                .request-card-glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 1.5rem;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    transition: all 0.2s;
                }

                .request-card-glass:hover {
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.85);
                    border-color: rgba(37, 99, 235, 0.2);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.05);
                }

                .req-main-info {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }

                .req-expert-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 1.25rem;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 3px solid white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }

                .req-expert-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .req-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .title-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .title-row h3 {
                    font-size: 1.125rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .skills-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.375rem;
                }

                .skill-tag {
                    background: rgba(37, 99, 235, 0.05);
                    color: #2563eb;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.125rem 0.625rem;
                    border-radius: 4px;
                }

                .meta-footer {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 0.25rem;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #94a3b8;
                }

                .contract-dates {
                    color: #10b981;
                }

                .req-actions {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    align-items: flex-end;
                }

                .price-tag {
                    display: flex;
                    flex-direction: column;
                }

                .price-val {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: #0f172a;
                }

                .price-period {
                    font-size: 0.6875rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                }

                .btn-view-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: transparent;
                    border: none;
                    color: #2563eb;
                    font-weight: 800;
                    font-size: 0.875rem;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                }

                .btn-view-profile:hover {
                    background: rgba(37, 99, 235, 0.05);
                    transform: translateX(3px);
                }

                /* EMPTY STATE */
                .empty-requests-glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    padding: 4rem 2rem;
                    border-radius: 2.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    text-align: center;
                    max-width: 500px;
                    margin: 4rem auto;
                }

                .empty-icon-box {
                    width: 100px;
                    height: 100px;
                    background: #f8fafc;
                    border-radius: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }

                .empty-requests-glass h3 {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin-bottom: 1rem;
                }

                .empty-requests-glass p {
                    color: #64748b;
                    margin-bottom: 2rem;
                    font-weight: 500;
                }

                .btn-primary {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary:hover {
                    background: #1e293b;
                    transform: scale(1.02);
                }

                .requests-loading {
                    height: 60vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: #64748b;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f1f5f9;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 640px) {
                    .request-card-glass { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .req-actions { text-align: left; align-items: flex-start; width: 100%; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
                    .page-header { flex-direction: column; gap: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default AgencyHireRequests;
