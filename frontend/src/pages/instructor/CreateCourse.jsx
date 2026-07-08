import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../services/axios';
import { BookOpen, DollarSign, AlignLeft, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: null
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            await axios.post('/api/courses', formData);
            navigate('/instructor/courses');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Something went wrong. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-8">
                <Link 
                    to="/instructor/courses"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                    <p className="mt-1 text-sm text-gray-500">Fill in the details to start building your course.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 md:p-8 space-y-6">
                {errors.general && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm">
                        {errors.general}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                    errors.title ? 'border-red-300 ring-1 ring-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                } rounded-lg shadow-sm sm:text-sm transition-colors`}
                                placeholder="e.g., Advanced React Patterns"
                            />
                        </div>
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>}
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                step="0.01"
                                min="0"
                                required
                                value={formData.price}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                    errors.price ? 'border-red-300 ring-1 ring-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                } rounded-lg shadow-sm sm:text-sm transition-colors`}
                                placeholder="49.99"
                            />
                        </div>
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price[0]}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Description <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <AlignLeft className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                    errors.description ? 'border-red-300 ring-1 ring-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                } rounded-lg shadow-sm sm:text-sm transition-colors`}
                                placeholder="Describe what students will learn in this course..."
                            />
                        </div>
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/instructor/courses')}
                        className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                Creating...
                            </>
                        ) : (
                            'Create Course'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;
