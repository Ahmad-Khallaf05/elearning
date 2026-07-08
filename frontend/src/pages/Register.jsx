import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'student' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const data = await register(formData);
            if (data.user.role === 'student') navigate('/student/dashboard');
            else if (data.user.role === 'instructor') navigate('/instructor/dashboard');
            else navigate('/');
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h1>
                    <p className="text-slate-500 mt-2">Join our e-learning platform today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                            placeholder="John Doe"
                            required 
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>}
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
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
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm</label>
                            <input 
                                type="password" 
                                name="password_confirmation" 
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                                placeholder="••••••••"
                                required 
                            />
                        </div>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p>}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">I want to</label>
                        <select 
                            name="role" 
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white text-slate-700"
                        >
                            <option value="student">Learn (Student)</option>
                            <option value="instructor">Teach (Instructor)</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md shadow-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-600">
                    Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
