import React, { useState, useEffect } from 'react';
import { CheckCircle2, Briefcase, ShieldCheck, DollarSign, Send, Check, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../AuthProvider';
import { useToast } from '../ToastContext';

const ExpertCard = ({ data }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [requesting, setRequesting] = useState(false);
    const [isRequested, setIsRequested] = useState(false);

    useEffect(() => {
        if (user && data?.id) {
            checkStatus();
        }
    }, [user, data?.id]);

    const checkStatus = async () => {
        const { data: request } = await supabase
            .from('hire_requests')
            .select('id')
            .eq('expert_id', data.id)
            .eq('agency_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

        if (request) setIsRequested(true);
    };

    if (!data) return null;

    // Compact field resolution
    const fullName = data.public_full_name || data.full_name;
    const avatarUrl = data.avatar_url_public || data.avatar_url;
    const bio = data.bio_public;
    const skills = data.skills_public || [];
    const experience = data.experience_years_public;
    const monthlyRate = data.monthly_rate;

    const placeholderImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400';
    const displayImage = avatarUrl || placeholderImage;

    const handleHireRequest = async (e) => {
        e.stopPropagation();
        if (!user) return navigate('/login');

        setRequesting(true);
        try {
            const { error } = await supabase
                .from('hire_requests')
                .insert({
                    expert_id: data.id,
                    agency_id: user.id,
                    status: 'pending'
                });

            if (error) {
                if (error.code === '23505') {
                    showToast('You already requested this expert.', 'info');
                    setIsRequested(true);
                } else {
                    showToast('Error sending request.', 'error');
                }
                return;
            }

            showToast('Request received. Our team will contact you within 24 hours.', 'success');
            setIsRequested(true);
        } catch (err) {
            showToast('An error occurred.', 'error');
        } finally {
            setRequesting(false);
        }
    };

    const handleCancelRequest = async (e) => {
        e.stopPropagation();
        if (!user) return;

        setRequesting(true);
        try {
            const { error } = await supabase
                .from('hire_requests')
                .delete()
                .eq('expert_id', data.id)
                .eq('agency_id', user.id)
                .eq('status', 'pending');

            if (error) throw error;

            showToast('Request cancelled.', 'info');
            setIsRequested(false);
        } catch (err) {
            showToast('Failed to cancel request.', 'error');
        } finally {
            setRequesting(false);
        }
    };

    const formatPrice = (rate) => {
        if (!rate) return "$TBD";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(rate);
    };

    return (
        <div className="expert-card-glass" onClick={() => navigate(`/experts/${data.id}`)}>
            {/* Header: Price & Badge */}
            <div className="card-glass-badges">
                <div className="glass-platform-badge">
                    <ShieldCheck size={10} />
                    <span>Vetted</span>
                </div>
                <div className="glass-price-badge">{formatPrice(monthlyRate)}/mo</div>
            </div>

            {/* Avatar Section */}
            <div className="glass-avatar-area">
                <img src={displayImage} alt="" className="glass-card-img" />
            </div>

            {/* Info Section */}
            <div className="glass-card-body">
                <div className="glass-name-row">
                    <h3>{fullName}</h3>
                    <CheckCircle2 size={14} fill="#10b981" color="white" />
                </div>

                <div className="glass-experience">
                    <Briefcase size={12} />
                    <span>{experience || 0} Years Experience</span>
                </div>

                <p className="glass-bio-slim">
                    {bio || 'Expert product specialist available for immediate managed placement.'}
                </p>

                <div className="glass-skills-wrap">
                    {skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="glass-skill-dot">{s}</span>
                    ))}
                </div>

                <div className="glass-availability">
                    <span className="avail-label">Available for:</span>
                    <div className="avail-options">
                        <span>✔ Full-time</span>
                        <span>✔ Contract</span>
                    </div>
                </div>

                {isRequested ? (
                    <button
                        className="glass-btn-cancel"
                        onClick={handleCancelRequest}
                        disabled={requesting}
                    >
                        {requesting ? 'Processing...' : <><XCircle size={14} /> Cancel Request</>}
                    </button>
                ) : (
                    <button
                        className="glass-btn-hire"
                        onClick={handleHireRequest}
                        disabled={requesting}
                    >
                        {requesting ? 'Processing...' : <><Send size={14} /> Request Hire</>}
                    </button>
                )}
            </div>

            <style>{`
                .expert-card-glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 1.5rem;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .expert-card-glass:hover {
                    border-color: #2563eb80;
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
                    background: rgba(255, 255, 255, 0.85);
                }

                .card-glass-badges {
                    position: absolute;
                    top: 0.75rem;
                    left: 0.75rem;
                    right: 0.75rem;
                    display: flex;
                    justify-content: space-between;
                    z-index: 10;
                }
                .glass-platform-badge {
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(4px);
                    color: white;
                    padding: 0.25rem 0.625rem;
                    border-radius: 999px;
                    font-size: 0.625rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    text-transform: uppercase;
                }
                .glass-price-badge {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(4px);
                    color: #0f172a;
                    padding: 0.25rem 0.625rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }

                .glass-avatar-area {
                    height: 160px;
                    width: 100%;
                    overflow: hidden;
                }
                .glass-card-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .glass-card-body {
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .glass-name-row { display: flex; align-items: center; gap: 0.375rem; }
                .glass-name-row h3 { margin: 0; font-size: 1rem; font-weight: 800; color: #0f172a; }
                
                .glass-experience {
                    display: flex; align-items: center; gap: 0.375rem;
                    font-size: 0.75rem; color: #64748b; font-weight: 600;
                }

                .glass-bio-slim {
                    margin: 0.25rem 0;
                    font-size: 0.75rem;
                    line-height: 1.4;
                    color: #475569;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-weight: 500;
                }

                .glass-skills-wrap { display: flex; flex-wrap: wrap; gap: 0.25rem; }
                .glass-skill-dot {
                    background: rgba(37, 99, 235, 0.05);
                    color: #2563eb;
                    font-size: 0.625rem;
                    font-weight: 700;
                    padding: 0.125rem 0.5rem;
                    border-radius: 4px;
                }

                .glass-availability {
                    margin: 0.5rem 0;
                    padding-top: 0.5rem;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }
                .avail-label { font-size: 0.625rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
                .avail-options {
                    display: flex; gap: 0.75rem; margin-top: 0.25rem;
                    font-size: 0.75rem; font-weight: 700; color: #10b981;
                }

                .glass-btn-hire {
                    width: 100%;
                    padding: 0.75rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 800;
                    font-size: 0.8125rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
                }
                .glass-btn-hire:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }

                .glass-btn-cancel {
                    width: 100%;
                    padding: 0.75rem;
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    font-weight: 800;
                    font-size: 0.8125rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .glass-btn-cancel:hover:not(:disabled) { background: #fef2f2; border-color: #fee2e2; color: #ef4444; }

                .glass-btn-hire:disabled, .glass-btn-cancel:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default ExpertCard;
