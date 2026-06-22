import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { atsAPI, resumeAPI, jdAPI } from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Brain, Sparkles, BookOpen, Calendar, XCircle, ChevronRight } from 'lucide-react';

export default function SkillGap() {
  const [selectedJD, setSelectedJD] = useState('');
  const [report, setReport] = useState(null);

  const { data: resume } = useQuery({ queryKey: ['resume'], queryFn: () => resumeAPI.get().then(r => r.data.resume), retry: false });
  const { data: jdsData } = useQuery({ queryKey: ['jds'], queryFn: () => jdAPI.getAll().then(r => r.data.jds) });

  const mutation = useMutation({
    mutationFn: atsAPI.match,
    onSuccess: (res) => { setReport(res.data.report); toast.success('Skill gap analyzed!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Analysis failed.'),
  });

  const handleAnalyze = () => {
    if (!resume) return toast.error('Upload your resume first.');
    if (!selectedJD) return toast.error('Select a job description.');
    mutation.mutate({ resumeId: resume._id, jdId: selectedJD });
  };

  const skillGap = report?.skillGap;
  const jds = jdsData || [];

  const weekColors = ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-orange)', '#f472b6', '#22d3ee', '#fbbf24'];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Skill Gap Analyzer</h1>
        <p className="page-subtitle">Find missing skills and get a personalized learning roadmap.</p>
      </div>

      {/* Config */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Job Description</label>
            <select id="skill-gap-jd" className="input-field" value={selectedJD} onChange={e => setSelectedJD(e.target.value)}>
              <option value="">Select a JD...</option>
              {jds.map(jd => <option key={jd._id} value={jd._id}>{jd.role} {jd.company ? `@ ${jd.company}` : ''}</option>)}
            </select>
          </div>
          <button id="analyze-skill-gap-btn" className="btn-primary" onClick={handleAnalyze} disabled={mutation.isPending}>
            {mutation.isPending ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Sparkles size={16} /> Analyze Skill Gap</>}
          </button>
        </div>
        {!resume && <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--accent-orange)' }}>⚠️ No resume found. <a href="/resume" style={{ color: 'var(--accent-blue)' }}>Upload one →</a></p>}
        {jds.length === 0 && <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--accent-orange)' }}>⚠️ No JDs found. <a href="/jd" style={{ color: 'var(--accent-blue)' }}>Analyze a JD first →</a></p>}
      </div>

      {/* Results */}
      {skillGap && (
        <div className="fade-in">
          {/* Missing Skills */}
          {skillGap.missingSkills?.length > 0 && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={16} color="var(--accent-red)" /> Missing Skills ({skillGap.missingSkills.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skillGap.missingSkills.map(skill => (
                  <span key={skill} className="badge badge-red" style={{ fontSize: '0.85rem', padding: '5px 14px' }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {skillGap.roadmap?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} color="var(--accent-purple)" /> Learning Roadmap
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {skillGap.roadmap.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: 32, position: 'relative' }}>
                    {/* Timeline line */}
                    {i < skillGap.roadmap.length - 1 && (
                      <div style={{ position: 'absolute', left: 22, top: 48, bottom: 0, width: 2, background: 'var(--border)' }} />
                    )}
                    {/* Week number */}
                    <div style={{ flexShrink: 0 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: `${weekColors[i % weekColors.length]}20`,
                        border: `2px solid ${weekColors[i % weekColors.length]}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.9rem',
                        color: weekColors[i % weekColors.length]
                      }}>
                        W{item.week}
                      </div>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, padding: '8px 0' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: weekColors[i % weekColors.length] }}>
                        {item.topic}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 12 }}>{item.description}</p>
                      {item.resources?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {item.resources.map(r => (
                            <span key={r} style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                              📚 {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!skillGap && !mutation.isPending && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <Brain size={56} style={{ marginBottom: 16, opacity: 0.2 }} />
          <h3 style={{ marginBottom: 8 }}>Identify Your Skill Gaps</h3>
          <p>Select your resume and a job description to see what skills you're missing and get a personalized roadmap.</p>
        </div>
      )}
    </Layout>
  );
}
