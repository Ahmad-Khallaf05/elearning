import React from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export const unwrap = (payload) => {
  const value = payload?.data ?? payload;
  if (value?.data && (Array.isArray(value.data) || typeof value.data === 'object')) return value.data;
  return value;
};

export const asArray = (payload) => {
  const value = unwrap(payload);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.courses)) return value.courses;
  return [];
};

export const apiMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const status = error?.response?.status;
  if (status === 401) return 'Your session has ended. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 422) return error?.response?.data?.message || 'Please check the highlighted fields.';
  if (status >= 500) return `CoursePilot is having trouble reaching the server. Details: ${error?.response?.data?.message || error?.message || fallback}`;
  return error?.response?.data?.message || error?.message || fallback;
};

export const formatMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? `$${number.toFixed(2)}` : 'Free';
};

export const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export const initials = (name = 'CoursePilot') => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();

export const LoadingState = ({ label = 'Loading your workspace...' }) => (
  <div className="surface animate-rise" style={{ padding: '50px 20px', textAlign: 'center' }}>
    <div className="skeleton" style={{ width: 54, height: 54, margin: '0 auto 15px', borderRadius: 16 }} />
    <p className="muted" style={{ margin: 0 }}>{label}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="notice notice-error animate-rise" role="alert" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <AlertTriangle size={20} />
    <span style={{ flex: 1 }}>{message}</span>
    {onRetry && <button type="button" className="btn btn-sm btn-danger" onClick={onRetry}><RefreshCw size={15} /> Retry</button>}
  </div>
);

export const EmptyState = ({ title, description, action }) => (
  <div className="surface animate-rise" style={{ padding: '54px 22px', textAlign: 'center' }}>
    <div style={{ width: 54, height: 54, display: 'grid', placeItems: 'center', margin: '0 auto 16px', borderRadius: 16, color: 'var(--teal)', background: 'var(--mint)' }}>
      <BookOpen size={25} />
    </div>
    <h3 className="font-display" style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>{title}</h3>
    <p className="muted" style={{ maxWidth: 430, margin: '0 auto 21px' }}>{description}</p>
    {action}
  </div>
);

export const Toast = ({ message, type = 'success' }) => message ? (
  <div className={`notice notice-${type}`} role="status" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
    <CheckCircle2 size={17} /> {message}
  </div>
) : null;

export const SubmitButton = ({ loading, children, ...props }) => (
  <button className="btn btn-primary" disabled={loading} {...props}>
    {loading ? <><Loader2 size={17} className="animate-spin" /> Working...</> : children}
  </button>
);