import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { RoleBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { notificationService } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '../../utils/formatters';
import { LogoutConfirmationModal } from './LogoutConfirmationModal';

const POLLING_INTERVAL = 10000; // 10 seconds

/**
 * Header component with user info and notifications
 */
export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchUnreadCount();

    // Set up polling interval
    const intervalId = setInterval(fetchUnreadCount, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: App branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Univas Enfermagem
            </h1>
            <p className="text-xs text-gray-500">Sistema de Vacinação</p>
          </div>
        </div>

        {/* Right: User info and actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationDropdown
            unreadCount={unreadCount}
            onUnreadCountChange={setUnreadCount}
          />

          {/* User info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">
                {getInitials(user.name)}
              </span>
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogoutClick}
              className="text-gray-600"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </header>
  );
};
