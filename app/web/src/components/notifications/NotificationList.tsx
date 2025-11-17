import React, { useState, useEffect } from 'react';
import { Bell, Loader2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { Button } from '../ui/Button';
import { notificationService } from '../../services/notification.service';
import type { Notification, NotificationType, NotificationPagination } from '../../types';

interface NotificationListProps {
  onNotificationRead?: () => void;
}

/**
 * NotificationList component
 * Full list view with pagination and filters
 */
export const NotificationList: React.FC<NotificationListProps> = ({ onNotificationRead }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<NotificationPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<NotificationType | ''>('');
  const [filterIsRead, setFilterIsRead] = useState<'all' | 'read' | 'unread'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, [currentPage, filterType, filterIsRead]);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        perPage: 20,
      };

      if (filterType) {
        params.type = filterType;
      }

      if (filterIsRead !== 'all') {
        params.isRead = filterIsRead === 'read';
      }

      const response = await notificationService.list(params);
      setNotifications(response.data);
      setPagination(response.pagination);
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

  const handleNotificationRead = (notificationId: string) => {
    // Update local state
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      )
    );

    // Notify parent
    onNotificationRead?.();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilterType('');
    setFilterIsRead('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterType !== '' || filterIsRead !== 'all';

  // Notification type options
  const typeOptions: { value: NotificationType | ''; label: string }[] = [
    { value: '', label: 'Todos os tipos' },
    { value: 'SCHEDULING_CONFIRMED', label: 'Agendamento confirmado' },
    { value: 'SCHEDULING_CANCELLED', label: 'Agendamento cancelado' },
    { value: 'SCHEDULING_REMINDER', label: 'Lembrete de agendamento' },
    { value: 'VACCINE_DOSE_DUE', label: 'Dose vencendo' },
    { value: 'SYSTEM_ANNOUNCEMENT', label: 'Anúncio do sistema' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
            {pagination && (
              <p className="text-sm text-gray-500 mt-1">
                {pagination.total} {pagination.total === 1 ? 'notificação' : 'notificações'}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de notificação
                </label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as NotificationType | '');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Read status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status de leitura
                </label>
                <select
                  value={filterIsRead}
                  onChange={(e) => {
                    setFilterIsRead(e.target.value as 'all' | 'read' | 'unread');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  <option value="unread">Não lidas</option>
                  <option value="read">Lidas</option>
                </select>
              </div>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Carregando notificações...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-danger-600 mb-4">{error}</p>
            <Button variant="outline" onClick={loadNotifications}>
              Tentar novamente
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters
                ? 'Tente ajustar os filtros para ver mais notificações.'
                : 'Você não tem notificações no momento.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleNotificationRead}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
