import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewAPI } from '../api';
import toast from 'react-hot-toast';
import { Clock, Send, SkipForward, ChevronRight, CheckCircle, X, Award, Brain, AlertTriangle } from 'lucide-react';

function CategoryBadge({ category }) {
  const map = {
    technical: 'cat-technical', dsa: 'cat-dsa', sql: 'cat-sql', hr: 'cat-hr',
    behavioral: 'cat-behavioral', system_design: 'cat-system_design', oop: 'cat-oop',
    os: 'cat-os', cn: 'cat-cn', dbms: 'cat-dbms',
  };
  return (
    <span className={`badge ${map[category] || 'cat-technical'}`} style={{ padding: '4px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600 }}>
      {category?.toUpperCase().replace('_', ' ')}
    </span>
  );
}

function Timer({ mode, startTime }) {
  const [elapsed, setElapsed] = useState(0);
  const LIMIT = 30 * 60; // 30 minutes for timed mode

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const remaining = LIMIT - elapsed;
  const isWarning = mode === 'timed' && remaining < 300;
  const display = mode === 'timed' ? remaining : elapsed;
  const min = Math.floor(Math.abs(display) / 60);
  const sec = Math.abs(display) % 60;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10,
      background: isWarning ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${isWarning ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
      color: isWarning ? 'var(--accent-red)' : 'var(--text-secondary)'
    }}>
      <Clock size={16} />
      <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
        {mode === 'timed' && remaining < 0 ? '-' : ''}{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const textareaRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewAPI.getOne(id).then(r => r.data),
  });

  const interview = data?.interview;
  const questions = data?.questions || [];
  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setShowFeedback(false);
    textareaRef.current?.focus();
  }, [currentIdx]);

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error('Please write an answer before submitting.');
    setEvaluating(true);
    try {
      const res = await interviewAPI.submitAnswer(id, { questionId: currentQ._id, answer });
      setFeedback(res.data.feedback);
      setShowFeedback(true);
      queryClient.invalidateQueries(['interview', id]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSkip = async () => {
    await interviewAPI.skip(id, { questionId: currentQ._id });
    toast('Question skipped', { icon: '⏭️' });
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await interviewAPI.complete(id);
      toast.success('Interview completed! Generating report... 🎉');
      navigate(`/interview/${id}/report`);
    } catch {
      toast.error('Failed to complete interview.');
      setCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (!interview || interview.status === 'completed') {
    navigate(`/interview/${id}/report`);
    return null;
  }

  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px' }}>
      <div className="bg-blob" style={{ width: 400, height: 400, background: '#6366f1', top: -150, right: -150 }} />

      <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', margin: 0 }}>
              {interview.role || 'Interview'} {interview.company ? `@ ${interview.company}` : ''}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
              Question {currentIdx + 1} of {questions.length}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Timer mode={interview.mode} startTime={interview.startedAt} />
            <button className="btn-danger" onClick={handleComplete} style={{ padding: '8px 14px', fontSize: '0.875rem' }}>
              <X size={14} /> End Interview
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar" style={{ marginBottom: 28 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <div className="glass-card" style={{ padding: 32, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <CategoryBadge category={currentQ?.category} />
            <span style={{
              padding: '3px 10px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
              background: currentQ?.difficulty === 'Easy' ? 'rgba(16,185,129,0.12)' : currentQ?.difficulty === 'Hard' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
              color: currentQ?.difficulty === 'Easy' ? '#34d399' : currentQ?.difficulty === 'Hard' ? '#f87171' : '#fbbf24',
            }}>{currentQ?.difficulty}</span>
          </div>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text-primary)', fontWeight: 500 }}>{currentQ?.question}</p>
        </div>

        {/* Answer Box */}
        {!showFeedback ? (
          <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <label className="label" style={{ marginBottom: 10 }}>Your Answer</label>
            <textarea
              ref={textareaRef}
              id="answer-textarea"
              className="input-field"
              rows={8}
              placeholder="Type your answer here. Be clear and comprehensive..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              style={{ resize: 'vertical', lineHeight: 1.8, fontSize: '0.95rem' }}
              disabled={evaluating}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <button id="submit-answer-btn" className="btn-primary" onClick={handleSubmit} disabled={evaluating || !answer.trim()}>
                {evaluating ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Evaluating...</> : <><Send size={16} /> Submit Answer</>}
              </button>
              <button id="skip-btn" className="btn-secondary" onClick={handleSkip} disabled={evaluating}>
                <SkipForward size={16} /> Skip
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{answer.length} chars</span>
            </div>
          </div>
        ) : (
          /* Feedback Panel */
          <div className="glass-card fade-in" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={20} color="var(--accent-purple)" /> AI Feedback
              </h3>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: 'white'
              }}>
                {feedback?.score}/10
              </div>
            </div>

            {/* Score Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Accuracy', val: feedback?.accuracy },
                { label: 'Communication', val: feedback?.communication },
                { label: 'Completeness', val: feedback?.completeness },
                { label: 'Relevance', val: feedback?.relevance },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: val >= 7 ? 'var(--accent-green)' : val >= 5 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>{val}/10</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {feedback?.strengths?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} /> Strengths
                  </div>
                  {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</p>)}
                </div>
              )}
              {feedback?.weaknesses?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-red)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} /> Weaknesses
                  </div>
                  {feedback.weaknesses.map((w, i) => <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>• {w}</p>)}
                </div>
              )}
            </div>

            {/* Improved Answer */}
            {feedback?.improvedAnswer && (
              <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: 8 }}>💡 Improved Answer</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{feedback.improvedAnswer}</p>
              </div>
            )}

            {/* Key Concepts Missed */}
            {feedback?.keyConceptsMissed?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Key Concepts Missed</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {feedback.keyConceptsMissed.map(c => <span key={c} className="badge badge-red">{c}</span>)}
                </div>
              </div>
            )}

            <button id="next-question-btn" className="btn-primary" onClick={handleNext} disabled={completing}>
              {completing ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Generating report...</>
                : isLastQuestion ? <><Award size={16} /> Complete Interview</> : <>Next Question <ChevronRight size={16} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
