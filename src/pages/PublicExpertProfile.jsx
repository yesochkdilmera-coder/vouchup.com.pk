import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
    CheckCircle2, Briefcase, Globe, Mail, ExternalLink,
    ChevronLeft, Star, Clock, ShieldCheck, MapPin,
    Calendar, Link as LinkIcon
} from 'lucide-react'
import { useAuth } from '../components/AuthProvider'
import { useToast } from '../components/ToastContext'
import DetailedExpertProfile from '../components/marketplace/DetailedExpertProfile'

export default function PublicExpertProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showToast } = useToast()
    const [expert, setExpert] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isRequested, setIsRequested] = useState(false)
    const [requestLoading, setRequestLoading] = useState(false)

    useEffect(() => {
        if (id) {
            fetchExpertProfile()
            if (user) {
                checkRequestStatus()
            }
        }
    }, [id, user])

    const fetchExpertProfile = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, portfolio_items(*)')
                .eq('id', id)
                .eq('role', 'expert')
                .single()

            if (error) throw error

            if (data.moderation_status !== 'approved') {
                throw new Error('Profile is not currently public.')
            }

            setExpert(data)
        } catch (err) {
            console.error('Error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const checkRequestStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('hire_requests')
                .select('id')
                .eq('expert_id', id)
                .eq('agency_id', user.id)
                .eq('status', 'pending')
                .maybeSingle()

            if (data) {
                setIsRequested(true)
            }
        } catch (err) {
            console.error('Error checking status:', err)
        }
    }

    const handleCancelRequest = async () => {
        if (!user) return

        setRequestLoading(true)
        try {
            const { error } = await supabase
                .from('hire_requests')
                .delete()
                .eq('expert_id', id)
                .eq('agency_id', user.id)
                .eq('status', 'pending')

            if (error) throw error

            setIsRequested(false)
            showToast('Request cancelled.', 'info')
        } catch (err) {
            console.error('Cancel request error:', err)
            showToast('Failed to cancel request.', 'error')
        } finally {
            setRequestLoading(false)
        }
    }

    const handleHireRequest = async () => {
        if (!user) return navigate('/login')
        if (isRequested) return handleCancelRequest()

        setRequestLoading(true)
        try {
            const { error } = await supabase
                .from('hire_requests')
                .insert({
                    expert_id: id,
                    agency_id: user.id,
                    status: 'pending'
                })

            if (error) {
                if (error.code === '23505') {
                    setIsRequested(true)
                    showToast('You already requested this expert.', 'info')
                } else {
                    throw error
                }
                return
            }

            setIsRequested(true)
            showToast('Request submitted. Our team will contact you within 24 hours.', 'success')
        } catch (err) {
            console.error('Hire request error:', err)
            showToast('Failed to submit request.', 'error')
        } finally {
            setRequestLoading(false)
        }
    }

    if (loading) return (
        <div className="profile-loading">
            <div className="spinner"></div>
            <p>Loading Expert identity...</p>
        </div>
    )

    if (error) return (
        <div className="profile-error">
            <div className="error-card">
                <ShieldCheck size={48} color="#94a3b8" />
                <h2>Profile Restricted</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/talents')}>Back to Marketplace</button>
            </div>
        </div>
    )

    return (
        <div className="public-profile-page">
            <div className="profile-top-bar">
                <button onClick={() => navigate('/talents')} className="btn-back">
                    <ChevronLeft size={20} />
                    <span>Back to Marketplace</span>
                </button>
            </div>

            <div className="profile-page-container">
                <DetailedExpertProfile
                    expert={expert}
                    isDraft={false}
                    isRequested={isRequested}
                    requestLoading={requestLoading}
                    onHireClick={handleHireRequest}
                />
            </div>

            <style>{`
                .public-profile-page {
                    background: #f8fafc;
                    min-height: 100vh;
                    padding-bottom: 5rem;
                }

                .profile-top-bar {
                    background: white;
                    padding: 1rem 2rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .btn-back {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .btn-back:hover { color: #0f172a; }

                .profile-page-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }

                .profile-loading, .profile-error {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: #64748b;
                }

                .error-card {
                    text-align: center;
                    background: white;
                    padding: 4rem 2rem;
                    border-radius: 2rem;
                    border: 1px solid #e2e8f0;
                    max-width: 400px;
                }

                .error-card h2 { color: #0f172a; margin: 1.5rem 0 0.5rem; }
                .error-card button {
                    margin-top: 2rem;
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
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
                    .profile-page-container { padding: 1rem; }
                }
            `}</style>
        </div>
    )
}
