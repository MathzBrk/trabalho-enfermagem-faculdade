import type React from 'react';
import { Clock, User, Syringe, FileText, X, UserCog } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { MonthlySchedulingItem } from '../../services/vaccineScheduling.service';

interface SchedulingCardProps {
  scheduling: MonthlySchedulingItem;
  onApplyVaccine?: (schedulingId: string) => void;
  onCancelScheduling?: (schedulingId: string) => void;
  onReassignNurse?: (schedulingId: string) => void;
}

/**
 * SchedulingCard - Displays individual scheduling information
 */
export const SchedulingCard: React.FC<SchedulingCardProps> = ({
  scheduling,
  onApplyVaccine,
  onCancelScheduling,
  onReassignNurse,
}) => {
  const getStatusBadge = () => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      SCHEDULED: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Agendado',
      },
      CONFIRMED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Confirmado',
      },
      COMPLETED: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: 'Concluído',
      },
      CANCELLED: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Cancelado',
      },
    };

    const config = statusConfig[scheduling.status] || statusConfig.SCHEDULED;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {formatTime(scheduling.scheduledDate)}
              </p>
              <p className="text-xs text-gray-500">Horário do agendamento</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          {/* Patient Info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <span className="font-medium text-gray-700">Paciente:</span>{' '}
              <span className="text-gray-900">{scheduling.user.name}</span>
            </div>
          </div>

          {/* Vaccine Info */}
          <div className="flex items-center gap-2 text-sm">
            <Syringe className="h-4 w-4 text-gray-400" />
            <div>
              <span className="font-medium text-gray-700">Vacina:</span>{' '}
              <span className="text-gray-900">
                {scheduling.vaccine.name} ({scheduling.vaccine.manufacturer})
              </span>
            </div>
          </div>

          {/* Dose Info */}
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <div>
              <span className="font-medium text-gray-700">Dose:</span>{' '}
              <span className="text-gray-900">
                {scheduling.doseNumber}ª de {scheduling.vaccine.dosesRequired}
              </span>
            </div>
          </div>

          {/* Notes */}
          {scheduling.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <span className="font-medium">Observações:</span> {scheduling.notes}
            </div>
          )}

          {/* Application Info if completed */}
          {scheduling.application && (
            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
              Aplicado em:{' '}
              {new Date(scheduling.application.applicationDate).toLocaleString('pt-BR')}
              {' - Local: '}
              {scheduling.application.applicationSite}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(scheduling.status === 'SCHEDULED' || scheduling.status === 'CONFIRMED') && !scheduling.application && (
          <div className="mt-4 space-y-2">
            {/* Apply Vaccine Button */}
            {onApplyVaccine && (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => onApplyVaccine(scheduling.id)}
              >
                <Syringe className="h-4 w-4 mr-2" />
                Aplicar Vacina
              </Button>
            )}

            {/* Secondary actions in a row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Reassign Nurse Button */}
              {onReassignNurse && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReassignNurse(scheduling.id)}
                  title="Atribuir outra enfermeira"
                >
                  <UserCog className="h-4 w-4 mr-1" />
                  Reatribuir
                </Button>
              )}

              {/* Cancel Scheduling Button */}
              {onCancelScheduling && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onCancelScheduling(scheduling.id)}
                  title="Cancelar agendamento"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
