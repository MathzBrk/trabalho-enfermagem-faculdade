import React from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { MandatoryVaccineNotTaken } from '../../types';

interface OptionalVaccinesListProps {
  optionalNotTaken: MandatoryVaccineNotTaken[];
}

/**
 * Display list of optional vaccines not yet taken
 */
export const OptionalVaccinesList: React.FC<OptionalVaccinesListProps> = ({
  optionalNotTaken,
}) => {
  if (optionalNotTaken.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Vacinas Opcionais Não Iniciadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {optionalNotTaken.map((vaccine) => (
            <div
              key={vaccine.id}
              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex-shrink-0 mt-0.5">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vaccine.name}</p>
                    <p className="text-xs text-gray-600">{vaccine.manufacturer}</p>
                  </div>
                  <Badge variant="info" size="sm">
                    Opcional
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
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    Esta vacina opcional ainda não foi iniciada
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
