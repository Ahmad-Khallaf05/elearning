import React, { useState } from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    BookOpen, 
    Compass, 
    LogOut, 
    Menu, 
    X,
    User,
    GraduationCap
} from 'lucide-react';

const StudentLayout = () => {
    const { user, role, isLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user || role !== 'student') {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'My Learning', path: '/student/dashboard', icon: BookOpen },
        { name: 'Browse Courses', path: '/student/catalog', icon: Compass },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white shadow-sm flex items-center justify-between p-4 sticky top-0 z-20">
                <div className="flex items-center text-xl font-bold text-indigo-600">
                    <GraduationCap className="mr-2 h-6 w-6" /> Student Portal
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white shadow-lg w-64 transform transition-transform duration-300 ease-in-out z-10
                md:relative md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="hidden md:flex items-center justify-center h-16 border-b border-gray-100 px-6">
                        <GraduationCap className="h-6 w-6 mr-2 text-indigo-600" />
                        <span className="text-xl font-bold text-indigo-600 tracking-tight">Student Portal</span>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                                        ${isActive 
                                            ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                    `}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {link.name}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center px-4 py-3 mb-2">
                            <div className="bg-indigo-100 rounded-full p-2 mr-3">
                                <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
                    className="fixed inset-0 bg-black/20 z-0 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
