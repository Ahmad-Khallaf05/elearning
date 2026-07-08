import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const data = await login(credentials);
            if (data.user.role === 'student') navigate('/student/dashboard');
            else if (data.user.role === 'instructor') navigate('/instructor/dashboard');
            else if (data.user.role === 'admin') navigate('/admin/approvals');
            else navigate('/');
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || { email: [error.response.data.message] });
            } else {
                setErrors({ email: ['An unexpected error occurred.'] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                    <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                            placeholder="you@example.com"
                            required 
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                            placeholder="••••••••"
                            required 
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md shadow-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-600">
                    Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
