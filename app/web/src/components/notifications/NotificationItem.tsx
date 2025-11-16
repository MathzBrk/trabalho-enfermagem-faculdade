import React, { useState } from 'react';
import {
  Calendar,
  CalendarX,
  Bell,
  Syringe,
  Megaphone,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification, NotificationType } from '../../types';
import { notificationService } from '../../services/notification.service';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (notificationId: string) => void;
  compact?: boolean;
}

/**
 * Get icon and color for notification type
 */
const getNotificationStyle = (type: NotificationType) => {
  switch (type) {
    case 'SCHEDULING_CONFIRMED':
      return {
        icon: Calendar,
        bgColor: 'bg-success-100',
        iconColor: 'text-success-600',
        borderColor: 'border-success-200',
      };
    case 'SCHEDULING_CANCELLED':
      return {
        icon: CalendarX,
        bgColor: 'bg-danger-100',
        iconColor: 'text-danger-600',
        borderColor: 'border-danger-200',
      };
    case 'SCHEDULING_REMINDER':
      return {
        icon: Bell,
        bgColor: 'bg-warning-100',
        iconColor: 'text-warning-600',
        borderColor: 'border-warning-200',
      };
    case 'VACCINE_DOSE_DUE':
      return {
        icon: Syringe,
        bgColor: 'bg-primary-100',
        iconColor: 'text-primary-600',
        borderColor: 'border-primary-200',
      };
    case 'SYSTEM_ANNOUNCEMENT':
      return {
        icon: Megaphone,
        bgColor: 'bg-info-100',
        iconColor: 'text-info-600',
        borderColor: 'border-info-200',
      };
    default:
      return {
        icon: Bell,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
        borderColor: 'border-gray-200',
      };
  }
};

/**
 * Format timestamp to relative time
 */
const formatRelativeTime = (date: string): string => {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * NotificationItem component
 * Displays a single notification with icon, title, message, and timestamp
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  compact = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const style = getNotificationStyle(notification.type);
  const Icon = style.icon;

  const handleClick = async () => {
    // If already read, just navigate
    if (notification.isRead) {
      handleNavigation();
      return;
    }

    // Mark as read first
    setIsLoading(true);
    setError(null);

    try {
      await notificationService.markAsRead(notification.id);
      onMarkAsRead?.(notification.id);

      // Navigate if there's a related resource
      handleNavigation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar como lida');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = () => {
    // Deep linking based on metadata
    const metadata = notification.metadata as any;
    if (metadata?.schedulingId) {
      // Navigate to scheduling details (when implemented)
      // navigate(`/schedulings/${metadata.schedulingId}`);
      console.log('Navigate to scheduling:', metadata.schedulingId);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (notification.isRead) return;

    setIsLoading(true);
    setError(null);

    try {
      await notificationService.markAsRead(notification.id);
      onMarkAsRead?.(notification.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar como lida');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`
        relative border rounded-lg transition-all
        ${notification.isRead ? 'bg-white border-gray-200' : `bg-gray-50 ${style.borderColor} border-l-4`}
        ${!notification.isRead && !compact ? 'hover:shadow-md' : 'hover:bg-gray-50'}
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${compact ? 'p-3' : 'p-4'}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.bgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${style.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                {notification.message}
              </p>
            </div>

            {/* Mark as read button for unread notifications */}
            {!notification.isRead && !compact && (
              <button
                onClick={handleMarkAsRead}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded transition-colors"
                aria-label="Marcar como lida"
                title="Marcar como lida"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {notification.isRead && notification.readAt && (
              <span className="text-xs text-gray-400">• Lida</span>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-2 text-xs text-danger-600">
              {error}
            </div>
          )}
        </div>

        {/* Unread indicator dot */}
        {!notification.isRead && compact && (
          <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2" />
        )}
      </div>
    </div>
  );
};
