import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/Dashboard';
import { LoginPage } from '../pages/Login';
import { NotificationsPage } from '../pages/Notifications';
import { NurseSchedulePage } from '../pages/NurseSchedule/NurseSchedulePage';
import { Profile } from '../pages/Profile';
import { Registration } from '../pages/Registration';
import { VaccinationCardPage } from '../pages/VaccineApplications/VaccinationCardPage';
import { VaccineApplicationsPage } from '../pages/VaccineApplications/VaccineApplicationsPage';
import { VaccineDetailsPage } from '../pages/Vaccines/VaccineDetailsPage';
import { VaccinesListPage } from '../pages/Vaccines/VaccinesListPage';
import { UserRole } from '../types';
import { ProtectedRoute } from './ProtectedRoute';

// Placeholder components for future pages
const MyVaccinesPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Minhas Vacinas</h1>
    <p className="text-gray-600 mt-2">Página em desenvolvimento</p>
  </div>
);

const UsersPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Usuários</h1>
    <p className="text-gray-600 mt-2">Página em desenvolvimento</p>
  </div>
);

const ReportsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Relatórios</h1>
    <p className="text-gray-600 mt-2">Página em desenvolvimento</p>
  </div>
);
/**
 * Main router configuration
 */
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Registration />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Employee routes */}
        <Route
          path="/my-vaccines"
          element={
            <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
              <MyVaccinesPage />
            </ProtectedRoute>
          }
        />

        {/* Nurse routes */}

        <Route
          path="/nurse-schedule"
          element={
            <ProtectedRoute allowedRoles={[UserRole.NURSE]}>
              <NurseSchedulePage />
            </ProtectedRoute>
          }
        />

        {/* Manager and Nurse routes - Vaccine Management */}
        <Route
          path="/vaccines"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.NURSE]}>
              <VaccinesListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vaccines/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.NURSE]}>
              <VaccineDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Nurse routes - Vaccine Applications */}
        <Route
          path="/vaccine-applications"
          element={
            <ProtectedRoute allowedRoles={[UserRole.NURSE]}>
              <VaccineApplicationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vaccine-applications/new"
          element={
            <ProtectedRoute allowedRoles={[UserRole.NURSE]}>
              <VaccineApplicationsPage />
            </ProtectedRoute>
          }
        />

        {/* All users - Vaccination Card (own card only) */}
        <Route
          path="/vaccination-card"
          element={
            <ProtectedRoute>
              <VaccinationCardPage />
            </ProtectedRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Common protected routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Not found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600">Página não encontrada</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
