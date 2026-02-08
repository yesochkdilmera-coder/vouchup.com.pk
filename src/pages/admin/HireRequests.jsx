import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    CheckCircle, XCircle, Clock, Search,
    MoreVertical, User, Briefcase, Mail,
    ExternalLink, RefreshCw, Filter, MessageSquare,
    DollarSign, Calendar
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';

export default function HireRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const { showToast } = useToast();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('hire_requests')
                .select(`
                    *,
                    expert:expert_id(id, full_name, public_full_name, avatar_url_public, monthly_rate),
                    agency:agency_id(id, full_name, email, agency_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            console.error('Error:', err);
            showToast('Failed to load requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            if (newStatus === 'approved') {
                const { error } = await supabase.rpc('approve_hire_request', {
                    request_id: id,
                    contract_end_date: null // Or fetch from a modal if needed
                });
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('hire_requests')
                    .update({ status: newStatus, updated_at: new Date() })
                    .eq('id', id);
                if (error) throw error;
            }

            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            showToast(`Request ${newStatus}`, 'success');

            // Refresh experts status in background if needed
            if (newStatus === 'approved' || newStatus === 'completed' || newStatus === 'pending') {
                fetchRequests();
            }
        } catch (err) {
            console.error('Update failed:', err);
            showToast('Update failed', 'error');
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch =
            (r.expert?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.agency?.agency_name || r.agency?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="admin-loading">
            <RefreshCw className="spinning" size={32} />
            <p>Loading Staffel Requests...</p>
        </div>
    );

    return (
        <div className="hire-requests-page">
            <header className="page-header">
                <div>
                    <h1>Hire Requests</h1>
                    <p>Manage managed placement staff requests ({requests.length})</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search agency or expert..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <Filter size={16} />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="contacted">Contacted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="requests-table-container">
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>Expert</th>
                            <th>Agency</th>
                            <th>Commercials</th>
                            <th>Requested On</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(req => (
                            <tr key={req.id}>
                                <td>
                                    <div className="expert-info">
                                        <img src={req.expert?.avatar_url_public || 'https://via.placeholder.com/40'} alt="" />
                                        <div>
                                            <span className="info-name">{req.expert?.public_full_name || req.expert?.full_name}</span>
                                            <span className="info-sub">ID: ...{req.expert?.id.slice(-6)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="agency-info">
                                        <span className="info-name">{req.agency?.agency_name || req.agency?.full_name}</span>
                                        <span className="info-sub">{req.agency?.email}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="price-info">
                                        <DollarSign size={14} />
                                        <span>{req.expert?.monthly_rate ? `${req.expert.monthly_rate}/mo` : 'TBD'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="date-info">
                                        <Calendar size={14} />
                                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${req.status}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(req.id, 'contacted')} title="Contact Agency" className="btn-icon">
                                                    <Mail size={16} />
                                                </button>
                                                <button onClick={() => handleUpdateStatus(req.id, 'approved')} title="Approve" className="btn-icon success">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button onClick={() => handleUpdateStatus(req.id, 'rejected')} title="Reject" className="btn-icon danger">
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                        {req.status !== 'pending' && (
                                            <button onClick={() => handleUpdateStatus(req.id, 'pending')} title="Reset" className="btn-icon">
                                                <RefreshCw size={14} />
                                            </button>
                                        )}
                                        <button className="btn-icon">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredRequests.length === 0 && (
                    <div className="empty-state">
                        <MessageSquare size={48} />
                        <p>No hire requests found.</p>
                    </div>
                )}
            </div>

            <style>{`
                .hire-requests-page { padding: 2rem; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .page-header h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
                .page-header p { color: #64748b; font-weight: 500; }

                .header-actions { display: flex; gap: 1rem; }
                .search-box { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; width: 300px; }
                .search-box input { border: none; outline: none; width: 100%; font-weight: 500; }
                .filter-group { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
                .filter-group select { border: none; outline: none; font-weight: 600; color: #1e293b; cursor: pointer; }

                .requests-table-container { background: white; border: 1px solid #e2e8f0; border-radius: 1.25rem; overflow: hidden; }
                .requests-table { width: 100%; border-collapse: collapse; text-align: left; }
                .requests-table th { background: #f8fafc; padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
                .requests-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

                .expert-info { display: flex; align-items: center; gap: 1rem; }
                .expert-info img { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; }
                .info-name { display: block; font-weight: 700; color: #0f172a; font-size: 0.9375rem; }
                .info-sub { display: block; font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

                .agency-info { display: flex; flex-direction: column; }
                .price-info, .date-info { display: flex; align-items: center; gap: 0.5rem; color: #475569; font-weight: 600; font-size: 0.875rem; }

                .status-pill { padding: 0.375rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
                .status-pill.pending { background: #fffbeb; color: #92400e; }
                .status-pill.contacted { background: #eff6ff; color: #2563eb; }
                .status-pill.approved { background: #f0fdf4; color: #10b981; }
                .status-pill.rejected { background: #fef2f2; color: #991b1b; }

                .action-buttons { display: flex; gap: 0.5rem; }
                .btn-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; transition: all 0.2s; }
                .btn-icon:hover { background: #f8fafc; color: #0f172a; }
                .btn-icon.success:hover { color: #10b981; border-color: #10b981; background: #f0fdf4; }
                .btn-icon.danger:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }

                .admin-loading { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #64748b; }
                .spinning { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .empty-state { padding: 4rem; text-align: center; color: #94a3b8; }
                .empty-state p { font-weight: 600; margin-top: 1rem; }

                @media (max-width: 1024px) {
                    .requests-table { display: block; overflow-x: auto; }
                }
            `}</style>
        </div>
    );
}
