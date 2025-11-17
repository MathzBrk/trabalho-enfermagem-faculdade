import { api, handleApiError } from './api';
import type {
  Notification,
  ListNotificationsParams,
  ListNotificationsResponse,
  MarkAllAsReadResponse,
} from '../types';

/**
 * Notification service
 * Handles all notification-related API calls
 */
export const notificationService = {
  /**
   * List notifications with pagination and filters
   */
  list: async (params?: ListNotificationsParams): Promise<ListNotificationsResponse> => {
    try {
      const response = await api.get<ListNotificationsResponse>('/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await api.patch<Notification>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      // Provide user-friendly error messages in Portuguese
      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('own notifications')) {
        throw new Error('Você não tem permissão para acessar esta notificação.');
      }
      if (message.includes('not found')) {
        throw new Error('Notificação não encontrada.');
      }
      if (message.includes('Validation')) {
        throw new Error('Dados inválidos. Por favor, tente novamente.');
      }

      throw new Error('Erro ao marcar notificação como lida.');
    }
  },

  /**
   * Mark all notifications as read for the authenticated user
   */
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    try {
      const response = await api.patch<MarkAllAsReadResponse>('/notifications/read-all');
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      throw new Error('Erro ao marcar todas as notificações como lidas.');
    }
  },

  /**
   * Get unread count for the authenticated user
   * Uses the list endpoint with isRead=false and perPage=1 to get the total count
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<ListNotificationsResponse>('/notifications', {
        params: { isRead: false, perPage: 1 },
      });
      return response.data.pagination.total;
    } catch (error) {
      // Silently fail for unread count - don't disrupt user experience
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
};
