import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { interviewAPI, resumeAPI, jdAPI } from '../api';
import toast from 'react-hot-toast';
import { Play, Clock, Building2, Briefcase, Brain, MessageSquare, ChevronRight } from 'lucide-react';

const modes = [
  { id: 'practice', label: 'Practice Mode', icon: Brain, desc: 'Unlimited time, general questions', color: 'var(--accent-blue)' },
  { id: 'timed', label: 'Timed Interview', icon: Clock, desc: '30 minutes, simulated pressure', color: 'var(--accent-orange)' },
  { id: 'company', label: 'Company Mode', icon: Building2, desc: 'Company-specific questions', color: 'var(--accent-purple)' },
  { id: 'role', label: 'Role Mode', icon: Briefcase, desc: 'Role-focused questions', color: 'var(--accent-green)' },
];

export default function InterviewStart() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState('practice');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [selectedJD, setSelectedJD] = useState('');
  const [questionCount, setQuestionCount] = useState(10);

  const { data: resume } = useQuery({ queryKey: ['resume'], queryFn: () => resumeAPI.get().then(r => r.data.resume), retry: false });
  const { data: jdsData } = useQuery({ queryKey: ['jds'], queryFn: () => jdAPI.getAll().then(r => r.data.jds) });

  const startMutation = useMutation({
    mutationFn: interviewAPI.start,
    onSuccess: (res) => {
      toast.success('Interview started! Good luck! 🎯');
      navigate(`/interview/${res.data.interview._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to start interview.'),
  });

  const handleStart = () => {
    startMutation.mutate({
      company,
      role,
      mode: selectedMode,
      jdId: selectedJD || undefined,
      questionCount,
    });
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Start Interview</h1>
        <p className="page-subtitle">Configure your personalized interview session.</p>
      </div>

      {/* Resume Status */}
      {!resume && (
        <div style={{ padding: 16, marginBottom: 24, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.875rem', color: 'var(--accent-orange)' }}>
          ⚠️ No resume uploaded. Questions will be generic. <a href="/resume" style={{ color: 'var(--accent-blue)', marginLeft: 4 }}>Upload resume →</a>
        </div>
      )}

      {/* Mode Selection */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Interview Mode</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {modes.map(({ id, label, icon: Icon, desc, color }) => (
            <button key={id} id={`mode-${id}`} onClick={() => setSelectedMode(id)} style={{
              padding: 20, borderRadius: 14, border: `2px solid ${selectedMode === id ? color : 'var(--border)'}`,
              background: selectedMode === id ? `${color}12` : 'var(--bg-card)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}>
              <Icon size={24} color={color} style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Config */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Interview Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <div>
            <label className="label">Target Role</label>
            <input id="interview-role" className="input-field" placeholder="e.g. Data Engineer" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div>
            <label className="label">Target Company</label>
            <input id="interview-company" className="input-field" placeholder="e.g. Amazon" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="label">Job Description (Optional)</label>
            <select id="interview-jd" className="input-field" value={selectedJD} onChange={e => setSelectedJD(e.target.value)}>
              <option value="">None — use resume only</option>
              {jdsData?.map(jd => (
                <option key={jd._id} value={jd._id}>{jd.role} {jd.company ? `@ ${jd.company}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Number of Questions: {questionCount}</label>
            <input type="range" min={5} max={20} step={1} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent-blue)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>5 (quick)</span><span>20 (thorough)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button id="start-interview-btn" className="btn-primary" onClick={handleStart} disabled={startMutation.isPending} style={{ fontSize: '1.05rem', padding: '14px 36px' }}>
          {startMutation.isPending
            ? <><div className="spinner" style={{ width: 20, height: 20 }} /> Generating questions...</>
            : <><Play size={18} /> Start Interview <ChevronRight size={18} /></>}
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {questionCount} questions · {selectedMode} mode{role ? ` · ${role}` : ''}{company ? ` @ ${company}` : ''}
        </p>
      </div>
    </Layout>
  );
}
