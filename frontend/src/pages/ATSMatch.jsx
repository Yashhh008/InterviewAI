import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { atsAPI, resumeAPI, jdAPI } from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Target, CheckCircle, XCircle, Lightbulb, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

function ScoreGauge({ score }) {
  const color = score >= 75 ? 'var(--accent-green)' : score >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)';
  const label = score >= 75 ? 'Excellent Match' : score >= 50 ? 'Good Match' : score < 40 ? 'Poor Match' : 'Moderate Match';

  return (
    <div style={{ textAlign: 'center', padding: 32 }}>
      <div style={{
        width: 160, height: 160, borderRadius: '50%', margin: '0 auto 16px',
        background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
      }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit', color }}>{score}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', color, marginBottom: 4 }}>{label}</div>
    </div>
  );
}

export default function ATSMatch() {
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJD, setSelectedJD] = useState('');
  const [report, setReport] = useState(null);

  const { data: resume } = useQuery({ queryKey: ['resume'], queryFn: () => resumeAPI.get().then(r => r.data.resume), retry: false });
  const { data: jdsData } = useQuery({ queryKey: ['jds'], queryFn: () => jdAPI.getAll().then(r => r.data.jds) });

  const matchMutation = useMutation({
    mutationFn: atsAPI.match,
    onSuccess: (res) => { setReport(res.data.report); toast.success('ATS analysis complete! 🎯'); },
    onError: (err) => toast.error(err.response?.data?.message || 'ATS analysis failed.'),
  });

  const handleMatch = () => {
    if (!resume) return toast.error('Please upload your resume first.');
    if (!selectedJD) return toast.error('Please select a job description.');
    matchMutation.mutate({ resumeId: resume._id, jdId: selectedJD });
  };

  const jds = jdsData || [];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">ATS Match</h1>
        <p className="page-subtitle">Compare your resume against a job description and get your match score.</p>
      </div>

      {/* Config Card */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Select Resume & Job Description</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label className="label">Resume</label>
            {resume ? (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={16} color="var(--accent-green)" />
                <span style={{ fontSize: '0.875rem' }}>{resume.originalFilename}</span>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <XCircle size={16} color="var(--accent-red)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No resume uploaded</span>
              </div>
            )}
          </div>
          <div>
            <label className="label">Job Description</label>
            <select
              id="ats-jd-select"
              className="input-field"
              value={selectedJD}
              onChange={e => setSelectedJD(e.target.value)}
            >
              <option value="">Select a JD...</option>
              {jds.map(jd => (
                <option key={jd._id} value={jd._id}>{jd.role} {jd.company ? `@ ${jd.company}` : ''}</option>
              ))}
            </select>
          </div>
        </div>
        <button id="run-ats-btn" className="btn-primary" onClick={handleMatch} disabled={matchMutation.isPending || !resume}>
          {matchMutation.isPending ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Sparkles size={16} /> Run ATS Analysis</>}
        </button>
      </div>

      {/* Report */}
      {report && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, marginBottom: 24 }}>
            {/* Score Gauge */}
            <div className="glass-card">
              <ScoreGauge score={report.atsScore} />
              <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{report.matchingSkills?.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matched</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-red)' }}>{report.missingSkills?.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Missing</div>
                </div>
              </div>
            </div>

            {/* Skills breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-card" style={{ padding: 24, flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} color="var(--accent-green)" /> Matching Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {report.matchingSkills?.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                </div>
              </div>
              <div className="glass-card" style={{ padding: 24, flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <XCircle size={16} color="var(--accent-red)" /> Missing Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {report.missingSkills?.map(s => <span key={s} className="badge badge-red">{s}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Analysis */}
          {report.keywordAnalysis && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="var(--accent-blue)" /> Keyword Analysis
              </h3>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { label: 'Total Keywords', value: report.keywordAnalysis.totalKeywords, color: 'var(--text-primary)' },
                  { label: 'Matched', value: report.keywordAnalysis.matchedKeywords, color: 'var(--accent-green)' },
                  { label: 'Match %', value: `${report.keywordAnalysis.matchPercentage}%`, color: 'var(--accent-blue)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit', color }}>{value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${report.keywordAnalysis.matchPercentage}%` }} />
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lightbulb size={16} color="var(--accent-orange)" /> Recommendations
              </h3>
              {report.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <ArrowRight size={15} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
