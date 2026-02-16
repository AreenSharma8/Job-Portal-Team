import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './stores/themeStore';
import { ProtectedRoute, GuestRoute } from './components/auth/ProtectedRoute';
import { MainLayout, DashboardLayout, AuthLayout } from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import CompaniesPage from './pages/CompaniesPage';

// Applicant Pages
import ApplicantDashboard from './pages/dashboard/applicant/ApplicantDashboard';
import ApplicationsPage from './pages/dashboard/applicant/ApplicationsPage';
import ProfilePage from './pages/dashboard/applicant/ProfilePage';
import BookmarksPage from './pages/dashboard/applicant/BookmarksPage';

// Employer Pages
import EmployerDashboard from './pages/dashboard/employer/EmployerDashboard';
import PostJobPage from './pages/dashboard/employer/PostJobPage';
import EmployerJobsPage from './pages/dashboard/employer/EmployerJobsPage';
import EmployerApplicationsPage from './pages/dashboard/employer/EmployerApplicationsPage';
import CompanyProfilePage from './pages/dashboard/employer/CompanyProfilePage';

// Admin Pages
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import AdminUsersPage from './pages/dashboard/admin/AdminUsersPage';
import AdminJobsPage from './pages/dashboard/admin/AdminJobsPage';

// Static
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/jobs" element={<MainLayout><JobsPage /></MainLayout>} />
      <Route path="/jobs/:id" element={<MainLayout><JobDetailPage /></MainLayout>} />
      <Route path="/companies" element={<MainLayout><CompaniesPage /></MainLayout>} />

      {/* Auth Routes */}
      <Route path="/login" element={<GuestRoute><AuthLayout><LoginPage /></AuthLayout></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthLayout><RegisterPage /></AuthLayout></GuestRoute>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />

      {/* Applicant Routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['applicant']}><DashboardLayout><ApplicantDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/applications" element={<ProtectedRoute roles={['applicant']}><DashboardLayout><ApplicationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute roles={['applicant', 'employer']}><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/bookmarks" element={<ProtectedRoute roles={['applicant']}><DashboardLayout><BookmarksPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/notifications" element={<ProtectedRoute><DashboardLayout><NotificationsPage /></DashboardLayout></ProtectedRoute>} />

      {/* Employer Routes */}
      <Route path="/dashboard/employer" element={<ProtectedRoute roles={['employer']}><DashboardLayout><EmployerDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/post-job" element={<ProtectedRoute roles={['employer']}><DashboardLayout><PostJobPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/jobs" element={<ProtectedRoute roles={['employer']}><DashboardLayout><EmployerJobsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/employer/applications" element={<ProtectedRoute roles={['employer']}><DashboardLayout><EmployerApplicationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/company" element={<ProtectedRoute roles={['employer']}><DashboardLayout><CompanyProfilePage /></DashboardLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/admin/users" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminUsersPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/admin/jobs" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminJobsPage /></DashboardLayout></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
    </Routes>
  );
}

export default App;
