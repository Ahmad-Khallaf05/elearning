import React, { useEffect, useState } from 'react';
import { ArrowRight, CircleX } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../services/axios';

export default function PaymentCancel() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const [courseId, setCourseId] = useState(params.get('course_id'));

  useEffect(() => {
    if (orderId && !courseId) {
      axios.get(`/api/v1/orders/${orderId}/status`)
        .then(res => {
          if (res.data?.data?.course_id) {
            setCourseId(res.data.data.course_id);
          }
        })
        .catch(err => console.error('Failed to fetch order status', err));
    }
  }, [orderId, courseId]);

  const destination = courseId ? `/courses/${courseId}` : '/student/catalog';

  return <main className="auth-form-side"><div className="auth-card animate-rise" style={{ textAlign: 'center' }}><CircleX size={56} style={{ color: 'var(--coral)' }} /><div className="eyebrow" style={{ marginTop: 18 }}>PayPal</div><h1 className="font-display" style={{ margin: '9px 0 12px' }}>تم إلغاء عملية الدفع</h1><p className="muted">تم إلغاء عملية الدفع، يمكنك المحاولة مرة أخرى.</p>{orderId && <p className="muted" style={{ fontSize: '.85rem' }}>رقم الطلب: {orderId}</p>}<Link className="btn btn-primary" to={destination} style={{ marginTop: 18 }}>العودة إلى الدورة <ArrowRight size={16} /></Link></div></main>;
}
