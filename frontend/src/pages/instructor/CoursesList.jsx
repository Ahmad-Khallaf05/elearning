import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../services/axios';
import { BookOpen, Plus, Edit, Trash2, Clock, List } from 'lucide-react';

const CoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/courses');
            // Assuming the API returns either an array of courses directly or paginated data
            setCourses(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setError('Failed to load courses. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your course catalog and content.</p>
                </div>
                <Link
                    to="/instructor/courses/create"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2 -ml-1" />
                    Create New Course
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {courses.length === 0 && !error ? (
                <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 mb-4">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first course and sharing your knowledge.</p>
                    <Link
                        to="/instructor/courses/create"
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Course
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
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
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm`}>
                                        ${parseFloat(course.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                    {course.description || 'No description provided.'}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        <span>Draft</span> {/* Mock status for now */}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link 
                                            to={`/instructor/courses/${course.id}/syllabus`}
                                            title="Manage Syllabus"
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                        >
                                            <List className="w-4 h-4" />
                                        </Link>
                                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoursesList;
