import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { VaccineScheduling, VaccineSchedulingStatus } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SchedulingCardProps {
  scheduling: VaccineScheduling;
  showUserInfo?: boolean;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Get badge variant for scheduling status
 */
const getStatusBadgeVariant = (status: VaccineSchedulingStatus): 'info' | 'success' | 'danger' | 'default' => {
  switch (status) {
    case 'SCHEDULED':
      return 'info';
    case 'CONFIRMED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'COMPLETED':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Get label for scheduling status
 */
const getStatusLabel = (status: VaccineSchedulingStatus): string => {
  switch (status) {
    case 'SCHEDULED':
      return 'Agendado';
    case 'CONFIRMED':
      return 'Confirmado';
    case 'CANCELLED':
      return 'Cancelado';
    case 'COMPLETED':
      return 'Concluído';
    default:
      return status;
  }
};

/**
 * SchedulingCard component
 * Displays a vaccine scheduling with actions
 */
export const SchedulingCard: React.FC<SchedulingCardProps> = ({
  scheduling,
  showUserInfo = false,
  onConfirm,
  onCancel,
  onViewDetails,
  isLoading = false,
}) => {
  const scheduledDate = parseISO(scheduling.scheduledDate);
  const formattedDate = format(scheduledDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedTime = format(scheduledDate, 'HH:mm', { locale: ptBR });

  const canConfirm = scheduling.status === 'SCHEDULED' && onConfirm;
  const canCancel = (scheduling.status === 'SCHEDULED' || scheduling.status === 'CONFIRMED') && onCancel;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header with vaccine name and status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {scheduling.vaccine?.name || 'Vacina não especificada'}
              </h3>
              {scheduling.vaccine?.manufacturer && (
                <p className="text-sm text-gray-600">{scheduling.vaccine.manufacturer}</p>
              )}
            </div>
            <Badge variant={getStatusBadgeVariant(scheduling.status)}>
              {getStatusLabel(scheduling.status)}
            </Badge>
          </div>

          {/* Patient info (if showUserInfo is true) */}
          {showUserInfo && scheduling.user && (
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-medium text-gray-700">Paciente</p>
              <p className="text-sm text-gray-900">{scheduling.user.name}</p>
              <p className="text-xs text-gray-600">{scheduling.user.email}</p>
            </div>
          )}

          {/* Date and time */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">{formattedTime}</span>
            </div>
          </div>

          {/* Dose number */}
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-gray-700">
              Dose {scheduling.doseNumber}
              {scheduling.vaccine?.dosesRequired && ` de ${scheduling.vaccine.dosesRequired}`}
            </span>
          </div>

          {/* Assigned nurse */}
          {scheduling.assignedNurse && (
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-700">
                Enfermeiro(a): {scheduling.assignedNurse.name}
              </span>
            </div>
          )}

          {/* Notes */}
          {scheduling.notes && (
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Observações</p>
              <p className="text-sm text-gray-600">{scheduling.notes}</p>
            </div>
          )}

          {/* Actions */}
          {(canConfirm || canCancel || onViewDetails) && (
            <div className="flex items-center gap-2 border-t border-gray-200 pt-3">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(scheduling.id)}
                  disabled={isLoading}
                >
                  Detalhes
                </Button>
              )}
              {canConfirm && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onConfirm(scheduling.id)}
                  disabled={isLoading}
                >
                  Confirmar
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onCancel(scheduling.id)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
