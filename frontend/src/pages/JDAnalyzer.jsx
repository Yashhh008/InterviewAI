import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jdAPI } from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Briefcase, FileText, Trash2, ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';

function JDCard({ jd, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{jd.role || 'Unknown Role'}</h3>
            {jd.company && <span className="badge badge-blue">{jd.company}</span>}
            <span className={`badge ${jd.experienceLevel === 'Intern' ? 'badge-green' : jd.experienceLevel === 'Senior' ? 'badge-red' : 'badge-orange'}`}>
              {jd.experienceLevel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Clock size={12} /> Analyzed {new Date(jd.analyzedAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => setExpanded(!expanded)} style={{ padding: '6px 10px' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button className="btn-danger" style={{ padding: '6px 10px' }} onClick={() => onDelete(jd._id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="fade-in" style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {jd.requiredSkills?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {jd.requiredSkills.map(s => <span key={s} className="badge badge-purple">{s}</span>)}
              </div>
            </div>
          )}
          {jd.preferredSkills?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {jd.preferredSkills.map(s => <span key={s} className="badge badge-cyan">{s}</span>)}
              </div>
            </div>
          )}
          {jd.interviewTopics?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interview Topics</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {jd.interviewTopics.map(t => <span key={t} className="badge badge-orange">{t}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JDAnalyzer() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('text');
  const [text, setText] = useState('');
  const [company, setCompany] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const { data: jds, isLoading } = useQuery({
    queryKey: ['jds'],
    queryFn: () => jdAPI.getAll().then(r => r.data.jds),
  });

  const deleteMutation = useMutation({
    mutationFn: jdAPI.delete,
    onSuccess: () => { queryClient.invalidateQueries(['jds']); toast.success('JD deleted.'); },
    onError: () => toast.error('Failed to delete.'),
  });

  const handleAnalyze = async () => {
    if (!text.trim()) return toast.error('Please paste a job description.');
    setAnalyzing(true);
    try {
      await jdAPI.analyze({ text, company });
      queryClient.invalidateQueries(['jds']);
      toast.success('Job description analyzed! 🎯');
      setText(''); setCompany('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">JD Analyzer</h1>
        <p className="page-subtitle">Paste or upload a job description and extract role, skills, and interview topics.</p>
      </div>

      {/* Input Card */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['text', 'file'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--accent-blue)' : 'transparent',
              color: tab === t ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}>
              {t === 'text' ? <><FileText size={14} style={{ display: 'inline', marginRight: 6 }} />Paste Text</> : <><Briefcase size={14} style={{ display: 'inline', marginRight: 6 }} />Upload PDF</>}
            </button>
          ))}
        </div>

        {tab === 'text' ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Company Name (Optional)</label>
              <input className="input-field" placeholder="e.g. Google, Amazon" value={company} onChange={e => setCompany(e.target.value)} style={{ maxWidth: 320 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Job Description</label>
              <textarea
                className="input-field"
                rows={10}
                placeholder="Paste the full job description here..."
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ resize: 'vertical', lineHeight: 1.7 }}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{text.length} characters</div>
            </div>
            <button id="analyze-jd-btn" className="btn-primary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Sparkles size={16} /> Analyze JD</>}
            </button>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
            <Briefcase size={40} style={{ marginBottom: 12 }} />
            <p>PDF upload for JD coming soon.</p>
            <p style={{ fontSize: '0.875rem' }}>Please use the "Paste Text" tab for now.</p>
          </div>
        )}
      </div>

      {/* Past JDs */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Analyzed Job Descriptions</h2>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2].map(i => <div key={i} className="shimmer glass-card" style={{ height: 100 }} />)}
        </div>
      ) : jds?.length > 0 ? (
        jds.map(jd => <JDCard key={jd._id} jd={jd} onDelete={id => deleteMutation.mutate(id)} />)
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <Briefcase size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No job descriptions analyzed yet. Paste one above to get started!</p>
        </div>
      )}
    </Layout>
  );
}
