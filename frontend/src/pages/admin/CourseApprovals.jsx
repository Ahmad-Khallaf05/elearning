import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { 
    ClipboardCheck, 
    CheckCircle, 
    XCircle, 
    Loader2, 
    Clock, 
    Search, 
    Eye 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseApprovals = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(null); // stores course ID being actioned
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPendingCourses();
    }, []);

    const fetchPendingCourses = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/admin/courses');
            setCourses(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error('Failed to load courses', err);
            setError('Failed to fetch pending courses.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModeration = async (courseId, status) => {
        setIsActioning(courseId);
        try {
            await axios.patch(`/api/admin/courses/${courseId}/status`, { status });
            
            // Remove the processed course from local state
            setCourses(prev => prev.filter(c => c.id !== courseId));
            
            showToast(`Course successfully ${status}!`, status === 'approved' ? 'success' : 'error');
        } catch (err) {
            console.error('Failed to moderate course', err);
            showToast('An error occurred during moderation.', 'error');
        } finally {
            setIsActioning(null);
        }
    };

    const showToast = (message, type) => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (course.instructor?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {toastMessage && (
                <div className="fixed top-20 right-8 z-50 animate-fade-in-down">
                    <div className={`px-6 py-4 rounded-xl shadow-xl font-medium text-sm flex items-center border ${
                        toastMessage.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
                        {toastMessage.message}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl mr-4">
                        <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Course Moderation</h1>
                        <p className="text-sm text-slate-500 mt-1">Review and approve new courses submitted by instructors.</p>
                    </div>
                </div>
                
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title or instructor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors text-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Course Info
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Instructor
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                                        <p className="mt-2 text-slate-500">Loading pending courses...</p>
                                    </td>
                                </tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-900 mb-1">No courses pending review</h3>
                                        <p className="text-slate-500 text-sm">All caught up! Instructors haven't submitted any new courses.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                                    {course.thumbnail_url ? (
                                                        <img className="h-10 w-10 object-cover" src={course.thumbnail_url} alt="" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-indigo-50">
                                                            <BookOpen className="h-5 w-5 text-indigo-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-900 line-clamp-1" title={course.title}>
                                                        {course.title}
                                                    </div>
                                                    <div className="text-xs text-amber-600 font-medium flex items-center mt-1">
                                                        <Clock className="w-3 h-3 mr-1" /> Pending Review
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 font-medium">{course.instructor?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{course.instructor?.email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(course.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            ${parseFloat(course.price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {/* In a real app, this might link to a preview of the course */}
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Preview Course">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleModeration(course.id, 'approved')}
                                                    disabled={isActioning === course.id}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                                                >
                                                    {isActioning === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleModeration(course.id, 'rejected')}
                                                    disabled={isActioning === course.id}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                                                >
                                                    {isActioning === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CourseApprovals;
