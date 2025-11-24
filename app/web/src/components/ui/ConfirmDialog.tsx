import type { FC } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

/**
 * Reusable confirmation dialog component
 * Used for confirming destructive or important actions
 */
export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const variantConfig = {
    danger: {
      icon: XCircle,
      iconColor: 'text-danger-600',
      iconBg: 'bg-danger-100',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning-600',
      iconBg: 'bg-warning-100',
      buttonVariant: 'warning' as const,
    },
    info: {
      icon: Info,
      iconColor: 'text-primary-600',
      iconBg: 'bg-primary-100',
      buttonVariant: 'primary' as const,
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-success-600',
      iconBg: 'bg-success-100',
      buttonVariant: 'success' as const,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={cn('mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4', config.iconBg)}>
          <Icon className={cn('h-6 w-6', config.iconColor)} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6">{message}</p>
      </div>

      {/* Actions */}
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={config.buttonVariant} onClick={handleConfirm} isLoading={isLoading} disabled={isLoading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
