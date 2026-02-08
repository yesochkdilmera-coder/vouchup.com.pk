import { useNavigate } from 'react-router-dom'
import { Search, User, ExternalLink, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../components/AuthProvider'

export default function AgencyExperts() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [experts, setExperts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user) {
            fetchHiredExperts()
        }
    }, [user])

    const fetchHiredExperts = async () => {
        setLoading(true)
        console.log('--- FETCHING HIRED EXPERTS ---')
        try {
            // Step 1: Fetch active contracts for this agency
            const { data: contracts, error: contractErr } = await supabase
                .from('contracts')
                .select('*')
                .eq('agency_id', user.id)
                .eq('status', 'active')

            if (contractErr) throw contractErr
            console.log('Active Contracts:', contracts)

            if (!contracts || contracts.length === 0) {
                setExperts([])
                return
            }

            // Step 2: Fetch corresponding expert profiles manually
            // This is safer than PostgREST joins when RLS or schema mapping is complex
            const expertIds = contracts.map(c => c.expert_id)
            const { data: profiles, error: profileErr } = await supabase
                .from('profiles')
                .select('*')
                .in('id', expertIds)

            if (profileErr) throw profileErr
            console.log('Expert Profiles Found:', profiles)

            // Step 3: Merge data
            const team = contracts.map(contract => {
                const profile = profiles.find(p => p.id === contract.expert_id)
                return {
                    ...(profile || {}),
                    contract_id: contract.id,
                    contract_status: contract.status,
                    hired_at: contract.start_date
                }
            })

            console.log('Final Merged Team:', team)
            setExperts(team)
        } catch (err) {
            console.error('CRITICAL: Failed to load agency team:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredExperts = experts.filter(e => {
        const nameMatch = (e.full_name || e.public_full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        const skillMatch = (e.skills_public || []).some(s =>
            (s || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        return nameMatch || skillMatch
    })

    return (
        <div className="agency-experts-page">
            <header className="page-header">
                <div>
                    <h1>Hired Experts</h1>
                    <p>Manage your elite product squad.</p>
                </div>
            </header>

            <div className="search-shelf">
                <div className="search-box">
                    <Search size={20} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Search experts by name or skill..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="experts-grid">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your elite squad...</p>
                    </div>
                ) : filteredExperts.length === 0 ? (
                    <div className="empty-experts">
                        <div className="empty-icon-box">
                            <User size={32} color="#94a3b8" />
                        </div>
                        <h3>Your roster is empty</h3>
                        <p>Once you hire experts from the marketplace, they will appear here for management and workspace assignment.</p>
                        <button className="browse-btn" onClick={() => navigate('/talents')}>
                            Go to Marketplace
                        </button>
                    </div>
                ) : (
                    filteredExperts.map(expert => (
                        <div key={expert.id} className="hired-expert-card" onClick={() => navigate(`/experts/${expert.id}`)}>
                            <div className="he-avatar">
                                <img src={expert.avatar_url_public || expert.avatar_url || 'https://via.placeholder.com/80'} alt="" />
                                <div className="online-indicator"></div>
                            </div>
                            <div className="he-info">
                                <div className="he-name-row">
                                    <h3>{expert.public_full_name || expert.full_name}</h3>
                                    <ShieldCheck size={16} color="#10b981" fill="#f0fffa" />
                                </div>
                                <p className="he-role">{expert.role_title || 'Expert Specialist'}</p>
                                <div className="he-meta-tags">
                                    <span className="tag-pill">Monthly</span>
                                    <span className="tag-pill status active">Active</span>
                                </div>
                            </div>
                            <ExternalLink size={20} className="he-chevron" />
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .page-header {
                    margin-bottom: 2rem;
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

                .search-shelf {
                    margin-bottom: 2rem;
                }
                .search-box {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 0.875rem 1.25rem;
                    border-radius: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .search-box input {
                    border: none;
                    background: none;
                    outline: none;
                    flex: 1;
                    font-weight: 600;
                    font-size: 0.9375rem;
                    color: #1e293b;
                }

                .empty-experts {
                    background: white;
                    border-radius: 2rem;
                    padding: 5rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    border: 1px dashed #cbd5e1;
                }
                .empty-icon-box {
                    width: 64px;
                    height: 64px;
                    background: #f1f5f9;
                    border-radius: 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }
                .empty-experts h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .empty-experts p {
                    margin: 0 auto;
                    color: #64748b;
                    max-width: 320px;
                    font-weight: 500;
                    line-height: 1.6;
                }
                .browse-btn {
                    margin-top: 1rem;
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 0.875rem 1.75rem;
                    border-radius: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .browse-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }

                .hired-expert-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 1.5rem;
                    border-radius: 1.75rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 1rem;
                }
                .hired-expert-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
                    transform: translateX(4px);
                }
                .he-avatar {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    flex-shrink: 0;
                }
                .he-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 1.25rem;
                }
                .online-indicator {
                    position: absolute;
                    bottom: -4px;
                    right: -4px;
                    width: 16px;
                    height: 16px;
                    background: #10b981;
                    border: 3px solid white;
                    border-radius: 50%;
                }
                .he-info {
                    flex: 1;
                }
                .he-name-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.125rem;
                }
                .he-name-row h3 {
                    margin: 0;
                    font-size: 1.125rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .he-role {
                    margin: 0 0 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #64748b;
                }
                .he-meta-tags {
                    display: flex;
                    gap: 0.5rem;
                }
                .tag-pill {
                    font-size: 0.625rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.25rem 0.625rem;
                    border-radius: 6px;
                    letter-spacing: 0.05em;
                }
                .tag-pill.status.active {
                    background: #f0fdf4;
                    color: #166534;
                    border: 1px solid #16653420;
                }
                .he-chevron {
                    color: #cbd5e1;
                    transition: color 0.2s;
                }
                .hired-expert-card:hover .he-chevron {
                    color: #3b82f6;
                }

                @media (max-width: 480px) {
                    .hired-expert-card { padding: 1.25rem; gap: 1rem; }
                    .he-avatar { width: 64px; height: 64px; }
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                .loading-state {
                    padding: 5rem 0;
                    text-align: center;
                    color: #64748b;
                }
            `}</style>
        </div>
    )
}
