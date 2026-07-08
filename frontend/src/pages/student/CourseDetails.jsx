import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../services/axios';
import { 
    ArrowLeft, 
    BookOpen, 
    User, 
    ChevronDown, 
    ChevronRight,
    PlayCircle,
    Calendar,
    Loader2,
    CheckCircle
} from 'lucide-react';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`/api/courses/${id}`);
            const courseData = response.data.data || response.data;
            setCourse(courseData);
            setSections(courseData.sections || []);
            
            // Auto-expand first section
            if (courseData.sections && courseData.sections.length > 0) {
                setExpandedSections({ [courseData.sections[0].id]: true });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load course details. It may have been removed or is unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setError('');
        try {
            // Simulated instant enrollment via checkout POST
            await axios.post('/api/checkout', { course_id: id });
            
            // On success, redirect to dashboard
            navigate('/student/dashboard', { 
                state: { successMessage: `Successfully enrolled in ${course.title}!` }
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to process enrollment. Please try again.');
            setIsCheckingOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || 'Course not found'}</p>
                <Link to="/student/catalog" className="text-indigo-600 hover:underline">
                    &larr; Back to Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header / Hero Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/3 bg-gray-100 relative">
                        {course.thumbnail_url ? (
                            <img 
                                src={course.thumbnail_url} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
                                <BookOpen className="w-20 h-20 text-indigo-200" />
                            </div>
                        )}
                    </div>
                    <div className="p-6 md:p-8 md:w-2/3 flex flex-col justify-center">
                        <Link to="/student/catalog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to courses
                        </Link>
                        
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{course.title}</h1>
                        <p className="text-gray-600 mb-6 line-clamp-3">
                            {course.description || "No description provided for this course."}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8">
                            <div className="flex items-center">
                                <User className="w-5 h-5 mr-2 text-indigo-500" />
                                <span className="font-medium text-gray-900">{course.instructor?.name || 'Instructor Name'}</span>
                            </div>
                            <div className="flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                                <span>{sections.length} Sections</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                            <div className="text-3xl font-extrabold text-gray-900">
                                ${parseFloat(course.price).toFixed(2)}
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    'Enroll Now'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Syllabus */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    Course Syllabus
                </h2>
                
                <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                    {sections.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            The syllabus for this course is currently empty.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {sections.map((section, index) => (
                                <div key={section.id} className="transition-all duration-200">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center font-semibold text-gray-900 text-lg">
                                            {expandedSections[section.id] ? (
                                                <ChevronDown className="w-5 h-5 mr-3 text-indigo-500" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 mr-3 text-gray-400" />
                                            )}
                                            Section {index + 1}: {section.title}
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {section.lessons?.length || 0} lessons
                                        </span>
                                    </button>
                                    
                                    {expandedSections[section.id] && (
                                        <div className="p-5 bg-gray-50/50 border-t border-gray-100">
                                            {(!section.lessons || section.lessons.length === 0) ? (
                                                <p className="text-sm text-gray-500 italic pl-8">No lessons available in this section yet.</p>
                                            ) : (
                                                <ul className="space-y-3 pl-8">
                                                    {section.lessons.map((lesson, lIndex) => (
                                                        <li key={lesson.id} className="flex items-start">
                                                            <div className="mt-0.5 mr-3 flex-shrink-0">
                                                                {lesson.type === 'Live' ? (
                                                                    <Calendar className="w-5 h-5 text-emerald-500" />
                                                                ) : (
                                                                    <PlayCircle className="w-5 h-5 text-indigo-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-medium text-gray-800">
                                                                    {lesson.title}
                                                                </p>
                                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                                                                    {lesson.type}
                                                                </p>
                                                            </div>
                                                            {/* Lock icon could go here to indicate they need to buy to access */}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
