import React, { useEffect, useState } from 'react';
import { DollarSign, PlusCircle, Calendar, CheckCircle2, Clock3 } from 'lucide-react';
import axios from '../../services/axios';
import { apiMessage, asArray, ErrorState, formatDate, formatMoney, LoadingState, SubmitButton, Toast } from '../../components/Shared';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('paypal');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [walletRes, payoutsRes] = await Promise.all([
        axios.get('/api/instructor/wallet'),
        axios.get('/api/instructor/payouts')
      ]);
      setBalance(Number(walletRes.data.data?.balance || 0));
      setPayouts(asArray(payoutsRes.data));
      setError('');
    } catch (err) {
      setError(apiMessage(err, 'We could not load your wallet details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const requestPayout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const res = await axios.post('/api/instructor/payouts', {
        amount: Number(amount),
        payout_method: method,
        payout_details: { account: details }
      });
      setPayouts(prev => [res.data.data || res.data, ...prev]);
      setNotice('Payout request submitted successfully.');
      setAmount('');
      setDetails('');
    } catch (err) {
      alert(apiMessage(err, 'Failed to submit payout request.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading wallet..." />;
  return (
    <div className="animate-rise" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow">Instructor studio</div>
        <h1 className="font-display" style={{ margin: '8px 0 7px', fontSize: 'clamp(2rem,4vw,3.2rem)', letterSpacing: '-.06em' }}>Wallet & Payouts.</h1>
        <p className="muted">Manage your earnings and request payouts.</p>
      </div>

      <Toast message={notice} />
      {error && <ErrorState message={error} onRetry={load} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div className="surface" style={{ padding: 24 }}>
          <h2 className="font-display" style={{ margin: '0 0 16px', fontSize: '1.4rem' }}>Available Balance</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'var(--mint)', color: 'var(--teal)', padding: 12, borderRadius: 12 }}>
              <DollarSign size={32} />
            </div>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.03em' }}>{formatMoney(balance)}</span>
          </div>
          
          <form onSubmit={requestPayout} style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Request Payout</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label className="label">Amount</label>
                <input type="number" min="1" max={balance} step="0.01" required className="input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Payout Method</label>
                <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Details (Email or IBAN)</label>
                <input type="text" required className="input" value={details} onChange={e => setDetails(e.target.value)} placeholder="paypal@example.com" />
              </div>
              <SubmitButton loading={submitting} type="submit" disabled={!amount || amount > balance || balance <= 0}>
                Submit Request <PlusCircle size={16} />
              </SubmitButton>
            </div>
          </form>
        </div>

        <div>
          <h2 className="font-display" style={{ margin: '0 0 16px', fontSize: '1.4rem' }}>Payout History</h2>
          {payouts.length === 0 ? (
            <div className="surface" style={{ padding: 24, textAlign: 'center' }}>
              <p className="muted">No payout requests yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {payouts.map(payout => (
                <div key={payout.id} className="surface" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.1rem' }}>{formatMoney(payout.amount)}</strong>
                    <span className="muted" style={{ fontSize: '.85rem' }}><Calendar size={12} style={{ verticalAlign: 'middle' }}/> {formatDate(payout.created_at)}</span>
                  </div>
                  <div>
                    {payout.status === 'pending' && <span className="badge" style={{ background: 'var(--sun)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '.75rem', fontWeight: 700 }}><Clock3 size={12} style={{ verticalAlign: 'middle' }}/> Pending</span>}
                    {payout.status === 'processed' && <span className="badge" style={{ background: 'var(--teal)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '.75rem', fontWeight: 700 }}><CheckCircle2 size={12} style={{ verticalAlign: 'middle' }}/> Processed</span>}
                    {payout.status === 'rejected' && <span className="badge" style={{ background: 'var(--coral)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '.75rem', fontWeight: 700 }}>Rejected</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
