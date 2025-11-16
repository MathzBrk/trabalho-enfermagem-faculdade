import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Badge component for status indicators and labels
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center font-medium rounded-full whitespace-nowrap';

    const variants = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-success-50 text-success-700',
      warning: 'bg-warning-50 text-warning-700',
      danger: 'bg-danger-50 text-danger-600',
      info: 'bg-primary-50 text-primary-700',
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-1',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Role Badge component
 */
export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleVariants: Record<string, BadgeVariant> = {
    EMPLOYEE: 'default',
    NURSE: 'info',
    MANAGER: 'success',
  };

  const roleLabels: Record<string, string> = {
    EMPLOYEE: 'Funcionário',
    NURSE: 'Enfermeiro',
    MANAGER: 'Gerente',
  };

  return (
    <Badge variant={roleVariants[role] || 'default'}>
      {roleLabels[role] || role}
    </Badge>
  );
};

/**
 * Status Badge component
 */
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusVariants: Record<string, BadgeVariant> = {
    SCHEDULED: 'info',
    APPLIED: 'success',
    MISSED: 'warning',
    CANCELLED: 'danger',
  };

  const statusLabels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    APPLIED: 'Aplicado',
    MISSED: 'Perdido',
    CANCELLED: 'Cancelado',
  };

  return (
    <Badge variant={statusVariants[status] || 'default'}>
      {statusLabels[status] || status}
    </Badge>
  );
};

/**
 * Priority Badge component
 */
export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const priorityVariants: Record<string, BadgeVariant> = {
    LOW: 'default',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'danger',
  };

  const priorityLabels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };

  return (
    <Badge variant={priorityVariants[priority] || 'default'}>
      {priorityLabels[priority] || priority}
    </Badge>
  );
};
