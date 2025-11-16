import React from 'react';
import { NotificationList } from '../components/notifications/NotificationList';
import { DashboardLayout } from '../components/layout/DashboardLayout';

/**
 * Notifications page
 * Full page view for all user notifications with filters and pagination
 */
export const NotificationsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <NotificationList />
      </div>
    </DashboardLayout>
  );
};
