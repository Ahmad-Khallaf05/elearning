import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, PlayCircle, Users, Copy, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../../services/axios';
import { apiMessage, asArray, EmptyState, ErrorState, LoadingState } from '../../components/Shared';

export default function StudentDashboard() {
  const location = useLocation(); 
  const [enrollments, setEnrollments] = useState([]); 
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  
  const [invitationToken, setInvitationToken] = useState('');
  const [copied, setCopied] = useState(false);

  const load = async () => { 
    setLoading(true); 
    try { 
      const [enrollmentsRes, parentsRes] = await Promise.all([
        axios.get('/api/student/enrollments'),
        axios.get('/api/student/parents')
      ]);
      setEnrollments(asArray(enrollmentsRes.data)); 
      setParents(parentsRes.data?.data || []);
      setError(''); 
    } catch (err) { 
      setError(apiMessage(err, 'We could not load your learning progress.')); 
    } finally { 
      setLoading(false); 
    } 
  };

  useEffect(() => { load(); }, []);

  const generateToken = async () => {
    try {
      const res = await axios.post('/api/student/parent-invitations');
      setInvitationToken(res.data.token);
      setCopied(false);
    } catch (err) {
      alert(apiMessage(err, 'Failed to generate token'));
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(invitationToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const approveParent = async (parentId) => {
    try {
      await axios.post(`/api/student/parents/${parentId}/approve`);
      setParents(prev => prev.map(p => p.id === parentId ? { ...p, status: 'approved' } : p));
    } catch (err) {
      alert(apiMessage(err, 'Failed to approve parent'));
    }
  };

  if (loading) return <LoadingState label="Loading your learning desk..." />;
  return (
    <div className="animate-rise" style={{ maxWidth: 1180, margin: '0 auto' }}>
      {location.state?.successMessage && (
        <div className="notice notice-success" style={{ marginBottom: 17 }}>
          <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 7 }} /> {location.state.successMessage}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 15, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Student workspace</div>
          <h1 className="font-display" style={{ margin: '8px 0 7px', fontSize: 'clamp(2rem,4vw,3.2rem)', letterSpacing: '-.06em' }}>Your next lesson is close.</h1>
          <p className="muted">A small, focused step is still a step forward.</p>
        </div>
        <Link to="/student/catalog" className="btn btn-primary">Find a course <ArrowRight size={16} /></Link>
      </div>
      
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <>
          {enrollments.length === 0 ? (
            <EmptyState title="Your desk is ready." description="You have no enrollments yet. Browse the catalog and choose a practical next step." action={<Link to="/student/catalog" className="btn btn-primary">Browse courses <ArrowRight size={16} /></Link>} />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <div className="stat-card" style={{ minWidth: 180 }}>
                  <BookOpen size={19} style={{ color: 'var(--teal)' }} />
                  <div className="muted" style={{ fontSize: '.8rem', marginTop: 12 }}>Courses in progress</div>
                  <strong className="font-display" style={{ fontSize: '1.8rem' }}>{enrollments.length}</strong>
                </div>
                <div className="stat-card" style={{ minWidth: 180 }}>
                  <CheckCircle2 size={19} style={{ color: 'var(--coral)' }} />
                  <div className="muted" style={{ fontSize: '.8rem', marginTop: 12 }}>Lessons completed</div>
                  <strong className="font-display" style={{ fontSize: '1.8rem' }}>{enrollments.reduce((sum, enrollment) => sum + (enrollment.completed_lesson_ids?.length || enrollment.completed_lessons_count || 0), 0)}</strong>
                </div>
              </div>
              
              <div className="course-grid">
                {enrollments.map(enrollment => { 
                  const course = enrollment.course || enrollment; 
                  const progress = Math.max(0, Math.min(100, Number(enrollment.progress_percentage ?? course.progress_percentage ?? 0))); 
                  return (
                    <article className="course-card" key={course.id}>
                      <div className="course-cover">
                        {course.thumbnail_url ? <img src={course.thumbnail_url} alt="" /> : <div className="cover-fallback"><BookOpen size={34} /></div>}
                        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 12px 8px', background: 'linear-gradient(transparent, rgba(23,48,66,.7))' }}>
                          <div className="progress-track" style={{ background: 'rgba(255,255,255,.35)' }}>
                            <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--sun)' }} />
                          </div>
                        </div>
                      </div>
                      <div className="course-body">
                        <h2 className="course-title">{course.title || 'Untitled course'}</h2>
                        <p className="muted" style={{ fontSize: '.84rem', margin: '8px 0 18px' }}>{progress}% complete</p>
                        <Link to={`/student/learn/${course.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}><PlayCircle size={16} /> Continue learning <ArrowRight size={15} /></Link>
                      </div>
                    </article>
                  ); 
                })}
              </div>
            </>
          )}

          {/* Parent Linking Section */}
          <div className="surface" style={{ padding: 24, marginTop: 40 }}>
            <h2 className="font-display" style={{ margin: '0 0 16px', fontSize: '1.6rem' }}><Users size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--teal)' }}/>Family & Parent Link</h2>
            <p className="muted" style={{ marginBottom: 20 }}>Share your progress with a parent or guardian. Generate a token below and send it to them.</p>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              <button type="button" onClick={generateToken} className="btn btn-secondary btn-sm">Generate Invitation Token</button>
              {invitationToken && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--mint)', padding: '6px 12px', borderRadius: 8, color: 'var(--teal)', fontWeight: 700 }}>
                  <code style={{ fontSize: '1.1rem' }}>{invitationToken}</code>
                  <button type="button" onClick={copyToken} className="icon-btn" style={{ color: 'var(--teal)' }} title="Copy Token">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>

            {parents.length > 0 && (
              <div>
                <h3 style={{ fontSize: '.9rem', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>Linked Parents</h3>
                <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                  {parents.map(parent => (
                    <div key={parent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', border: '1px solid var(--line)', borderRadius: 8 }}>
                      <div>
                        <strong style={{ display: 'block' }}>{parent.name}</strong>
                        <span className="muted" style={{ fontSize: '.85rem' }}>{parent.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="eyebrow" style={{ color: parent.status === 'approved' ? 'var(--teal)' : 'var(--sun)' }}>{parent.status}</span>
                        {parent.status === 'pending' && (
                          <button type="button" onClick={() => approveParent(parent.id)} className="btn btn-sm" style={{ background: 'var(--teal)', color: '#fff', border: 0 }}>Approve</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}