import React, { useState } from 'react';
import { Menu, X, LogOut, ShieldCheck, GraduationCap, LayoutDashboard, BookOpen, Compass, PlusCircle, ClipboardCheck, Users } from 'lucide-react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initials } from '../components/Shared';

const configs = {
  student: { label: 'Student workspace', icon: GraduationCap, links: [{ label: 'My learning', to: '/student/dashboard', icon: BookOpen }, { label: 'Browse courses', to: '/student/catalog', icon: Compass }] },
  instructor: { label: 'Instructor studio', icon: GraduationCap, links: [{ label: 'Dashboard', to: '/instructor/dashboard', icon: LayoutDashboard }, { label: 'My courses', to: '/instructor/courses', icon: BookOpen }, { label: 'Create course', to: '/instructor/courses/create', icon: PlusCircle }] },
  admin: { label: 'Admin review desk', icon: ShieldCheck, links: [{ label: 'Overview', to: '/admin/overview', icon: LayoutDashboard }, { label: 'Course approvals', to: '/admin/approvals', icon: ClipboardCheck }, { label: 'Users', to: '/admin/users', icon: Users }] },
};

export default function RoleLayout({ role }) {
  const { user, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const config = configs[role];
  if (isLoading) return <div className="app-shell" style={{ display: 'grid', placeItems: 'center' }}><div className="skeleton" style={{ width: 260, height: 84 }} /></div>;
  if (!user || user.role !== role) return <Navigate to="/login" replace />;
  const Icon = config.icon;
  const signOut = async () => { await logout(); navigate('/login'); };
  return (
    <div className="role-layout">
      {open && <button type="button" className="mobile-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`role-sidebar ${open ? 'open' : ''}`}>
        <div className="role-brand"><span className="brand-mark">C</span> CoursePilot</div>
        <div className="eyebrow" style={{ padding: '0 10px 12px', color: '#9fc9c4' }}>{config.label}</div>
        <nav className="role-nav" aria-label="Primary navigation">
          {config.links.map(({ label, to, icon: LinkIcon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><LinkIcon size={18} />{label}</NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="account-chip">
            <div className="avatar">{initials(user.name)}</div>
            <div style={{ minWidth: 0 }}><div className="account-name">{user.name}</div><div className="account-email">{user.email}</div></div>
          </div>
          <button type="button" className="btn signout" onClick={signOut}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>
      <div className="app-main" style={{ flex: 1, minWidth: 0 }}>
        <div className="mobile-bar"><div className="role-brand" style={{ padding: 0 }}><span className="brand-mark">C</span> CoursePilot</div><button type="button" className="icon-btn" style={{ color: '#fff', background: 'transparent', border: 0 }} onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button></div>
        <main className="role-content"><Outlet /></main>
      </div>
    </div>
  );
}