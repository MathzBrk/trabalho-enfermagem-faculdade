import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { PendingDose } from '../../types';

interface PendingDosesListProps {
  pendingDoses: PendingDose[];
}

/**
 * Display list of pending vaccine doses
 */
export const PendingDosesList: React.FC<PendingDosesListProps> = ({ pendingDoses }) => {
  if (pendingDoses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning-600" />
          Doses Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingDoses.map((pending, index) => {
            const expectedDate = new Date(pending.expectedDate);
            const today = new Date();
            const isOverdue = expectedDate < today;

            return (
              <div
                key={`${pending.vaccine.id}-${index}`}
                className="flex items-start gap-3 p-3 bg-warning-50 rounded-lg border border-warning-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Calendar className="h-5 w-5 text-warning-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {pending.vaccine.name}
                      </p>
                      <p className="text-xs text-gray-600">{pending.vaccine.manufacturer}</p>
                    </div>
                    {pending.vaccine.isObligatory && (
                      <Badge variant="danger" size="sm">
                        Obrigatória
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">
                      Próxima dose: <span className="font-medium">{pending.nextDose}</span> de{' '}
                      {pending.vaccine.dosesRequired}
                    </p>
                    <p className="text-xs text-gray-600">
                      Última dose aplicada: <span className="font-medium">{pending.currentDose}</span>
                    </p>
                    <p className={`text-xs font-medium ${isOverdue ? 'text-danger-600' : 'text-warning-600'}`}>
                      Data esperada: {expectedDate.toLocaleDateString('pt-BR')}
                      {isOverdue && ' (Atrasada)'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
