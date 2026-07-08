import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../services/axios';
import { 
    ArrowLeft, 
    CheckCircle, 
    PlayCircle, 
    Calendar,
    Loader2,
    ChevronDown,
    ChevronRight,
    Award
} from 'lucide-react';

const CoursePlayer = () => {
    const { courseId } = useParams();
    
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    
    const [activeLesson, setActiveLesson] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            // First get the course and syllabus structure
            const courseRes = await axios.get(`/api/courses/${courseId}`);
            const courseData = courseRes.data.data || courseRes.data;
            setCourse(courseData);
            setSections(courseData.sections || []);
            
            // Expand first section by default
            if (courseData.sections && courseData.sections.length > 0) {
                setExpandedSections({ [courseData.sections[0].id]: true });
                // Auto-select first lesson if available
                if (courseData.sections[0].lessons && courseData.sections[0].lessons.length > 0) {
                    setActiveLesson(courseData.sections[0].lessons[0]);
                }
            }

            // Fetch enrollments to get completed lesson IDs for this course
            const enrollmentsRes = await axios.get('/api/student/enrollments');
            const enrollments = enrollmentsRes.data.data || enrollmentsRes.data;
            const enrollment = enrollments.find(e => String(e.course_id) === String(courseId));
            const completed = enrollment?.completed_lesson_ids || [];
            setCompletedLessonIds(completed);

        } catch (err) {
            console.error(err);
            setError('Failed to load course player.');
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

    const handleLessonSelect = (lesson) => {
        setActiveLesson(lesson);
    };

    const toggleCompletion = async (lessonId) => {
        try {
            await axios.post(`/api/student/lessons/${lessonId}/complete`);
            
            setCompletedLessonIds(prev => {
                const isComplete = prev.includes(lessonId);
                const updated = isComplete 
                    ? prev.filter(id => id !== lessonId)
                    : [...prev, lessonId];
                
                if (!isComplete) {
                    showToast("Lesson completed! Keep it up.");
                }
                
                return updated;
            });
            
        } catch (err) {
            console.error('Failed to toggle completion', err);
            showToast("Error updating progress.", true);
        }
    };

    const showToast = (msg, isError = false) => {
        setToastMessage({ text: msg, isError });
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Calculate dynamic progress
    let totalLessons = 0;
    sections.forEach(sec => totalLessons += (sec.lessons?.length || 0));
    const completedCount = completedLessonIds.filter(id => 
        sections.some(sec => sec.lessons?.some(l => l.id === id))
    ).length;
    
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p>Loading your learning environment...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link to="/student/dashboard" className="text-indigo-600 hover:underline">&larr; Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* Top Navigation */}
            <header className="bg-gray-900 text-white h-16 flex items-center justify-between px-4 sm:px-6 z-10 shadow-md flex-shrink-0">
                <div className="flex items-center">
                    <Link to="/student/dashboard" className="text-gray-400 hover:text-white mr-4 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-semibold truncate hidden sm:block">{course.title}</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-emerald-400 h-2 transition-all duration-500 ease-in-out" 
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-emerald-400">{progressPercentage}%</span>
                    </div>
                </div>
            </header>

            {toastMessage && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
                    <div className={`px-4 py-2 rounded-lg shadow-lg font-medium text-sm flex items-center ${toastMessage.isError ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {toastMessage.isError ? null : <Award className="w-4 h-4 mr-2" />}
                        {toastMessage.text}
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Main Player Area */}
                <main className="flex-1 overflow-y-auto bg-gray-100 flex flex-col relative">
                    {activeLesson ? (
                        <div className="flex-1 flex flex-col">
                            {/* Video Player / Content Placeholder */}
                            <div className="w-full bg-black aspect-video flex-shrink-0 flex items-center justify-center relative shadow-lg">
                                {activeLesson.type === 'Live' ? (
                                    <div className="text-center p-8">
                                        <Calendar className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-white mb-2">Live Session Scheduled</h3>
                                        <p className="text-gray-400 mb-6">{new Date(activeLesson.scheduled_time || new Date()).toLocaleString()}</p>
                                        <a 
                                            href={activeLesson.live_session_id || '#'} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Join Live Session
                                        </a>
                                    </div>
                                ) : (
                                    activeLesson.vod_url ? (
                                        <div className="w-full h-full text-center flex flex-col items-center justify-center text-gray-400">
                                            <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                                            <p>Video Player Integration</p>
                                            <p className="text-sm">URL: {activeLesson.vod_url}</p>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">No video URL provided.</div>
                                    )
                                )}
                            </div>
                            
                            {/* Lesson Info & Actions */}
                            <div className="p-6 md:p-10 max-w-5xl w-full mx-auto bg-white flex-1 border-x border-gray-200">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.title}</h2>
                                        <p className="text-gray-500 flex items-center">
                                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mr-3">
                                                {activeLesson.type}
                                            </span>
                                            {/* Assume section name could go here if we tracked it */}
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => toggleCompletion(activeLesson.id)}
                                        className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
                                            completedLessonIds.includes(activeLesson.id)
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <CheckCircle className={`w-5 h-5 mr-2 ${completedLessonIds.includes(activeLesson.id) ? 'text-emerald-500' : 'text-gray-400'}`} />
                                        {completedLessonIds.includes(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
                                    </button>
                                </div>
                                
                                <div className="mt-8 prose max-w-none text-gray-600">
                                    <p>This is the placeholder area for lesson description, transcript, or supplementary materials.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a lesson from the syllabus to start learning.
                        </div>
                    )}
                </main>

                {/* Syllabus Sidebar */}
                <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0 hidden lg:block">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                        <h3 className="font-semibold text-gray-900">Course Content</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {sections.map((section, index) => (
                            <div key={section.id}>
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            Section {index + 1}: {section.title}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {section.lessons?.filter(l => completedLessonIds.includes(l.id)).length || 0} / {section.lessons?.length || 0} | 1h 15m
                                        </span>
                                    </div>
                                    {expandedSections[section.id] ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                    )}
                                </button>
                                
                                {expandedSections[section.id] && (
                                    <ul className="bg-gray-50/50">
                                        {section.lessons?.map((lesson, lIndex) => {
                                            const isActive = activeLesson?.id === lesson.id;
                                            const isCompleted = completedLessonIds.includes(lesson.id);
                                            
                                            return (
                                                <li key={lesson.id}>
                                                    <button
                                                        onClick={() => handleLessonSelect(lesson)}
                                                        className={`w-full flex items-start p-3 pl-8 text-left transition-colors border-l-2 ${
                                                            isActive 
                                                                ? 'border-indigo-600 bg-indigo-50/50' 
                                                                : 'border-transparent hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <div className="mt-0.5 mr-3 flex-shrink-0">
                                                            {isCompleted ? (
                                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                            ) : (
                                                                lesson.type === 'Live' ? (
                                                                    <Calendar className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                                ) : (
                                                                    <PlayCircle className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex flex-col">
                                                            <span className={`text-sm ${isActive ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                                                                {lIndex + 1}. {lesson.title}
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-0.5">
                                                                {lesson.type} • 5 min
                                                            </span>
                                                        </div>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
            <style jsx>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translate(-50%, -20px); }
                    100% { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CoursePlayer;
