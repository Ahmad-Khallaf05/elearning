import React from 'react';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {trend && (
                <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    // Mock data for the dashboard
    const stats = [
        {
            title: 'Total Students',
            value: '1,248',
            icon: Users,
            trend: 12.5,
            colorClass: 'bg-blue-50 text-blue-600'
        },
        {
            title: 'Active Courses',
            value: '12',
            icon: BookOpen,
            trend: 0,
            colorClass: 'bg-indigo-50 text-indigo-600'
        },
        {
            title: 'Total Revenue',
            value: '$14,230',
            icon: DollarSign,
            trend: 8.2,
            colorClass: 'bg-emerald-50 text-emerald-600'
        },
        {
            title: 'Enrollments This Month',
            value: '342',
            icon: TrendingUp,
            trend: 24.1,
            colorClass: 'bg-purple-50 text-purple-600'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your courses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p>Activity charts and recent student enrollments will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
