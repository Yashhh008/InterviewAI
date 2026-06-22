import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { companyAPI } from '../api';
import toast from 'react-hot-toast';
import { Building2, Search, Sparkles, Code, Lightbulb, MessageSquare, Star, ChevronDown, ChevronUp } from 'lucide-react';

const popularCompanies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'JPMorgan', 'Goldman Sachs', 'Infosys', 'TCS', 'Wipro', 'Flipkart', 'Zomato'];

function DifficultyBadge({ difficulty }) {
  const map = { Easy: 'badge-green', Medium: 'badge-orange', Hard: 'badge-red', 'Very Hard': 'badge-red' };
  return <span className={`badge ${map[difficulty] || 'badge-blue'}`}>{difficulty}</span>;
}

export default function CompanyIntel() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState(null);
  const [showHR, setShowHR] = useState(false);

  const mutation = useMutation({
    mutationFn: (n) => companyAPI.research(n),
    onSuccess: (res) => { setCompany(res.data.company); toast.success(res.data.fromCache ? 'Loaded from cache!' : 'Company profile generated! 🏢'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Research failed.'),
  });

  const handleSearch = () => {
    if (!name.trim()) return toast.error('Enter a company name.');
    mutation.mutate(name.trim());
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Company Intelligence</h1>
        <p className="page-subtitle">Get AI-generated interview prep profiles for any company.</p>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <label className="label">Company Name</label>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="company-search-input"
              className="input-field"
              style={{ paddingLeft: 42 }}
              placeholder="e.g. Google, JPMorgan, Amazon..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button id="company-search-btn" className="btn-primary" onClick={handleSearch} disabled={mutation.isPending} style={{ whiteSpace: 'nowrap' }}>
            {mutation.isPending ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Researching...</> : <><Sparkles size={16} /> Research</>}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: 4, display: 'flex', alignItems: 'center' }}>Popular:</span>
          {popularCompanies.map(c => (
            <button key={c} onClick={() => { setName(c); mutation.mutate(c); }}
              style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {mutation.isPending && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="shimmer glass-card" style={{ height: 160 }} />)}
        </div>
      )}

      {/* Company Profile */}
      {company && !mutation.isPending && (
        <div className="fade-in">
          {/* Header */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                  {company.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{company.name}</h2>
                  <DifficultyBadge difficulty={company.difficulty} />
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{company.overview}</p>
            {company.businessModel && (
              <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.8, fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Business Model: </strong>{company.businessModel}
              </p>
            )}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
            {/* Tech Stack */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code size={16} color="var(--accent-cyan)" /> Tech Stack
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {company.techStack?.map(t => <span key={t} className="badge badge-cyan">{t}</span>)}
              </div>
            </div>

            {/* Frequent Topics */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={16} color="var(--accent-orange)" /> Frequent Interview Topics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {company.frequentTopics?.map((t, i) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Concepts */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lightbulb size={16} color="var(--accent-purple)" /> Key Concepts to Study
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {company.importantConcepts?.map(c => <span key={c} className="badge badge-purple">{c}</span>)}
              </div>
            </div>

            {/* Interview Pattern */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} color="var(--accent-green)" /> Interview Process
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>{company.interviewPattern}</p>
            </div>
          </div>

          {/* HR Questions */}
          {company.hrQuestions?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <button onClick={() => setShowHR(!showHR)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: 'var(--text-primary)' }}>
                  <MessageSquare size={16} color="var(--accent-blue)" /> Common HR Questions ({company.hrQuestions.length})
                </h3>
                {showHR ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </button>
              {showHR && (
                <div className="fade-in" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {company.hrQuestions.map((q, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {i + 1}. {q}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
