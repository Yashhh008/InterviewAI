import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { User, Mail, GraduationCap, Code, Lock, Save, Plus, X } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    education: {
      college: user?.education?.college || '',
      degree: user?.education?.degree || '',
      graduationYear: user?.education?.graduationYear || '',
    },
    skills: user?.skills || [],
  });

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passErrors, setPassErrors] = useState({});

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const errs = {};
    if (!passForm.currentPassword) errs.currentPassword = 'Required';
    if (!passForm.newPassword || passForm.newPassword.length < 8) errs.newPassword = 'Min 8 chars';
    if (passForm.newPassword !== passForm.confirm) errs.confirm = 'Passwords do not match';
    setPassErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account information and preferences.</p>
      </div>

      {/* Avatar */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>{user?.email}</p>
          <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-blue'}`} style={{ marginTop: 8 }}>{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {['profile', 'password'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: tab === t ? 'var(--accent-blue)' : 'transparent',
            color: tab === t ? 'white' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s', textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 24 }}>Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div>
              <label className="label"><User size={14} style={{ display: 'inline', marginRight: 6 }} />Full Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label"><Mail size={14} style={{ display: 'inline', marginRight: 6 }} />Email</label>
              <input className="input-field" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div>
              <label className="label"><GraduationCap size={14} style={{ display: 'inline', marginRight: 6 }} />College/University</label>
              <input className="input-field" value={form.education.college} placeholder="Your college" onChange={e => setForm({ ...form, education: { ...form.education, college: e.target.value } })} />
            </div>
            <div>
              <label className="label">Degree</label>
              <input className="input-field" value={form.education.degree} placeholder="e.g. BTech CSE" onChange={e => setForm({ ...form, education: { ...form.education, degree: e.target.value } })} />
            </div>
            <div>
              <label className="label">Graduation Year</label>
              <input className="input-field" value={form.education.graduationYear} placeholder="e.g. 2025" onChange={e => setForm({ ...form, education: { ...form.education, graduationYear: e.target.value } })} />
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginBottom: 24 }}>
            <label className="label"><Code size={14} style={{ display: 'inline', marginRight: 6 }} />Skills</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input className="input-field" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill..." onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ maxWidth: 280 }} />
              <button className="btn-primary" onClick={addSkill} style={{ padding: '10px 16px' }}><Plus size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.skills.map(skill => (
                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: '0.8rem' }}>
                  {skill}
                  <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button id="save-profile-btn" className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <><Save size={16} /> Save Profile</>}
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 28, maxWidth: 480 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 24 }}>Change Password</h2>
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: 'Current password' },
            { key: 'newPassword', label: 'New Password', placeholder: 'New password (min 8 chars)' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label className="label"><Lock size={14} style={{ display: 'inline', marginRight: 6 }} />{label}</label>
              <input type="password" className={`input-field ${passErrors[key] ? 'error' : ''}`} placeholder={placeholder}
                value={passForm[key]} onChange={e => setPassForm({ ...passForm, [key]: e.target.value })} />
              {passErrors[key] && <p style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: 4 }}>{passErrors[key]}</p>}
            </div>
          ))}
          <button id="change-password-btn" className="btn-primary" onClick={handleChangePassword} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <><Lock size={16} /> Change Password</>}
          </button>
        </div>
      )}
    </Layout>
  );
}
