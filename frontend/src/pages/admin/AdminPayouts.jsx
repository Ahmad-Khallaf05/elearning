import React, { useEffect, useState } from 'react';
import { DollarSign, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import axios from '../../services/axios';
import { apiMessage, asArray, ErrorState, formatDate, formatMoney, LoadingState, Toast } from '../../components/Shared';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(null);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/payouts');
      setPayouts(asArray(res.data.data?.data || res.data.data || []));
      setError('');
    } catch (err) {
      setError(apiMessage(err, 'Failed to load payout requests.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const moderate = async (id, status) => {
    setWorking(id);
    setError('');
    setNotice('');
    try {
      await axios.patch(`/api/admin/payouts/${id}`, { status });
      setNotice(`Payout request ${status}.`);
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      setError(apiMessage(err, 'Failed to process payout.'));
    } finally {
      setWorking(null);
    }
  };

  if (loading) return <LoadingState label="Loading payout requests..." />;
  return (
    <div className="animate-rise" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ marginBottom: 27 }}>
        <div className="eyebrow">Admin review desk</div>
        <h1 className="font-display" style={{ margin: '8px 0 7px', fontSize: 'clamp(2rem,4vw,3.1rem)', letterSpacing: '-.05em' }}>Payout Requests.</h1>
        <p className="muted">Review and process instructor withdrawals.</p>
      </div>

      <Toast message={notice} />
      {error && <div style={{ marginTop: 15 }}><ErrorState message={error} onRetry={load} /></div>}

      <div className="table-wrap" style={{ marginTop: 18 }}>
        <table>
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Amount</th>
              <th>Method & Details</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(payout => (
              <tr key={payout.id}>
                <td>
                  <strong style={{ display: 'block' }}>{payout.instructor?.name || 'Unknown'}</strong>
                  <span className="muted" style={{ fontSize: '.8rem' }}>{payout.instructor?.email}</span>
                </td>
                <td><strong style={{ fontSize: '1.1rem' }}>{formatMoney(payout.amount)}</strong></td>
                <td>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{payout.payout_method.replace('_', ' ')}</span>
                  <div className="muted" style={{ fontSize: '.85rem' }}>{payout.payout_details?.account || 'No details'}</div>
                </td>
                <td className="muted" style={{ fontSize: '.85rem' }}>{formatDate(payout.created_at)}</td>
                <td>
                  {payout.status === 'pending' ? (
                    <div style={{ display: 'flex', justifyContent: 'end', gap: 6 }}>
                      <button type="button" className="btn btn-sm" style={{ color: '#12685e', background: '#e8f5ef' }} disabled={working === payout.id} onClick={() => moderate(payout.id, 'processed')}><CheckCircle2 size={15} /> Approve</button>
                      <button type="button" className="btn btn-danger btn-sm" disabled={working === payout.id} onClick={() => moderate(payout.id, 'rejected')}><XCircle size={15} /> Reject</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'right', fontWeight: 700, textTransform: 'capitalize', color: payout.status === 'processed' ? 'var(--teal)' : 'var(--coral)' }}>
                      {payout.status}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }} className="muted">No payout requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
