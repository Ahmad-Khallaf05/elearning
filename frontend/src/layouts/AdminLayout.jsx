import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    ShieldCheck, 
    LayoutDashboard, 
    Users, 
    LogOut, 
    Menu, 
    X,
    User,
    ClipboardCheck
} from 'lucide-react';

const AdminLayout = () => {
    const { user, isLoading, logout } = useAuth();
    console.log("[AdminLayout] Current State:", { user, isLoading, role: user?.role });
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== 'admin') {
                navigate('/');
            }
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <div className="ml-3 text-emerald-400 font-medium">Loading Admin Portal...</div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null; // Prevent rendering anything before redirecting
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
        { name: 'Course Approvals', path: '/admin/approvals', icon: ClipboardCheck },
        { name: 'Users', path: '/admin/users', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 text-white shadow-sm flex items-center justify-between p-4 sticky top-0 z-20">
                <div className="flex items-center text-xl font-bold text-emerald-400">
                    <ShieldCheck className="mr-2 h-6 w-6" /> Admin Control
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300 hover:text-white">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 bg-slate-900 shadow-xl w-64 transform transition-transform duration-300 ease-in-out z-30
                md:relative md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="hidden md:flex items-center justify-center h-20 border-b border-slate-800 px-6">
                        <ShieldCheck className="h-7 w-7 mr-2 text-emerald-400" />
                        <span className="text-xl font-bold text-emerald-400 tracking-wide uppercase">Admin Portal</span>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Management</div>
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive 
                                            ? 'bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}
                                    `}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {link.name}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <div className="flex items-center px-4 py-3 mb-2 rounded-xl bg-slate-800/50">
                            <div className="bg-emerald-500/20 rounded-full p-2 mr-3">
                                <User className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors duration-200"
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
