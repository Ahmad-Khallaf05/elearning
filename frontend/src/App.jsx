import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import InstructorLayout from './layouts/InstructorLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import InstructorDashboard from './pages/instructor/Dashboard';
import CoursesList from './pages/instructor/CoursesList';
import CreateCourse from './pages/instructor/CreateCourse';
import Syllabus from './pages/instructor/Syllabus';
import Wallet from './pages/instructor/Wallet';
import StudentDashboard from './pages/student/StudentDashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetails from './pages/student/CourseDetails';
import CoursePlayer from './pages/student/CoursePlayer';
import CourseApprovals from './pages/admin/CourseApprovals';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayouts from './pages/admin/AdminPayouts';
import ParentDashboard from './pages/parent/Dashboard';
import RoleLayout from './layouts/RoleLayout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/catalog" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="catalog" element={<CourseCatalog />} />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="learn/:courseId" element={<CoursePlayer />} />
          </Route>
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<CoursesList />} />
            <Route path="courses/create" element={<CreateCourse />} />
            <Route path="courses/:id/syllabus" element={<Syllabus />} />
            <Route path="wallet" element={<Wallet />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="approvals" element={<CourseApprovals />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payouts" element={<AdminPayouts />} />
          </Route>
          <Route path="/parent" element={<RoleLayout role="parent" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;