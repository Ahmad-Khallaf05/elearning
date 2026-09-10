import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Compass, PlayCircle, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../services/axios';
import { asArray, ErrorState, formatMoney, LoadingState } from '../components/Shared';

const fallbackCourses = [];

export default function Home() {
  const [courses, setCourses] = useState(fallbackCourses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadCourses = async () => {
    setLoading(true);
    try { const response = await axios.get('/api/courses'); setCourses(asArray(response.data).slice(0, 3)); setError(''); }
    catch { setError('Course highlights are taking a moment to load. The catalog is still ready when you are.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadCourses(); }, []);
  return (
    <div className="app-shell">
      <header className="page-wrap landing-nav">
        <Link to="/" className="role-brand" style={{ padding: 0, color: 'var(--navy)' }}><span className="brand-mark">C</span> CoursePilot</Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/catalog" className="btn btn-secondary btn-sm">Explore courses</Link>
          <Link to="/login" className="btn btn-primary btn-sm">Sign in <ArrowRight size={15} /></Link>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="hero-orb" />
          <div className="page-wrap hero-grid">
            <div className="animate-rise">
              <div className="eyebrow">A clearer way to learn</div>
              <h1 className="hero-title">Make progress you can <em>feel.</em></h1>
              <p className="hero-copy">CoursePilot brings practical courses, focused lessons, and live teaching into one calm workspace—so learning stays visible, useful, and yours.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11, marginTop: 28 }}>
                <Link to="/register" className="btn btn-primary">Start learning <ArrowRight size={17} /></Link>
                <Link to="/catalog" className="btn btn-secondary">Browse the catalog</Link>
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 28, color: 'var(--muted)', fontSize: '.85rem' }}>
                <span><CheckCircle2 size={16} style={{ verticalAlign: 'middle', color: 'var(--teal)' }} /> Practical by design</span>
                <span><CheckCircle2 size={16} style={{ verticalAlign: 'middle', color: 'var(--teal)' }} /> Live when it matters</span>
              </div>
            </div>
            <div className="hero-visual surface animate-rise" style={{ position: 'relative', overflow: 'hidden', padding: 23, background: 'var(--navy)', color: '#fff', animationDelay: '.08s' }}>
              <div className="eyebrow" style={{ color: 'var(--sun)' }}>Your learning desk</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', margin: '24px 0 20px' }}>
                <div><div style={{ color: '#abc2c1', fontSize: '.82rem' }}>Current focus</div><h2 className="font-display" style={{ margin: '5px 0 0', fontSize: '1.8rem' }}>Build with intention</h2></div>
                <div style={{ color: 'var(--sun)', fontSize: '2.3rem', fontFamily: 'Space Grotesk' }}>72%</div>
              </div>
              <div className="progress-track" style={{ background: 'rgba(255,255,255,.14)' }}><div className="progress-fill" style={{ width: '72%', background: 'var(--sun)' }} /></div>
              <div style={{ display: 'grid', gap: 10, marginTop: 25 }}>
                {['The brief: find the signal', 'Live critique · Thursday', 'Ship your first iteration'].map((item, index) => <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px', borderRadius: 12, background: index === 0 ? 'rgba(223,241,232,.16)' : 'rgba(255,255,255,.07)' }}><span style={{ color: index === 0 ? 'var(--sun)' : '#9bb3b3' }}>{index === 0 ? <PlayCircle size={18} /> : <Clock3 size={18} />}</span><span style={{ fontSize: '.88rem' }}>{item}</span></div>)}
              </div>
            </div>
          </div>
        </section>
        <section className="landing-section" style={{ background: '#edf4ef' }}>
          <div className="page-wrap">
            <div style={{ maxWidth: 610, marginBottom: 28 }}><div className="eyebrow">One focused loop</div><h2 className="font-display" style={{ margin: '10px 0', fontSize: 'clamp(2rem,4vw,3.4rem)', letterSpacing: '-.05em' }}>Learn. Practice. Return.</h2><p className="muted" style={{ lineHeight: 1.6 }}>The best learning systems reduce friction. CoursePilot keeps the next step close, tracks the work that matters, and makes it easy to ask a real instructor.</p></div>
            <div className="feature-grid">
              <div className="feature-card"><Compass size={26} style={{ color: 'var(--sun)' }} /><h3 className="font-display" style={{ fontSize: '1.5rem', margin: '25px 0 8px' }}>Find work worth doing</h3><p style={{ color: '#b9ccca', lineHeight: 1.55 }}>Browse practical courses built around outcomes, not just hours of content.</p></div>
              <div className="feature-card"><BookOpen size={25} style={{ color: 'var(--teal)' }} /><h3 className="font-display" style={{ margin: '23px 0 8px' }}>Keep your place</h3><p className="muted" style={{ lineHeight: 1.55 }}>Your enrollments, completions, and next lesson stay in one clear view.</p></div>
              <div className="feature-card"><Users size={25} style={{ color: 'var(--coral)' }} /><h3 className="font-display" style={{ margin: '23px 0 8px' }}>Learn with people</h3><p className="muted" style={{ lineHeight: 1.55 }}>Show up for live sessions and learn from instructors who ship the work.</p></div>
            </div>
          </div>
        </section>
        <section className="landing-section">
          <div className="page-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 15, marginBottom: 24, flexWrap: 'wrap' }}><div><div className="eyebrow">From the catalog</div><h2 className="font-display" style={{ margin: '9px 0 0', fontSize: '2rem', letterSpacing: '-.04em' }}>Start somewhere useful.</h2></div><Link to="/catalog" className="btn btn-secondary btn-sm">See all courses <ArrowRight size={15} /></Link></div>
            {error && <ErrorState message={error} onRetry={loadCourses} />}
            {loading ? <LoadingState label="Finding the latest courses..." /> : courses.length === 0 ? <div className="surface" style={{ padding: 28, color: 'var(--muted)' }}>New courses are being prepared. Check the catalog soon.</div> : <div className="course-grid">{courses.map(course => <Link to={`/student/courses/${course.id}`} key={course.id} className="course-card"><div className="course-cover">{course.thumbnail_url ? <img src={course.thumbnail_url} alt="" /> : <div className="cover-fallback"><BookOpen size={34} /></div>}</div><div className="course-body"><h3 className="course-title">{course.title || 'Untitled course'}</h3><p className="muted" style={{ margin: '9px 0 16px', fontSize: '.87rem' }}>{course.instructor?.name || 'CoursePilot instructor'}</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '.84rem' }}><span className="eyebrow" style={{ letterSpacing: '.08em' }}>{course.category || 'Practical skill'}</span><strong>{formatMoney(course.price)}</strong></div></div></Link>)}</div>}
          </div>
        </section>
        <section className="landing-section" style={{ paddingTop: 20 }}>
          <div className="page-wrap surface" style={{ padding: '30px 32px', display: 'flex', gap: 22, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: 'var(--mint)' }}><div><div className="eyebrow">For instructors and teams</div><h2 className="font-display" style={{ margin: '8px 0 0', fontSize: '1.7rem' }}>Good teaching deserves a good workspace.</h2></div><Link to="/register" className="btn btn-primary">Create your account <ArrowRight size={16} /></Link></div>
        </section>
      </main>
      <footer className="footer"><div className="page-wrap" style={{ display: 'flex', justifyContent: 'space-between', gap: 15, flexWrap: 'wrap', color: 'var(--muted)', fontSize: '.85rem' }}><span>© {new Date().getFullYear()} CoursePilot</span><span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><ShieldCheck size={15} /> Built for focused learning</span></div></footer>
    </div>
  );
}