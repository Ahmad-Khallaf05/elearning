import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div className="app-shell" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 22 }}><div style={{ maxWidth: 520, textAlign: 'center' }}><div className="eyebrow">404 · off the syllabus</div><h1 className="font-display" style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)', letterSpacing: '-.08em', margin: '8px 0', color: 'var(--navy)' }}>Not here.</h1><p className="muted" style={{ lineHeight: 1.6 }}>This page wandered beyond the course outline. Head back to the learning desk and choose a new direction.</p><Link to="/" className="btn btn-primary" style={{ marginTop: 15 }}><ArrowLeft size={16} /> Back to CoursePilot <Compass size={16} /></Link></div></div>;
}