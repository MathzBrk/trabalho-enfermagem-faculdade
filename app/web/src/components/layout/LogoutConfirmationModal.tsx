import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Modal de confirmação para logout
 * Exibe uma mensagem de confirmação antes do usuário fazer logout
 */
export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center py-4">
        {/* Message */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Deseja realmente sair?
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Você será desconectado do sistema e precisará fazer login novamente.
        </p>
      </div>

      <div className="flex items-center justify-center-safe gap-3 px-6 pb-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Sair
        </Button>
      </div>
    </Modal>
  );
};
