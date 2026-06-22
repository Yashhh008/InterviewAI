import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { BarChart3, FileText, MessageSquare, Zap, Target, TrendingUp, Clock, Award, ArrowRight, AlertTriangle, BookOpen } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.get().then(r => r.data.analytics),
    staleTime: 60000,
  });

  const stats = data?.summary;
  const readiness = stats?.readinessScore || 0;

  const statCards = [
    {
      label: 'Resume Match Score',
      value: stats ? `${readiness}%` : '—',
      icon: Target,
      color: readiness >= 75 ? 'var(--accent-green)' : readiness >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
      subtitle: stats?.resumeUploaded ? 'Based on latest ATS report' : 'Upload your resume to get started',
      link: '/ats',
    },
    {
      label: 'Interviews Taken',
      value: stats?.totalInterviews ?? '—',
      icon: MessageSquare,
      color: 'var(--accent-blue)',
      subtitle: 'Total completed sessions',
      link: '/history',
    },
    {
      label: 'Average Score',
      value: stats?.avgScore ? `${stats.avgScore}/10` : '—',
      icon: BarChart3,
      color: 'var(--accent-purple)',
      subtitle: 'Across all interviews',
      link: '/analytics',
    },
    {
      label: 'Readiness Score',
      value: stats ? `${readiness}%` : '—',
      icon: Award,
      color: readiness >= 70 ? 'var(--accent-green)' : 'var(--accent-orange)',
      subtitle: readiness >= 70 ? 'Interview ready!' : 'Keep practicing',
      link: '/analytics',
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="page-subtitle">
          {stats?.totalInterviews > 0
            ? `You've completed ${stats.totalInterviews} interview${stats.totalInterviews !== 1 ? 's' : ''}. Keep up the momentum!`
            : 'Your interview preparation dashboard. Let\'s get started!'}
        </p>
      </div>

      {/* Quick Actions */}
      {!stats?.resumeUploaded && (
        <div style={{
          padding: 20, marginBottom: 28, borderRadius: 14,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
        }}>
          <AlertTriangle size={20} color="var(--accent-orange)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>No resume uploaded yet</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Upload your resume to unlock ATS matching and personalized interview questions.</div>
          </div>
          <Link to="/resume" className="btn-primary" style={{ padding: '10px 20px' }}>
            <FileText size={16} /> Upload Resume
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {statCards.map(({ label, value, icon: Icon, color, subtitle, link }) => (
          <Link key={label} to={link} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
              {isLoading ? (
                <div className="shimmer" style={{ height: 36, borderRadius: 6, marginBottom: 8 }} />
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color, marginBottom: 4 }}>
                  {value}
                </div>
              )}
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.9rem' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Weekly Progress */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1rem' }}>Weekly Progress</h3>
          </div>
          {isLoading ? (
            <div className="shimmer" style={{ height: 180, borderRadius: 8 }} />
          ) : data?.weeklyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#9090b0', fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9090b0', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgScore" stroke="var(--accent-blue)" strokeWidth={2} dot={{ fill: 'var(--accent-blue)', r: 4 }} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p>Complete interviews to see your progress</p>
            </div>
          )}
        </div>

        {/* Topic Performance */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BarChart3 size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1rem' }}>Topic Performance</h3>
          </div>
          {isLoading ? (
            <div className="shimmer" style={{ height: 180, borderRadius: 8 }} />
          ) : data?.topicPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topicPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="topic" tick={{ fill: '#9090b0', fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9090b0', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgScore" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p>No topic data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent + Weak Areas + Quick Start */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Interviews */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1rem' }}>Recent Interviews</h3>
            </div>
            <Link to="/history" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'none' }}>View all</Link>
          </div>
          {data?.recentInterviews?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.recentInterviews.map(i => (
                <Link key={i._id} to={`/interview/${i._id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {i.overallScore?.toFixed(0) || '—'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.role || 'General Interview'} {i.company ? `@ ${i.company}` : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(i.createdAt).toLocaleDateString()} · {i.mode} · {i.totalQuestions}Q
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <MessageSquare size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ marginBottom: 16 }}>No interviews yet</p>
              <Link to="/interview/new" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>Start Interview</Link>
            </div>
          )}
        </div>

        {/* Weak Areas + Start Interview CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <BookOpen size={18} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '1rem' }}>Focus Areas</h3>
            </div>
            {data?.topWeakAreas?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.topWeakAreas.map(({ area, count }) => (
                  <div key={area} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{area}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                      {count}× missed
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Complete interviews to see your weak areas</p>
            )}
          </div>

          <div style={{
            padding: 24, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
            textAlign: 'center'
          }}>
            <Zap size={32} color="var(--accent-blue)" style={{ marginBottom: 12 }} />
            <h3 style={{ marginBottom: 8 }}>Ready to Practice?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
              Start a personalized mock interview now
            </p>
            <Link to="/interview/new" className="btn-primary" style={{ justifyContent: 'center' }}>
              <MessageSquare size={16} /> Start Interview
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
