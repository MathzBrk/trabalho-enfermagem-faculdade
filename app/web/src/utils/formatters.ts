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
 * Supports partial formatting while typing
 */
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;

  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

/**
 * Remove CPF formatting
 */
export const unformatCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
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

/**
 * Format phone number (Brazilian)
 * Supports partial formatting while typing
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) {
    // Landline: (11) 3333-4444
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  // Mobile: (11) 98765-4321
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

/**
 * Remove phone formatting
 */
export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
