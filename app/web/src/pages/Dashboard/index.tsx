import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmployeeDashboard } from './EmployeeDashboard';
import { NurseDashboard } from './NurseDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { UserRole } from '../../types';

/**
 * Main Dashboard component - Routes to role-specific dashboards
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.EMPLOYEE:
        return <EmployeeDashboard />;
      case UserRole.NURSE:
        return <NurseDashboard />;
      case UserRole.MANAGER:
        return <ManagerDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Tipo de usuário não reconhecido</p>
          </div>
        );
    }
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
};
