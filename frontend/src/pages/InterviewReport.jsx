import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewAPI } from '../api';
import Layout from '../components/Layout';
import { Award, TrendingUp, MessageSquare, Clock, CheckCircle, AlertTriangle, BookOpen, Calendar, ArrowLeft, RotateCcw } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

function ScoreRing({ score, max = 10, label, color }) {
  const pct = (score / max) * 100;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 10px',
        background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
      }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color }}>
          {score?.toFixed(1)}
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

export default function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewAPI.getOne(id).then(r => r.data),
  });

  const interview = data?.interview;
  const questions = data?.questions || [];

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Generating your report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!interview || interview.status !== 'completed') {
    return <Layout><p>Report not available yet.</p></Layout>;
  }

  const radarData = [
    { subject: 'Technical', score: interview.technicalScore || 0 },
    { subject: 'Communication', score: interview.communicationScore || 0 },
    { subject: 'HR', score: interview.hrScore || 0 },
    { subject: 'Overall', score: interview.overallScore || 0 },
  ];

  const answeredQs = questions.filter(q => !q.skipped && q.userAnswer);

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Link to="/history" className="btn-ghost" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
        <h1 className="page-title">Interview Report</h1>
        <p className="page-subtitle">
          {interview.role} {interview.company ? `@ ${interview.company}` : ''} · {new Date(interview.completedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Score Banner */}
      <div style={{
        padding: '28px 32px', marginBottom: 24, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
        border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24
      }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 6 }}>Overall Score</div>
          <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Outfit', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {interview.overallScore?.toFixed(1)}<span style={{ fontSize: '2rem' }}>/10</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <ScoreRing score={interview.technicalScore} label="Technical" color="var(--accent-blue)" />
          <ScoreRing score={interview.communicationScore} label="Communication" color="var(--accent-green)" />
          <ScoreRing score={interview.hrScore} label="HR" color="var(--accent-orange)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <MessageSquare size={14} /> {interview.answeredQuestions}/{interview.totalQuestions} answered
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <Clock size={14} /> {interview.duration} minutes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <Calendar size={14} /> {new Date(interview.completedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Strengths & Weak Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} color="var(--accent-green)" /> Strengths
          </h3>
          {interview.strengths?.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <CheckCircle size={14} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--accent-orange)" /> Areas to Improve
          </h3>
          {interview.weakAreas?.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <AlertTriangle size={14} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{w}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Plan */}
      {interview.improvementPlan && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="var(--accent-blue)" /> Improvement Plan
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '0.95rem' }}>{interview.improvementPlan}</p>
        </div>
      )}

      {/* Study Plan */}
      {interview.studyPlan?.length > 0 && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={16} color="var(--accent-purple)" /> 7-Day Study Plan
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {interview.studyPlan.map((day, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 6, textTransform: 'uppercase' }}>{day.day}</div>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.875rem' }}>{day.topic}</div>
                {day.resources?.map(r => (
                  <div key={r} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 0' }}>• {r}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Breakdown */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={16} color="var(--accent-cyan)" /> Question Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {questions.map((q, i) => (
            <div key={q._id} style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Q{i + 1}</span>
                    <span className={`badge cat-${q.category}`}>{q.category?.toUpperCase()}</span>
                    {q.skipped && <span className="badge badge-red">SKIPPED</span>}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: q.userAnswer ? 10 : 0 }}>{q.question}</p>
                  {q.userAnswer && !q.skipped && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', marginTop: 8 }}>
                      <strong style={{ color: 'var(--text-secondary)', fontStyle: 'normal' }}>Your answer: </strong>{q.userAnswer.substring(0, 120)}{q.userAnswer.length > 120 ? '...' : ''}
                    </div>
                  )}
                </div>
                {!q.skipped && q.aiFeedback?.score != null && (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'white', flexShrink: 0 }}>
                    {q.aiFeedback.score}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/interview/new" className="btn-primary">
          <RotateCcw size={16} /> Retake Interview
        </Link>
        <Link to="/history" className="btn-secondary">
          <ArrowLeft size={16} /> Interview History
        </Link>
        <Link to="/analytics" className="btn-secondary">
          <TrendingUp size={16} /> View Analytics
        </Link>
      </div>
    </Layout>
  );
}
