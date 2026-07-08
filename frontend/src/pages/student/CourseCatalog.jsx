import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../services/axios';
import { Search, BookOpen, User as UserIcon, Loader2 } from 'lucide-react';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // Assuming GET /api/courses returns all public courses
            const response = await axios.get('/api/courses');
            setCourses(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load courses. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Browse Courses</h1>
                    <p className="mt-1 text-sm text-gray-500">Discover new skills and elevate your career.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {!isLoading && filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                    <p className="text-gray-500">Try adjusting your search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden flex-shrink-0">
                                {course.thumbnail_url ? (
                                    <img 
                                        src={course.thumbnail_url} 
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
                                        <BookOpen className="w-12 h-12 text-indigo-200" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/95 text-gray-900 shadow-sm backdrop-blur-sm">
                                        ${parseFloat(course.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {course.title}
                                </h3>
                                
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <UserIcon className="w-4 h-4 mr-1.5" />
                                    <span className="truncate">{course.instructor?.name || 'Instructor'}</span>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <Link 
                                        to={`/student/courses/${course.id}`}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;
