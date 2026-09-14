import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, Mail, Calendar, KeyRound, GraduationCap, PenTool } from 'lucide-react';
import axios from '../../services/axios';
import { apiMessage, asArray, ErrorState, formatDate, LoadingState, EmptyState } from '../../components/Shared';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(asArray(response.data));
      setError('');
    } catch (err) {
      setError(apiMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => 
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())
  );

  const RoleIcon = ({ role }) => {
    if (role === 'admin') return <ShieldCheck size={16} />;
    if (role === 'instructor') return <PenTool size={16} />;
    if (role === 'parent') return <Users size={16} />;
    return <GraduationCap size={16} />;
  };

  if (loading) return <LoadingState label="Loading directory..." />;

  return (
    <div className="animate-rise" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 15, flexWrap: 'wrap', marginBottom: 27 }}>
        <div>
          <div className="eyebrow">Admin review desk</div>
          <h1 className="font-display" style={{ margin: '8px 0 7px', fontSize: 'clamp(2rem,4vw,3.1rem)', letterSpacing: '-.05em' }}>People in the workspace.</h1>
          <p className="muted">Manage and review all registered users across roles.</p>
        </div>
        <div style={{ position: 'relative', width: 'min(320px, 100%)' }}>
          <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, or role..." />
        </div>
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <strong style={{ display: 'block' }}>{user.name}</strong>
                    <span className="muted" style={{ fontSize: '.85rem' }}><Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }}/>{user.email}</span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, background: '#f1f5f9', fontSize: '.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      <RoleIcon role={user.role} /> {user.role}
                    </span>
                  </td>
                  <td className="muted">
                    <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }}/> {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px 10px' }}>
                    <p className="muted">No users found matching "{query}"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}