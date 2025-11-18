import React from 'react';
import { CheckCircle2, Circle, Syringe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { VaccineWithDoses } from '../../types';

interface VaccinesByTypeListProps {
  vaccinesByType: VaccineWithDoses[];
}

/**
 * Display vaccines grouped by type with all doses applied
 */
export const VaccinesByTypeList: React.FC<VaccinesByTypeListProps> = ({ vaccinesByType }) => {
  if (vaccinesByType.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma vacina aplicada ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {vaccinesByType.map((item) => (
        <Card key={item.vaccine.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{item.vaccine.name}</CardTitle>
                  {item.vaccine.isObligatory && (
                    <Badge variant="info" size="sm">
                      Obrigatória
                    </Badge>
                  )}
                  {item.isComplete ? (
                    <Badge variant="success" size="sm">
                      Completa
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Em Andamento
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.vaccine.manufacturer}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600">
                  Progresso: {item.dosesApplied} de {item.totalDosesRequired} doses
                </span>
                <span className="font-medium text-gray-900">{item.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.isComplete ? 'bg-success-600' : 'bg-warning-600'
                  }`}
                  style={{ width: `${item.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Doses List */}
            <div className="space-y-3">
              {item.doses.map((dose) => (
                <div
                  key={dose.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">Dose {dose.doseNumber}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(dose.applicationDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      Local: {dose.applicationSite}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      Lote: {dose.batch.batchNumber} - Validade:{' '}
                      {new Date(dose.batch.expirationDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">
                      Aplicado por: {dose.appliedBy.name}
                      {dose.appliedBy.coren && ` - ${dose.appliedBy.coren}`}
                    </p>
                    {dose.observations && (
                      <p className="text-xs text-gray-500 mt-2 italic">{dose.observations}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Pending Doses */}
              {!item.isComplete &&
                Array.from({ length: item.totalDosesRequired - item.dosesApplied }).map((_, index) => (
                  <div
                    key={`pending-${index}`}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-dashed border-gray-300"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Circle className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        Dose {item.dosesApplied + index + 1}
                      </p>
                      <p className="text-xs text-gray-400">Pendente</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
