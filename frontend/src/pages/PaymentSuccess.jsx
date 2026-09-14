import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../services/axios';
import { apiMessage } from '../components/Shared';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!orderId) return undefined;
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      try {
        const response = await axios.get(`/api/v1/orders/${orderId}/status`);
        if (!cancelled) setOrder(response.data?.data || response.data);
      } catch (requestError) {
        if (!cancelled) setError(apiMessage(requestError, 'We could not confirm this payment yet.'));
      }
    };
    check();
    const timer = window.setInterval(() => { attempts += 1; if (attempts < 5) check(); else window.clearInterval(timer); }, 2000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [orderId]);
  if (!orderId) return <main className="auth-form-side"><div className="auth-card"><h1 className="font-display">Payment reference missing</h1><Link className="btn btn-primary" to="/student/catalog">Return to catalog</Link></div></main>;
  const completed = order?.status === 'completed';
  return <main className="auth-form-side"><div className="auth-card animate-rise" style={{ textAlign: 'center' }}>{completed ? <CheckCircle2 size={56} style={{ color: 'var(--teal)' }} /> : <Loader2 size={40} className="animate-spin" style={{ color: 'var(--teal)' }} />}<div className="eyebrow" style={{ marginTop: 18 }}>{completed ? 'Payment confirmed' : 'Confirming payment'}</div><h1 className="font-display" style={{ margin: '9px 0 12px' }}>{completed ? 'You are ready to learn.' : 'One moment, please.'}</h1><p className="muted">{error || (completed ? 'Your enrollment is active.' : 'We are checking the PayPal capture result.')}</p>{completed && <Link className="btn btn-primary" to={`/student/learn/${order.course_id}`} style={{ marginTop: 18 }}>Enter course <ArrowRight size={16} /></Link>} {!completed && <Link className="btn btn-secondary" to="/student/dashboard" style={{ marginTop: 18 }}>Go to dashboard</Link>}</div></main>;
}
