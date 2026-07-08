import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../../services/axios';
import { BookOpen, CheckCircle2, PlayCircle, Loader2 } from 'lucide-react';

const StudentDashboard = () => {
    const location = useLocation();
    const [enrollments, setEnrollments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState(location.state?.successMessage || '');

    useEffect(() => {
        fetchEnrollments();
    }, []);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const fetchEnrollments = async () => {
        try {
            // Assuming endpoint returns a list of enrollments, each containing a `course` object
            const response = await axios.get('/api/student/enrollments');
            setEnrollments(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load your enrolled courses.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {toastMessage && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" />
                    <span className="font-medium">{toastMessage}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
                    <p className="mt-1 text-base text-gray-500">Pick up right where you left off.</p>
                </div>
                <Link
                    to="/student/catalog"
                    className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                >
                    Browse More Courses
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            {!isLoading && enrollments.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to start learning?</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">You haven't enrolled in any courses yet. Explore our catalog and discover your next passion.</p>
                    <Link
                        to="/student/catalog"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Browse Course Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {enrollments.map((enrollment) => {
                        const course = enrollment.course || enrollment; // Handle generic API structures
                        
                        return (
                            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group">
                                <div className="aspect-video bg-gray-100 relative overflow-hidden flex-shrink-0">
                                    {course.thumbnail_url ? (
                                        <img 
                                            src={course.thumbnail_url} 
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                            <BookOpen className="w-12 h-12 text-indigo-300" />
                                        </div>
                                    )}
                                    {/* Dynamic progress bar */}
                                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-200">
                                        <div className="h-full bg-emerald-500" style={{ width: `${course.progress_percentage || 0}%` }}></div>
                                    </div>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="mt-auto pt-6">
                                        <Link 
                                            to={`/student/learn/${course.id}`}
                                            className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
                                        >
                                            <PlayCircle className="w-5 h-5 mr-2" />
                                            Start Learning
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
