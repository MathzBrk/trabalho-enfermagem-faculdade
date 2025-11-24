import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { SchedulingForm } from '../../components/vaccineScheduling';
import { useVaccineSchedulings } from '../../hooks/useVaccineSchedulings';
import type { CreateVaccineSchedulingData } from '../../types';

/**
 * Create Scheduling Page
 * Allows users to create a new vaccine scheduling for themselves
 */
export const CreateSchedulingPage: React.FC = () => {
  const navigate = useNavigate();
  const { createScheduling, isLoading, error } = useVaccineSchedulings();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (data: CreateVaccineSchedulingData) => {
    try {
      setSuccessMessage(null);
      await createScheduling(data);
      setSuccessMessage('Agendamento criado com sucesso!');

      // Redirect to schedulings list after 2 seconds
      setTimeout(() => {
        navigate('/schedulings');
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
      console.error('Error creating scheduling:', err);
    }
  };

  const handleCancel = () => {
    navigate('/schedulings');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/schedulings')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para agendamentos
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Novo Agendamento</h1>
          <p className="text-gray-600 mt-2">
            Agende sua próxima dose de vacina
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <SchedulingForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Info box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Informações importantes
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>A data do agendamento deve ser no futuro</li>
            <li>
              Para vacinas com múltiplas doses, você deve agendar as doses
              anteriores primeiro
            </li>
            <li>Respeite o intervalo mínimo entre as doses, se houver</li>
            <li>Você receberá uma notificação confirmando o agendamento</li>
            <li>
              Se houver um enfermeiro atribuído, ele também será notificado
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};
