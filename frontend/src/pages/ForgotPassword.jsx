import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Mail, CheckCircle, ArrowLeft, Zap } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email.');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true); // Always show success to prevent email enumeration
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <div className="bg-blob" style={{ width: 400, height: 400, background: '#6366f1', top: -100, left: -100 }} />
      <div className="fade-in" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>InterviewAI</span>
          </Link>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 36, textAlign: 'center' }}>
          {sent ? (
            <>
              <CheckCircle size={48} color="var(--accent-green)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ marginBottom: 12 }}>Check your email</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                If an account with <strong>{email}</strong> exists, we've sent a password reset link.
              </p>
              <Link to="/login" className="btn-secondary" style={{ justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </>
          ) : (
            <>
              <Mail size={48} color="var(--accent-blue)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ marginBottom: 8 }}>Forgot Password?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit}>
                <input id="forgot-email" type="email" className="input-field" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 16, textAlign: 'left' }} />
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" style={{ display: 'block', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
