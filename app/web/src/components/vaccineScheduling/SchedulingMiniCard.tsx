import React from 'react';
import type { VaccineScheduling } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SchedulingMiniCardProps {
  scheduling: VaccineScheduling;
}

/**
 * SchedulingMiniCard component
 * Compact card to display scheduling info in vaccine application form
 */
export const SchedulingMiniCard: React.FC<SchedulingMiniCardProps> = ({ scheduling }) => {
  const scheduledDate = parseISO(scheduling.scheduledDate);
  const formattedTime = format(scheduledDate, 'HH:mm', { locale: ptBR });
  const formattedDate = format(scheduledDate, "dd/MM/yyyy", { locale: ptBR });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Header with emoji and title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              Agendamento Confirmado
            </h3>
            <p className="text-primary-100 text-sm">
              {formattedDate} às {formattedTime}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 space-y-3">
          {/* Vaccine */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg shrink-0 mt-0.5">
              <span className="text-base">💉</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vacina
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {scheduling.vaccine?.name}
              </p>
              {scheduling.vaccine?.manufacturer && (
                <p className="text-xs text-gray-600">
                  {scheduling.vaccine.manufacturer}
                </p>
              )}
            </div>
          </div>

          {/* Patient */}
          {scheduling.user && (
            <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg shrink-0 mt-0.5">
                <span className="text-base">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Paciente
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {scheduling.user.name}
                </p>
                <p className="text-xs text-gray-600">
                  {scheduling.user.email}
                </p>
              </div>
            </div>
          )}

          {/* Dose Number */}
          <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg shrink-0 mt-0.5">
              <span className="text-base">🔢</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Dose
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {scheduling.doseNumber}ª dose
                {scheduling.vaccine?.dosesRequired && (
                  <span className="text-gray-600 font-normal">
                    {' '}de {scheduling.vaccine.dosesRequired}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Nurse (if assigned) */}
          {scheduling.assignedNurse && (
            <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg shrink-0 mt-0.5">
                <span className="text-base">👨‍⚕️</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Enfermeiro(a) Responsável
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {scheduling.assignedNurse.name}
                </p>
                {scheduling.assignedNurse.coren && (
                  <p className="text-xs text-gray-600">
                    COREN: {scheduling.assignedNurse.coren}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">
              Pronto para Aplicação
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
