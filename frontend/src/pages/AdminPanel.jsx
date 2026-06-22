import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAPI } from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Users, BarChart3, MessageSquare, Shield, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function AdminPanel() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats().then(r => r.data.stats),
  });

  const { data: usersData, isLoading: usersLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers().then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: adminAPI.toggleUser,
    onSuccess: () => { refetch(); toast.success('User status updated.'); },
    onError: () => toast.error('Failed to update user.'),
  });

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'var(--accent-blue)' },
    { label: 'New This Week', value: stats?.newUsersThisWeek ?? '—', icon: TrendingUp, color: 'var(--accent-green)' },
    { label: 'Total Interviews', value: stats?.totalInterviews ?? '—', icon: MessageSquare, color: 'var(--accent-purple)' },
    { label: 'Avg Platform Score', value: stats?.avgPlatformScore ? `${stats.avgPlatformScore}/10` : '—', icon: BarChart3, color: 'var(--accent-orange)' },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Shield size={20} color="var(--accent-purple)" />
          <span className="badge badge-purple">ADMIN</span>
        </div>
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Platform overview and user management.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 28 }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon size={20} color={color} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color, marginBottom: 4 }}>
              {statsLoading ? <div className="shimmer" style={{ height: 36, width: 60, borderRadius: 6 }} /> : value}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={18} color="var(--accent-blue)" /> User Management
        </h2>
        {usersLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ height: 56, borderRadius: 10 }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usersData?.users?.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.isActive
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-green)', fontSize: '0.8rem' }}><CheckCircle size={14} /> Active</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-red)', fontSize: '0.8rem' }}><XCircle size={14} /> Inactive</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        className={u.isActive ? 'btn-danger' : 'btn-ghost'}
                        onClick={() => toggleMutation.mutate(u._id)}
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
