import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import InstructorLayout from './layouts/InstructorLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Instructor Pages
import Dashboard from './pages/instructor/Dashboard';
import CoursesList from './pages/instructor/CoursesList';
import CreateCourse from './pages/instructor/CreateCourse';
import Syllabus from './pages/instructor/Syllabus';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetails from './pages/student/CourseDetails';
import CoursePlayer from './pages/student/CoursePlayer';
import CourseApprovals from './pages/admin/CourseApprovals';

// Placeholder Pages
const Home = () => <div className="p-8 text-2xl">Home Page</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="catalog" element={<CourseCatalog />} />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="learn/:courseId" element={<CoursePlayer />} />
          </Route>
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<CoursesList />} />
            <Route path="courses/create" element={<CreateCourse />} />
            <Route path="courses/:id/syllabus" element={<Syllabus />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="approvals" replace />} />
            <Route path="overview" element={<div className="p-8 text-2xl font-bold">Admin Overview</div>} />
            <Route path="approvals" element={<CourseApprovals />} />
            <Route path="users" element={<div className="p-8 text-2xl font-bold">User Management</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
