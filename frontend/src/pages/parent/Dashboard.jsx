import React, { useEffect, useState } from 'react';
import { MessageCircle, GraduationCap, Link2 } from 'lucide-react';
import axios from '../../services/axios';
import { apiMessage, ErrorState, LoadingState, SubmitButton, Toast } from '../../components/Shared';

export default function ParentDashboard() {
  const [children, setChildren] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  
  const [token, setToken] = useState('');
  const [submittingToken, setSubmittingToken] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => { 
    setLoading(true); 
    try { 
      const response = await axios.get('/api/parent/dashboard'); 
      setChildren(response.data?.data || []); 
      setError(''); 
    } catch (err) { 
      setError(apiMessage(err, 'We could not load the children dashboard.')); 
    } finally { 
      setLoading(false); 
    } 
  };

  useEffect(() => { load(); }, []);

  const connectStudent = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    setSubmittingToken(true);
    setNotice('');
    try {
      await axios.post('/api/parent/invitations/accept', { token: token.trim() });
      setNotice('Invitation accepted! The student needs to approve it from their dashboard.');
      setToken('');
    } catch (err) {
      alert(apiMessage(err, 'Failed to connect student. Please check the token.'));
    } finally {
      setSubmittingToken(false);
    }
  };

  if (loading) return <LoadingState label="Loading family progress..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  
  return (
    <div className="animate-rise" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div className="eyebrow">Parent dashboard</div>
      <h1 className="font-display" style={{ margin: '8px 0 24px', fontSize: 'clamp(2rem,4vw,3.2rem)' }}>Progress at a glance.</h1>
      
      <Toast message={notice} />

      <div className="surface" style={{ padding: 24, marginBottom: 24 }}>
        <h2 className="font-display" style={{ margin: '0 0 12px', fontSize: '1.4rem' }}>Connect a Student</h2>
        <p className="muted" style={{ marginBottom: 16 }}>Ask the student to generate an invitation token from their dashboard and enter it below.</p>
        <form onSubmit={connectStudent} style={{ display: 'flex', gap: 10, maxWidth: 500 }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Paste invitation token here..." 
            value={token} 
            onChange={e => setToken(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <SubmitButton loading={submittingToken} type="submit"><Link2 size={16}/> Connect</SubmitButton>
        </form>
      </div>

      {children.length === 0 ? (
        <div className="surface" style={{ padding: 25 }}>No approved student links yet. Connect a student above.</div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {children.map(child => (
            <section className="surface" style={{ padding: 24 }} key={child.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 15, flexWrap: 'wrap' }}>
                <div>
                  <h2 className="font-display" style={{ margin: 0 }}>{child.name}</h2>
                  <p className="muted">{child.email}</p>
                </div>
                <a className="btn btn-secondary btn-sm" href={`mailto:${child.email}`}>
                  <MessageCircle size={15} /> Contact
                </a>
              </div>
              <div className="progress-track" style={{ margin: '17px 0 7px' }}>
                <div className="progress-fill" style={{ width: `${child.progress_percentage}%` }} />
              </div>
              <strong>{child.progress_percentage}% overall progress</strong>
              
              <div style={{ display: 'grid', gap: 10, marginTop: 19 }}>
                {(child.courses || []).map(course => (
                  <div key={course.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                      <span><GraduationCap size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />{course.title}</span>
                      <span>{course.progress_percentage}%</span>
                    </div>
                    <div className="progress-track" style={{ marginTop: 5 }}>
                      <div className="progress-fill" style={{ width: `${course.progress_percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 style={{ margin: '22px 0 9px' }}>Recent quiz grades</h3>
              {(child.recent_quiz_grades || []).map((grade, index) => (
                <div key={`${grade.title}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', padding: '9px 0', fontSize: '.88rem' }}>
                  <span>{grade.title}</span>
                  <strong>{grade.score}%</strong>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
