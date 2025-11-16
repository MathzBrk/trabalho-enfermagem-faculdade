import { format, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export const formatDate = (date: string | Date, dateFormat = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, dateFormat);
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date string to include time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Format a CPF string
 */
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Format a COREN string
 */
export const formatCOREN = (coren: string): string => {
  const cleaned = coren.replace(/\D/g, '');
  if (cleaned.length < 6) return coren;
  return `${cleaned.slice(0, -2)}/${cleaned.slice(-2)}`;
};

/**
 * Get initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format role to display name
 */
export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    EMPLOYEE: 'Funcionário',
    NURSE: 'Enfermeiro',
    MANAGER: 'Gerente',
  };
  return roleMap[role] || role;
};

/**
 * Format status to display name
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    SCHEDULED: 'Agendado',
    APPLIED: 'Aplicado',
    MISSED: 'Perdido',
    CANCELLED: 'Cancelado',
  };
  return statusMap[status] || status;
};

/**
 * Format priority to display name
 */
export const formatPriority = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };
  return priorityMap[priority] || priority;
};

/**
 * Truncate text to a maximum length
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
