import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiMessage, SubmitButton } from '../components/Shared';

const destination = (role) => role === 'student' ? '/student/dashboard' : role === 'instructor' ? '/instructor/dashboard' : role === 'admin' ? '/admin/overview' : role === 'parent' ? '/parent/dashboard' : '/';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setFieldErrors({});
    try { const result = await login(form); navigate(destination(result.user?.role)); }
    catch (err) { setError(apiMessage(err, 'We could not sign you in. Check your details and try again.')); setFieldErrors(err.response?.data?.errors || {}); }
    finally { setLoading(false); }
  };
  return <div className="auth-page"><aside className="auth-aside"><Link to="/" className="role-brand" style={{ padding: 0 }}><span className="brand-mark">C</span> CoursePilot</Link><div style={{ position: 'relative', zIndex: 1, maxWidth: 440, marginTop: 'clamp(52px, 14vh, 145px)' }}><div className="eyebrow" style={{ color: 'var(--sun)' }}>Back to your practice</div><h1 className="font-display" style={{ fontSize: 'clamp(2.3rem,5vw,4.5rem)', lineHeight: 1, letterSpacing: '-.07em', margin: '13px 0 18px' }}>Pick up where your curiosity left off.</h1><p style={{ color: '#b9ccca', lineHeight: 1.65 }}>Your courses, live sessions, and next small win are waiting in one focused place.</p></div><div style={{ position: 'absolute', zIndex: 1, left: 'clamp(30px,7vw,90px)', bottom: 35, color: '#9db6b6', fontSize: '.83rem' }}><ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Your learning data stays yours</div></aside><main className="auth-form-side"><div className="auth-card animate-rise"><Link to="/" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.84rem', marginBottom: 34 }}><ArrowLeft size={15} /> CoursePilot home</Link><div className="eyebrow">Welcome back</div><h2 className="font-display" style={{ fontSize: '2.25rem', letterSpacing: '-.05em', margin: '8px 0 8px' }}>Sign in to learn.</h2><p className="muted" style={{ marginBottom: 25 }}>Use the email connected to your CoursePilot account.</p>{error && <div className="notice notice-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}<form onSubmit={submit} style={{ display: 'grid', gap: 17 }}><div><label htmlFor="email" className="label">Email address</label><input id="email" className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />{fieldErrors.email && <div className="error-text">{fieldErrors.email[0]}</div>}</div><div><label htmlFor="password" className="label">Password</label><div style={{ position: 'relative' }}><KeyRound size={17} className="muted" style={{ position: 'absolute', left: 13, top: 13 }} /><input id="password" className="input" style={{ paddingLeft: 40 }} type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /></div>{fieldErrors.password && <div className="error-text">{fieldErrors.password[0]}</div>}</div><SubmitButton loading={loading} type="submit">Sign in <ArrowRight size={17} /></SubmitButton></form><p className="muted" style={{ marginTop: 25, textAlign: 'center', fontSize: '.9rem' }}>New to CoursePilot? <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 700 }}>Create an account</Link></p></div></main></div>;
}