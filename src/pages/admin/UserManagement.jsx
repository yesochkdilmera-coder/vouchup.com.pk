
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Search, Loader, ShieldAlert, ShieldCheck, Ban, Trash2 } from 'lucide-react'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionLoading, setActionLoading] = useState(null)

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true })
        // Wait, I created profiles table with:
        // id, updated_at, full_name, agency_name, email, phone... 
        // I should sort by something else or just ID for now.

        if (error) {
            console.error('Error fetching users:', error)
        } else {
            setUsers(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handlePromote = async (userId) => {
        if (!window.confirm("Are you sure you want to promote this user to Admin?")) return;
        setActionLoading(userId)

        // We update the role directly. The trigger checks if WE (the current user) are admin.
        // AuthProvider ensures we can only reach here if we are admin.
        // RLS policy ensures we can update rows.
        const { error } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)

        if (error) {
            alert("Failed to promote user: " + error.message)
        } else {
            // Refresh local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: 'admin' } : u))
        }
        setActionLoading(null)
    }

    const handleDemote = async (userId) => {
        if (!window.confirm("Are you sure you want to remove admin rights from this user?")) return;
        setActionLoading(userId)

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'user' })
            .eq('id', userId)

        if (error) {
            alert("Failed to demote user: " + error.message)
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: 'user' } : u))
        }
        setActionLoading(null)
    }

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.agency_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>User Management</h1>

                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            minWidth: '300px'
                        }}
                    />
                </div>
            </div>


            {loading ? (
                <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="spinner"></div>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>User</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Email</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Role</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500, color: '#1e293b' }}>{user.full_name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{user.agency_name}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ color: '#1e293b' }}>{user.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f1f5f9',
                                                color: user.role === 'admin' ? '#1e40af' : '#475569',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}>
                                                {user.role === 'admin' && <ShieldCheck size={12} style={{ marginRight: '0.25rem' }} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {actionLoading === user.id ? (
                                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Updating...</span>
                                            ) : (
                                                user.role === 'admin' ? (
                                                    <button
                                                        onClick={() => handleDemote(user.id)}
                                                        className="btn-danger"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
                                                        title="Demote to User"
                                                    >
                                                        Demote
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePromote(user.id)}
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: 'white', color: '#1e293b' }}
                                                        title="Promote to Admin"
                                                    >
                                                        Make Admin
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
