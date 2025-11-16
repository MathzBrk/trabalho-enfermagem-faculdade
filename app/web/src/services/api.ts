import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Axios instance with default configuration
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - token expired or invalid
    // But DON'T redirect if it's a login/register attempt (those endpoints should handle their own errors)
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                             error.config?.url?.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
      }
    }

    // Format error for consistent handling
    // Backend can return error in different formats:
    // - { success: false, error: "message" }
    // - { message: "message" }
    const responseData = error.response?.data as any;
    const errorMessage = responseData?.error || responseData?.message || error.message || 'An error occurred';

    const apiError: ApiError = {
      message: errorMessage,
      statusCode: error.response?.status || 500,
      errors: responseData?.errors,
    };

    return Promise.reject(apiError);
  }
);

/**
 * Helper to handle API errors
 */
export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message;
  }
  return 'An unexpected error occurred';
};
