import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ExpertCard from '../components/marketplace/ExpertCard'
import { Search, Users } from 'lucide-react'

export default function TalentMarketplace() {
    const [experts, setExperts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchExperts()
    }, [])

    const fetchExperts = async () => {
        setLoading(true)
        console.log('--- MARKETPLACE FETCH START ---')
        try {
            // Pipeline Rule: ONLY show 'approved' experts
            // Pipeline Rule: Use ONLY published/public fields for display
            const { data, error } = await supabase
                .from('profiles')
                .select('*, portfolio_items(*)')
                .eq('role', 'expert')
                .eq('moderation_status', 'approved')
                .eq('marketplace_status', 'available')
                .order('published_at', { ascending: false })

            if (error) {
                console.error('Marketplace Query Error:', error)
                throw error
            }

            console.log(`Marketplace returned ${data?.length || 0} approved experts`)
            if (data?.length > 0) {
                console.log('Sample Expert ID:', data[0].id)
                console.log('Sample Public Name:', data[0].public_full_name)
            }

            setExperts(data || [])
        } catch (err) {
            console.error('CRITICAL: Marketplace fetch failed', err)
        } finally {
            setLoading(false)
            console.log('--- MARKETPLACE FETCH END ---')
        }
    }

    // Logic for filtering by search term
    const filteredExperts = experts.filter(expert => {
        const nameMatch = (expert.public_full_name || expert.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        const bioMatch = (expert.bio_public || '').toLowerCase().includes(searchTerm.toLowerCase())
        // Skill search on public skills array
        const skillsMatch = (expert.skills_public || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))

        return nameMatch || bioMatch || skillsMatch
    })

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="header-content">
                    <h1 className="marketplace-title">Expert Marketplace</h1>
                    <p className="marketplace-subtitle">Connect with vetted product specialists ready to scale your mission.</p>
                </div>

                <div className="marketplace-controls">
                    <div className="search-bar">
                        <Search size={20} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search by name, expertise, or bio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="marketplace-content">
                {loading ? (
                    <div className="marketplace-loading">
                        <div className="spinner"></div>
                        <p>Syncing top-tier talent...</p>
                    </div>
                ) : (
                    <div className="marketplace-container">
                        {filteredExperts.length === 0 ? (
                            <div className="empty-marketplace">
                                <Users size={48} color="#cbd5e1" strokeWidth={1.5} />
                                <h3>No experts available yet</h3>
                                <p>We're currently vetting new applications. Check back soon for fresh talent.</p>
                            </div>
                        ) : (
                            <div className="expert-grid">
                                {filteredExperts.map(expert => (
                                    <ExpertCard
                                        key={expert.id}
                                        data={expert}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .marketplace-page {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    padding-bottom: 8rem;
                }

                .marketplace-header {
                    padding: 4rem 2rem 3rem;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    margin-bottom: 3rem;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto 2.5rem;
                }

                .marketplace-title {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin: 0 0 0.75rem;
                }

                .marketplace-subtitle {
                    color: #64748b;
                    font-size: 1.25rem;
                    max-width: 600px;
                    font-weight: 500;
                    line-height: 1.5;
                }

                .marketplace-controls {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    gap: 1rem;
                }

                .search-bar {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: #f1f5f9;
                    padding: 1rem 1.5rem;
                    border-radius: 1.25rem;
                    border: 2px solid transparent;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .search-bar:focus-within {
                    background: white;
                    border-color: #3b82f6;
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
                    transform: translateY(-2px);
                }

                .search-bar input {
                    background: none;
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 1.125rem;
                    color: #0f172a;
                    font-weight: 600;
                }

                .marketplace-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .expert-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2.5rem;
                }

                .marketplace-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 12rem 0;
                    color: #64748b;
                    gap: 2rem;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .empty-marketplace {
                    text-align: center;
                    padding: 10rem 2rem;
                    background: white;
                    border-radius: 3rem;
                    border: 2px dashed #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.25rem;
                }

                .empty-marketplace h3 {
                    margin: 0;
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #0f172a;
                }

                .empty-marketplace p {
                    color: #64748b;
                    font-size: 1.125rem;
                    font-weight: 500;
                    max-width: 400px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .marketplace-header { padding: 3rem 1.5rem 2rem; }
                    .marketplace-title { font-size: 2.25rem; }
                    .marketplace-container { padding: 0 1.5rem; }
                    .expert-grid { gap: 1.5rem; }
                }
            `}</style>
        </div>
    )
}
