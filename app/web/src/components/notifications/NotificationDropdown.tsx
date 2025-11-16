import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from './NotificationItem';
import { Button } from '../ui/Button';
import { notificationService } from '../../services/notification.service';
import type { Notification } from '../../types';

interface NotificationDropdownProps {
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

/**
 * NotificationDropdown component
 * Dropdown menu that shows recent notifications from the header bell icon
 */
export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  unreadCount,
  onUnreadCountChange,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationService.list({ page: 1, perPage: 10 });
      setNotifications(response.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar notificações.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    setError(null);

    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );

      // Update unread count
      onUnreadCountChange(0);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao marcar todas como lidas.');
      }
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleNotificationRead = (notificationId: string) => {
    // Update local state
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      )
    );

    // Update unread count
    onUnreadCountChange(Math.max(0, unreadCount - 1));
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const hasUnread = unreadCount > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificações"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-danger-500 text-white text-xs items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Notificações
                {hasUnread && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({unreadCount} {unreadCount === 1 ? 'nova' : 'novas'})
                  </span>
                )}
              </h3>
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead}
                  className="text-xs"
                >
                  {isMarkingAllRead ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Marcando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="h-3 w-3" />
                      <span>Marcar todas como lidas</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Carregando...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-danger-600">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadNotifications}
                  className="mt-2"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 text-center">
                  Nenhuma notificação encontrada
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-2">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={handleNotificationRead}
                      compact
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAll}
                className="w-full justify-center"
              >
                Ver todas as notificações
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
