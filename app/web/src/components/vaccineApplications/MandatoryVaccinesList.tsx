import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { MandatoryVaccineNotTaken } from '../../types';

interface MandatoryVaccinesListProps {
  mandatoryNotTaken: MandatoryVaccineNotTaken[];
}

/**
 * Display list of mandatory vaccines not yet taken
 */
export const MandatoryVaccinesList: React.FC<MandatoryVaccinesListProps> = ({
  mandatoryNotTaken,
}) => {
  if (mandatoryNotTaken.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger-600" />
          Vacinas Obrigatórias Não Iniciadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mandatoryNotTaken.map((vaccine) => (
            <div
              key={vaccine.id}
              className="flex items-start gap-3 p-3 bg-danger-50 rounded-lg border border-danger-200"
            >
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-danger-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vaccine.name}</p>
                    <p className="text-xs text-gray-600">{vaccine.manufacturer}</p>
                  </div>
                  <Badge variant="danger" size="sm">
                    Obrigatória
                  </Badge>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">
                    Doses necessárias: <span className="font-medium">{vaccine.dosesRequired}</span>
                  </p>
                  {vaccine.intervalDays && (
                    <p className="text-xs text-gray-600">
                      Intervalo entre doses: <span className="font-medium">{vaccine.intervalDays} dias</span>
                    </p>
                  )}
                  <p className="text-xs text-danger-600 font-medium mt-2">
                    Esta vacina ainda não foi iniciada
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
