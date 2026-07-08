import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../services/axios';
import { 
    ArrowLeft, Plus, ChevronDown, ChevronRight, 
    PlayCircle, Video, Calendar, Loader2, X, List
} from 'lucide-react';

const Syllabus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal States
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Form States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sectionForm, setSectionForm] = useState({ title: '', order: 1 });
    const [lessonForm, setLessonForm] = useState({
        title: '',
        type: 'VOD', // VOD or Live
        video_url: '',
        scheduled_time: '',
        live_session_id: '',
        order: 1
    });

    useEffect(() => {
        fetchSyllabus();
    }, [id]);

    const fetchSyllabus = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/courses/${id}`);
            // Assuming the API returns sections nested inside the course or we can adapt
            const courseData = response.data.data || response.data;
            setCourse(courseData);
            setSections(courseData.sections || []);
            
            // Auto-expand all sections initially
            if (courseData.sections) {
                const initialExpanded = {};
                courseData.sections.forEach(sec => initialExpanded[sec.id] = true);
                setExpandedSections(initialExpanded);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load course syllabus.');
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

    const handleAddSection = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        
        try {
            const response = await axios.post(`/api/courses/${id}/sections`, sectionForm);
            setSections([...sections, response.data.data || response.data]);
            setSuccessMessage('Section added successfully!');
            setIsSectionModalOpen(false);
            setSectionForm({ title: '', order: sections.length + 2 });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add section.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openLessonModal = (sectionId) => {
        setActiveSectionId(sectionId);
        setLessonForm({
            ...lessonForm,
            order: (sections.find(s => s.id === sectionId)?.lessons?.length || 0) + 1
        });
        setIsLessonModalOpen(true);
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                title: lessonForm.title,
                type: lessonForm.type,
                order: lessonForm.order,
                vod_url: lessonForm.type === 'VOD' ? lessonForm.video_url : null,
                live_metadata: lessonForm.type === 'Live' ? {
                    scheduled_time: lessonForm.scheduled_time,
                    live_session_id: lessonForm.live_session_id
                } : null
            };

            const response = await axios.post(`/api/sections/${activeSectionId}/lessons`, payload);
            const newLesson = response.data.data || response.data;
            
            // Update local state
            setSections(sections.map(sec => {
                if (sec.id === activeSectionId) {
                    return { ...sec, lessons: [...(sec.lessons || []), newLesson] };
                }
                return sec;
            }));
            
            setSuccessMessage('Lesson added successfully!');
            setIsLessonModalOpen(false);
            setLessonForm({ ...lessonForm, title: '', video_url: '', scheduled_time: '', live_session_id: '' });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add lesson.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-8">
                <Link 
                    to="/instructor/courses"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Syllabus</h1>
                    <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-100 flex items-center">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <List className="w-5 h-5 mr-2 text-indigo-600" />
                        Course Curriculum
                    </h2>
                    <button
                        onClick={() => setIsSectionModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Section
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {sections.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                            <List className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Your course has no sections yet.</p>
                            <button 
                                onClick={() => setIsSectionModalOpen(true)}
                                className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
                            >
                                Create your first section
                            </button>
                        </div>
                    ) : (
                        sections.map((section, index) => (
                            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center font-medium text-gray-900">
                                        {expandedSections[section.id] ? (
                                            <ChevronDown className="w-5 h-5 mr-2 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 mr-2 text-gray-400" />
                                        )}
                                        Section {index + 1}: {section.title}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {section.lessons?.length || 0} lessons
                                    </span>
                                </button>
                                
                                {expandedSections[section.id] && (
                                    <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                                        {(!section.lessons || section.lessons.length === 0) ? (
                                            <p className="text-sm text-gray-500 italic pl-7">No lessons added to this section.</p>
                                        ) : (
                                            <ul className="space-y-2 pl-7">
                                                {section.lessons.map((lesson, lIndex) => (
                                                    <li key={lesson.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                                                        <div className="flex items-center">
                                                            {lesson.type === 'Live' ? (
                                                                <Calendar className="w-4 h-4 mr-3 text-emerald-500" />
                                                            ) : (
                                                                <PlayCircle className="w-4 h-4 mr-3 text-indigo-500" />
                                                            )}
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {lIndex + 1}. {lesson.title}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                                            {lesson.type}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        
                                        <div className="pl-7 mt-3 pt-3">
                                            <button
                                                onClick={() => openLessonModal(section.id)}
                                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add Lesson
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal: Add Section */}
            {isSectionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Section</h3>
                            <button onClick={() => setIsSectionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSection} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                <input
                                    type="text"
                                    required
                                    value={sectionForm.title}
                                    onChange={(e) => setSectionForm({...sectionForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., Introduction to React"
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSectionModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Save Section
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Lesson */}
            {isLessonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Lesson</h3>
                            <button onClick={() => setIsLessonModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddLesson} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                                <input
                                    type="text"
                                    required
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., Setting up the environment"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Type</label>
                                <select
                                    value={lessonForm.type}
                                    onChange={(e) => setLessonForm({...lessonForm, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="VOD">Video on Demand (VOD)</option>
                                    <option value="Live">Live Session</option>
                                </select>
                            </div>

                            {lessonForm.type === 'VOD' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                        <Video className="w-4 h-4 mr-1 text-gray-400" /> Video URL
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={lessonForm.video_url}
                                        onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="https://vimeo.com/..."
                                    />
                                </div>
                            )}

                            {lessonForm.type === 'Live' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Calendar className="w-4 h-4 mr-1 text-gray-400" /> Scheduled Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={lessonForm.scheduled_time}
                                            onChange={(e) => setLessonForm({...lessonForm, scheduled_time: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Live Session ID (e.g. Zoom Link or ID)</label>
                                        <input
                                            type="text"
                                            required
                                            value={lessonForm.live_session_id}
                                            onChange={(e) => setLessonForm({...lessonForm, live_session_id: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="https://zoom.us/j/..."
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsLessonModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Save Lesson
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Syllabus;
