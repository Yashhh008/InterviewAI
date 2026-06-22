import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Upload, FileText, Trash2, Briefcase, GraduationCap, Code, Award, Lightbulb, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

function SkillBadge({ skill }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 20, fontSize: '0.8rem', color: '#818cf8', margin: '3px'
    }}>{skill}</span>
  );
}

export default function ResumeAnalyzer() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume'],
    queryFn: () => resumeAPI.get().then(r => r.data.resume),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: resumeAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['resume']);
      toast.success('Resume deleted.');
    },
    onError: () => toast.error('Failed to delete resume.'),
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await resumeAPI.upload(formData);
      queryClient.invalidateQueries(['resume']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Resume analyzed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Resume Analyzer</h1>
        <p className="page-subtitle">Upload your PDF resume and let AI extract and analyze everything.</p>
      </div>

      {/* Upload Zone */}
      {!resume && !isLoading && (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent-blue)' : 'var(--border)'}`,
            borderRadius: 16, padding: 48, textAlign: 'center', cursor: 'pointer',
            background: isDragActive ? 'rgba(99,102,241,0.06)' : 'var(--bg-card)',
            transition: 'all 0.2s ease', marginBottom: 24,
          }}
        >
          <input {...getInputProps()} id="resume-upload-input" />
          {uploading ? (
            <>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Analyzing your resume with AI...</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 8 }}>This may take 10-15 seconds</p>
            </>
          ) : (
            <>
              <Upload size={48} color={isDragActive ? 'var(--accent-blue)' : 'var(--text-muted)'} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, color: isDragActive ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>or click to browse</p>
              <span style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                PDF only · Max 10MB
              </span>
            </>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer glass-card" style={{ height: 180 }} />
          ))}
        </div>
      )}

      {/* Resume Data */}
      {resume && !isLoading && (
        <div className="fade-in">
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} color="var(--accent-green)" />
              <div>
                <div style={{ fontWeight: 600 }}>{resume.originalFilename}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Analyzed {new Date(resume.parsedAt).toLocaleDateString()} · {resume.extractedSkills?.length} skills found
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button className="btn-ghost" disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={14} /> Re-upload
                </button>
              </div>
              <button className="btn-danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--accent-blue)" /> Professional Summary
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{resume.summary}</p>
            </div>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
            {/* Skills */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code size={18} color="var(--accent-purple)" /> Skills ({resume.extractedSkills?.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {resume.extractedSkills?.map(skill => <SkillBadge key={skill} skill={skill} />)}
              </div>
            </div>

            {/* Education */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={18} color="var(--accent-green)" /> Education
              </h3>
              {resume.education?.map((e, i) => (
                <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < resume.education.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontWeight: 600 }}>{e.degree} {e.field && `in ${e.field}`}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{e.institution}</div>
                  {e.year && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.year}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {resume.projects?.length > 0 && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={18} color="var(--accent-cyan)" /> Projects ({resume.projects.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {resume.projects.map((p, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                    {p.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 10, lineHeight: 1.6 }}>{p.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {p.technologies?.map(t => <span key={t} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(6,182,212,0.1)', color: '#22d3ee', borderRadius: 10 }}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {resume.improvementSuggestions?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lightbulb size={18} color="var(--accent-orange)" /> Improvement Suggestions
              </h3>
              {resume.improvementSuggestions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <AlertTriangle size={15} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
