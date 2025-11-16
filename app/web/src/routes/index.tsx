import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/Login';
import { Registration } from '../pages/Registration';
import { DashboardPage } from '../pages/Dashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../types';

// Placeholder components for future pages
const MyVaccinesPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Minhas Vacinas</h1>
    <p className="text-gray-600 mt-2">Página em desenvolvimento</p>
  </div>
);

const SchedulePage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Agenda</h1>
    <p className="text-gray-600 mt-2">Página em desenvolvimento</p>
  </div>
);

const VaccinesPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Gerenciar Vacinas</h1>
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

const ProfilePage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Perfil</h1>
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
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={[UserRole.NURSE]}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/vaccines"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
              <VaccinesPage />
            </ProtectedRoute>
          }
        />

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
              <ProfilePage />
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
