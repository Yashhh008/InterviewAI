import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { interviewAPI } from '../api';
import Layout from '../components/Layout';
import { MessageSquare, Clock, Building2, Award, Search, Filter, ChevronRight, RotateCcw } from 'lucide-react';

const modeColors = {
  practice: 'badge-blue', timed: 'badge-orange', company: 'badge-purple', role: 'badge-green'
};

export default function InterviewHistory() {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['interviews', page, filterMode],
    queryFn: () => interviewAPI.getHistory({ page, limit: 10, mode: filterMode || undefined }).then(r => r.data),
    keepPreviousData: true,
  });

  const interviews = data?.interviews || [];
  const pagination = data?.pagination;

  const filtered = search
    ? interviews.filter(i => i.role?.toLowerCase().includes(search.toLowerCase()) || i.company?.toLowerCase().includes(search.toLowerCase()))
    : interviews;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Interview History</h1>
        <p className="page-subtitle">Review all your past interview sessions and reports.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 42 }} placeholder="Search by role or company..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="filter-mode" className="input-field" value={filterMode} onChange={e => setFilterMode(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All Modes</option>
          <option value="practice">Practice</option>
          <option value="timed">Timed</option>
          <option value="company">Company</option>
          <option value="role">Role</option>
        </select>
        <Link to="/interview/new" className="btn-primary" style={{ padding: '12px 20px' }}>
          <MessageSquare size={16} /> New Interview
        </Link>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="shimmer glass-card" style={{ height: 90 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <MessageSquare size={56} style={{ marginBottom: 16, opacity: 0.2 }} />
          <h3 style={{ marginBottom: 12 }}>No interviews found</h3>
          <Link to="/interview/new" className="btn-primary">Start Your First Interview</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(i => (
            <div key={i._id} className="glass-card fade-in" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {/* Score */}
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: i.status === 'completed' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', color: 'white'
              }}>
                {i.status === 'completed' ? i.overallScore?.toFixed(0) : '—'}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>
                    {i.role || 'General Interview'} {i.company ? `@ ${i.company}` : ''}
                  </h3>
                  <span className={`badge ${modeColors[i.mode]}`}>{i.mode}</span>
                  <span className={`badge ${i.status === 'completed' ? 'badge-green' : i.status === 'abandoned' ? 'badge-red' : 'badge-orange'}`}>
                    {i.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageSquare size={12} /> {i.answeredQuestions}/{i.totalQuestions} answered
                  </span>
                  {i.duration > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Award size={12} /> {i.duration} min
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                {i.status === 'completed' ? (
                  <Link to={`/interview/${i._id}/report`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                    View Report <ChevronRight size={14} />
                  </Link>
                ) : (
                  <Link to={`/interview/${i._id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                    Continue
                  </Link>
                )}
                <Link to="/interview/new" className="btn-ghost" title="Retake">
                  <RotateCcw size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 32 }}>
          <button className="btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px' }}>Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Page {page} of {pagination.pages}</span>
          <button className="btn-secondary" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ padding: '8px 16px' }}>Next</button>
        </div>
      )}
    </Layout>
  );
}
