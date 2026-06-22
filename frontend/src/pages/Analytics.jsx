import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { analyticsAPI } from '../api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { BarChart3, TrendingUp, Target, BookOpen } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color || '#818cf8' }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.get().then(r => r.data.analytics),
  });

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track your interview performance trends over time.</p>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 28 }}>
          {[
            { label: 'Total Interviews', value: data?.summary?.totalInterviews ?? 0, color: 'var(--accent-blue)' },
            { label: 'Avg Score', value: data?.summary?.avgScore ? `${data.summary.avgScore}/10` : '—', color: 'var(--accent-purple)' },
            { label: 'Questions Answered', value: data?.summary?.totalQuestions ?? 0, color: 'var(--accent-green)' },
            { label: 'Readiness', value: `${data?.summary?.readinessScore ?? 0}%`, color: 'var(--accent-orange)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Score Timeline */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1rem' }}>Score Over Time</h3>
          </div>
          {data?.scoreTimeline?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.scoreTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#9090b0', fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9090b0', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} name="Overall" />
                <Line type="monotone" dataKey="technical" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} name="Technical" />
                <Line type="monotone" dataKey="hr" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="HR" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Complete interviews to see your score history
            </div>
          )}
        </div>

        {/* Topic Radar or Bar */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BarChart3 size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1rem' }}>Topic-wise Scores</h3>
          </div>
          {data?.topicPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topicPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 10]} tick={{ fill: '#9090b0', fontSize: 11 }} />
                <YAxis type="category" dataKey="topic" tick={{ fill: '#9090b0', fontSize: 10 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgScore" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No topic data yet
            </div>
          )}
        </div>
      </div>

      {/* Weekly Interviews + Weak Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Target size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1rem' }}>Weekly Interview Count</h3>
          </div>
          {data?.weeklyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: '#9090b0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9090b0', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="interviews" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Interviews" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BookOpen size={18} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '1rem' }}>Top Weak Areas</h3>
          </div>
          {data?.topWeakAreas?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.topWeakAreas.map(({ area, count }) => (
                <div key={area}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{area}</span>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>×{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min((count / (data.topWeakAreas[0]?.count || 1)) * 100, 100)}%`, background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Complete interviews to see focus areas</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
