import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import { User, Shield, Star, Briefcase, Plus, X, Globe, Save, CheckCircle, AlertCircle, Trash2, ExternalLink, Paperclip, Clock, Eye, AlertTriangle } from 'lucide-react'
import ExpertCard from '../../components/marketplace/ExpertCard'

const MARKETING_SKILLS = [
    'Paid Ads', 'Performance Marketing', 'Email Marketing', 'Copywriting',
    'Google Analytics', 'SEO', 'Content Strategy', 'Social Media',
    'HubSpot', 'Salesforce', 'Marketing Automation', 'Influencer Marketing'
]

const CONTACT_MASK_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)|(\+?[0-9\s-]{8,})|(@[a-zA-Z0-9_]{3,})|(whatsapp|telegram|skype|wa\.me|t\.me)/gi

export default function ExpertProfile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)
    const [activeTab, setActiveTab] = useState('info')
    const [showPreview, setShowPreview] = useState(false)

    const [formData, setFormData] = useState({
        full_name_draft: '',
        bio_draft: '',
        experience_years_draft: 0,
        willing_timezone_shift_draft: false,
        skills_draft: [],
        avatar_url_draft: ''
    })

    const [portfolio, setPortfolio] = useState([])
    const [newPortfolio, setNewPortfolio] = useState({ title: '', url: '', type: 'link' })

    useEffect(() => {
        if (user) {
            fetchInitialData()
        }
    }, [user])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const { data: prof, error: profErr } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profErr) throw profErr

            setProfile(prof)
            setFormData({
                full_name_draft: prof.full_name_draft || prof.full_name || '',
                bio_draft: prof.bio_draft || prof.bio || '',
                experience_years_draft: prof.experience_years_draft || prof.experience_years || 0,
                willing_timezone_shift_draft: prof.willing_timezone_shift_draft || prof.willing_timezone_shift || false,
                skills_draft: prof.skills_draft || prof.skills || [],
                avatar_url_draft: prof.avatar_url_draft || prof.avatar_url || ''
            })

            const { data: port, error: portErr } = await supabase
                .from('portfolio_items')
                .select('*')
                .eq('expert_id', user.id)
                .order('created_at', { ascending: false })

            if (portErr) throw portErr
            setPortfolio(port || [])

        } catch (err) {
            console.error('Error:', err)
            setMessage({ type: 'error', text: 'Error fetching profile.' })
        } finally {
            setLoading(false)
        }
    }

    const calculateScore = () => {
        let sc = 0
        if (formData.avatar_url_draft) sc += 20
        if (formData.bio_draft?.length > 20) sc += 20
        if (formData.skills_draft?.length > 0) sc += 20
        if (formData.experience_years_draft > 0) sc += 20
        if (formData.willing_timezone_shift_draft) sc += 20
        return sc
    }

    const handleSaveProfile = async () => {
        const contentToScan = `${formData.bio_draft} ${formData.full_name_draft}`
        if (CONTACT_MASK_REGEX.test(contentToScan)) {
            setMessage({ type: 'error', text: 'Contact info detected. Blocked for policy compliance.' })
            return
        }

        setSaving(true)
        setMessage(null)
        console.log('Submitting profile with status → pending')
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    full_name_draft: formData.full_name_draft,
                    bio_draft: formData.bio_draft,
                    experience_years_draft: formData.experience_years_draft,
                    willing_timezone_shift_draft: formData.willing_timezone_shift_draft,
                    skills_draft: formData.skills_draft,
                    avatar_url_draft: formData.avatar_url_draft,
                    moderation_status: 'pending',
                    submitted_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single()

            if (error) throw error
            console.log('Submission successful:', data)
            setMessage({ type: 'success', text: 'Submitted for administration review.' })
            setProfile(data)
        } catch (err) {
            console.error('Submission failed:', err)
            setMessage({ type: 'error', text: err.message })
        } finally {
            setSaving(false)
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSaving(true)
        try {
            const fileName = `${user.id}/${Date.now()}`
            const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, file)
            if (upErr) throw upErr
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

            await supabase.from('profiles').update({ avatar_url_draft: publicUrl }).eq('id', user.id)
            setFormData(prev => ({ ...prev, avatar_url_draft: publicUrl }))
            setMessage({ type: 'success', text: 'Photo uploaded.' })
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setSaving(false)
        }
    }

    const toggleSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills_draft: prev.skills_draft.includes(skill)
                ? prev.skills_draft.filter(s => s !== skill)
                : [...prev.skills_draft, skill]
        }))
    }

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>

    const score = calculateScore()

    return (
        <div className="expert-profile-view">
            {/* Header / Summary */}
            <div className="profile-header-card">
                <div className="header-top">
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Badge color="#eff6ff" text="DRAFT" />
                        {profile?.published_at && <Badge color="#f0fdf4" text="LIVE" />}
                    </div>
                    <button onClick={() => setShowPreview(true)} className="preview-btn">
                        <Eye size={16} /> <span>Preview</span>
                    </button>
                </div>

                <div className="score-container">
                    <div className="score-label">
                        <span>Profile Quality</span>
                        <span>{score}%</span>
                    </div>
                    <div className="score-bar-bg">
                        <div className="score-bar-fill" style={{ width: `${score}%` }} />
                    </div>
                </div>
            </div>

            <div className="view-title-row">
                <h1 className="view-title">Inner CV</h1>
                <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="save-action-btn"
                >
                    <Save size={18} /> {saving ? 'Submitting...' : 'Save & Publish'}
                </button>
            </div>

            {profile?.moderation_status === 'pending' && (
                <div className="alert-banner pending">
                    <Clock size={16} /> <span>Queue: Awaiting Platform Moderation</span>
                </div>
            )}

            {message && (
                <div className={`alert-banner ${message.type === 'error' ? 'error' : 'success'}`}>
                    {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Tab Controls */}
            <div className="tab-group">
                <button className={`tab-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Ident</button>
                <button className={`tab-item ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>Skills</button>
                <button className={`tab-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>Assets</button>
            </div>

            <div className="form-content-card">
                {activeTab === 'info' && (
                    <div className="form-stack">
                        <div className="avatar-pick-row">
                            <div className="avatar-preview">
                                {formData.avatar_url_draft ? <img src={formData.avatar_url_draft} /> : <User size={40} color="#94a3b8" />}
                            </div>
                            <label className="avatar-label">
                                Update Photo
                                <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                        </div>

                        <div className="input-group">
                            <label>Professional Display Name</label>
                            <div className="input-wrapper">
                                <User size={16} className="input-icon" />
                                <input value={formData.full_name_draft} onChange={e => setFormData({ ...formData, full_name_draft: e.target.value })} placeholder="Worker ID or Name" />
                            </div>
                        </div>

                        <div className="flex-card-toggle">
                            <div className="toggle-info">
                                <h3>Timezone Sync</h3>
                                <p>Willing to shift to agency hours?</p>
                            </div>
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, willing_timezone_shift_draft: !prev.willing_timezone_shift_draft }))}
                                className={`toggle-btn ${formData.willing_timezone_shift_draft ? 'on' : 'off'}`}
                            >
                                {formData.willing_timezone_shift_draft ? 'ENABLED' : 'DISABLED'}
                            </button>
                        </div>

                        <div className="input-group">
                            <label>Bio / Expertise Summary (Draft)</label>
                            <textarea rows={5} value={formData.bio_draft} onChange={e => setFormData({ ...formData, bio_draft: e.target.value })} placeholder="Focus on results and software expertise..." />
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="form-stack">
                        <div className="skills-grid">
                            {MARKETING_SKILLS.map(s => (
                                <button key={s} onClick={() => toggleSkill(s)} className={`skill-chip ${formData.skills_draft.includes(s) ? 'active' : ''}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="input-group">
                            <label>Years of Industry Experience</label>
                            <input type="number" value={formData.experience_years_draft} onChange={e => setFormData({ ...formData, experience_years_draft: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <PortfolioTab portfolio={portfolio} setPortfolio={setPortfolio} expertId={user.id} />
                )}
            </div>

            {showPreview && <PreviewModal profile={profile} onClose={() => setShowPreview(false)} />}

            <style>{`
                .expert-profile-view {
                    animation: fadeIn 0.4s ease-out;
                    max-width: 100%;
                }

                .profile-header-card {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 1.25rem;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 1.5rem;
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }

                .preview-btn {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    cursor: pointer;
                    color: #475569;
                }

                .score-container {
                    margin-top: 0.5rem;
                }

                .score-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .score-bar-bg {
                    height: 8px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .score-bar-fill {
                    height: 100%;
                    background: #2563eb;
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .view-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .view-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .save-action-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                    width: 100%;
                }

                @media (min-width: 640px) {
                    .save-action-btn { width: auto; }
                }

                .alert-banner {
                    padding: 0.875rem 1rem;
                    border-radius: 0.75rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    margin-bottom: 1.5rem;
                }

                .alert-banner.pending { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
                .alert-banner.error { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
                .alert-banner.success { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }

                .tab-group {
                    display: flex;
                    gap: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    margin-bottom: 1.5rem;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .tab-item {
                    padding: 0.75rem 0.25rem;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .tab-item.active {
                    color: #2563eb;
                    border-bottom-color: #2563eb;
                }

                .form-content-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 1.25rem;
                    border: 1px solid #e2e8f0;
                }

                .form-stack { display: flex; flex-direction: column; gap: 1.5rem; }

                .avatar-pick-row {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    background: #f8fafc;
                    padding: 1.25rem;
                    border-radius: 1rem;
                }

                .avatar-preview {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    overflow: hidden;
                    border: 2px solid white;
                    flex-shrink: 0;
                }

                .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }

                .avatar-label {
                    background: #0f172a;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                }

                .input-group label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .input-wrapper { position: relative; }
                .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                
                input, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    padding-left: 2.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    font-size: 0.9375rem;
                    outline: none;
                }

                textarea { padding-left: 1rem; resize: none; }
                input:focus, textarea:focus { border-color: #2563eb; ring: 2px solid #2563eb10; }

                .flex-card-toggle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: #f0fdf4;
                    border: 1px solid #dcfce7;
                    border-radius: 1rem;
                }

                .toggle-info h3 { font-size: 0.8125rem; font-weight: 800; margin: 0; color: #166534; }
                .toggle-info p { font-size: 0.75rem; margin: 0.125rem 0 0; color: #15803d; }

                .toggle-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 800;
                    font-size: 0.625rem;
                    cursor: pointer;
                }

                .toggle-btn.on { background: #166534; color: white; }
                .toggle-btn.off { background: #e2e8f0; color: #64748b; }

                .skills-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.625rem;
                }

                .skill-chip {
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .skill-chip.active {
                    background: #2563eb;
                    color: white;
                    border-color: #2563eb;
                }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}

function PreviewModal({ profile, onClose }) {
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="responsive-modal" style={{ backgroundColor: 'white', width: '100%', maxWidth: '450px', borderRadius: '1.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem', margin: 0 }}>Marketplace Preview</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}><X size={20} /></button>
                </div>

                <div style={{ flex: 1, padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <ExpertCard
                        data={profile}
                        isDraft={true}
                        actionLabel="Request"
                    />

                    {!profile?.published_at && (
                        <div style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '1rem', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                            <Clock size={16} color="#92400e" />
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>Not yet public</div>
                                <div style={{ fontSize: '0.625rem', color: '#b45309', fontWeight: 500 }}>Approved version will appear in marketplace.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function PortfolioTab({ portfolio, setPortfolio, expertId }) {
    const [newP, setNewP] = useState({ title: '', url: '' })
    const [up, setUp] = useState(false)

    const addItem = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await supabase.from('portfolio_items').insert({
                expert_id: expertId,
                title: newP.title,
                url: newP.url,
                type: 'link',
                link_status: 'pending'
            }).select().single()
            if (error) throw error
            setPortfolio([data, ...portfolio])
            setNewP({ title: '', url: '' })
        } catch (err) { alert(err.message) }
    }

    const upFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUp(true)
        try {
            const path = `${expertId}/${Date.now()}`
            await supabase.storage.from('expert-portfolio').upload(path, file)
            const { data: { publicUrl } } = supabase.storage.from('expert-portfolio').getPublicUrl(path)
            const { data, error } = await supabase.from('portfolio_items').insert({
                expert_id: expertId,
                title: file.name,
                url: publicUrl,
                file_path: path,
                type: 'file',
                link_status: 'pending'
            }).select().single()
            if (error) throw error
            setPortfolio([data, ...portfolio])
        } catch (err) { alert(err.message) } finally { setUp(false) }
    }

    return (
        <div className="portfolio-content">
            <form onSubmit={addItem} className="asset-form">
                <h4>Approval Link Request</h4>
                <div className="form-row">
                    <input required placeholder="Project Name" value={newP.title} onChange={e => setNewP({ ...newP, title: e.target.value })} />
                    <input required placeholder="URL" value={newP.url} onChange={e => setNewP({ ...newP, url: e.target.value })} />
                    <button type="submit"><Plus size={18} /></button>
                </div>
            </form>

            <div className="upload-dropzone">
                <input type="file" id="p-up" hidden onChange={upFile} />
                <label htmlFor="p-up">
                    <Plus size={20} />
                    <span>Upload Proof (PDF/IMG)</span>
                </label>
            </div>

            <div className="asset-list">
                {portfolio.map(item => (
                    <div key={item.id} className="asset-item">
                        <div className="asset-info">
                            <Paperclip size={16} />
                            <div className="asset-text">
                                <div className="asset-title-row">
                                    <h5>{item.title}</h5>
                                    <span className={`status-pill ${item.link_status}`}>{item.link_status}</span>
                                </div>
                                <a href={item.url} target="_blank" className="asset-link-text">{item.url}</a>
                            </div>
                        </div>
                        <button onClick={() => { if (confirm('Delete?')) supabase.from('portfolio_items').delete().eq('id', item.id).then(() => setPortfolio(p => p.filter(x => x.id !== item.id))) }}><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>

            <style>{`
                .asset-form { background: #f8fafc; padding: 1.25rem; border-radius: 1rem; margin-bottom: 2rem; border: 1px solid #f1f5f9; }
                .asset-form h4 { font-size: 0.8125rem; font-weight: 800; margin: 0 0 1rem; color: #475569; text-transform: uppercase; }
                .form-row { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
                .form-row button { background: #0f172a; color: white; border: none; padding: 0.75rem; border-radius: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                
                @media (min-width: 640px) {
                    .form-row { grid-template-columns: 2fr 3fr auto; }
                }

                .upload-dropzone { background: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 1rem; padding: 2rem; text-align: center; margin-bottom: 2rem; }
                .upload-dropzone label { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 700; cursor: pointer; }
                .upload-dropzone span { font-size: 0.8125rem; }

                .asset-list { display: grid; gap: 0.75rem; }
                .asset-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #f1f5f9; border-radius: 1rem; background: white; }
                .asset-info { display: flex; gap: 0.75rem; min-width: 0; }
                .asset-text { min-width: 0; }
                .asset-title-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.125rem; }
                .asset-title-row h5 { margin: 0; font-size: 0.875rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .asset-link-text { font-size: 0.75rem; color: #2563eb; text-decoration: none; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                .status-pill { font-size: 0.625rem; font-weight: 800; padding: 0.125rem 0.375rem; border-radius: 4px; text-transform: uppercase; }
                .status-pill.pending { background: #fffbeb; color: #92400e; }
                .status-pill.approved { background: #f0fdf4; color: #166534; }
                .status-pill.rejected { background: #fef2f2; color: #991b1b; }
                
                .asset-item button { background: none; border: none; color: #ef4444; padding: 0.5rem; cursor: pointer; flex-shrink: 0; }
            `}</style>
        </div>
    )
}

function Badge({ color, text }) {
    return <span style={{ backgroundColor: color, color: color === '#eff6ff' ? '#2563eb' : '#166534', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.02em' }}>{text}</span>
}
