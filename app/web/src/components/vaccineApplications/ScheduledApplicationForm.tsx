import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateScheduledApplicationSchema, APPLICATION_SITES } from '../../utils/vaccineApplicationSchemas';
import type { CreateScheduledApplicationFormData } from '../../utils/vaccineApplicationSchemas';
import type { VaccineScheduling, VaccineBatch } from '../../types';
import { Button } from '../ui/Button';
import { ModalFooter } from '../ui/Modal';
import { vaccineService } from '../../services/vaccine.service';

interface ScheduledApplicationFormProps {
  scheduling: VaccineScheduling;
  onSubmit: (data: CreateScheduledApplicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Form component for recording scheduled vaccine applications
 * Pre-fills patient, vaccine, and dose information from scheduling
 */
export const ScheduledApplicationForm: React.FC<ScheduledApplicationFormProps> = ({
  scheduling,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [batches, setBatches] = useState<VaccineBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateScheduledApplicationFormData>({
    resolver: zodResolver(CreateScheduledApplicationSchema),
    defaultValues: {
      schedulingId: scheduling.id,
      batchId: '',
      applicationSite: '',
      observations: '',
    },
  });

  // Fetch available batches for this vaccine
  useEffect(() => {
    const fetchBatches = async () => {
      setLoadingBatches(true);
      try {
        const response = await vaccineService.getBatches(scheduling.vaccineId, {
          page: 1,
          perPage: 100,
          status: 'AVAILABLE',
        });
        // Filter batches with quantity > 0
        const availableBatches = response.data.filter(batch => batch.currentQuantity > 0);
        setBatches(availableBatches);
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [scheduling.vaccineId]);

  const handleFormSubmit = async (data: CreateScheduledApplicationFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Scheduling Information (Read-only) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
          Informações do Agendamento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Paciente</label>
            <p className="mt-1 text-sm text-gray-900">{scheduling.user?.name || 'Carregando...'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vacina</label>
            <p className="mt-1 text-sm text-gray-900">{scheduling.vaccine?.name || 'Carregando...'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dose</label>
            <p className="mt-1 text-sm text-gray-900">Dose {scheduling.doseNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data Agendada</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(scheduling.scheduledDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
          Detalhes da Aplicação
        </h3>

        <div>
          <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-1.5">
            Lote da Vacina <span className="text-danger-500">*</span>
          </label>
          {loadingBatches ? (
            <p className="text-sm text-gray-500">Carregando lotes disponíveis...</p>
          ) : batches.length === 0 ? (
            <p className="text-sm text-danger-600">Nenhum lote disponível para esta vacina</p>
          ) : (
            <select
              id="batchId"
              {...register('batchId')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.batchId ? 'border-danger-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Selecione um lote</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchNumber} - Qtd: {batch.currentQuantity} - Validade:{' '}
                  {new Date(batch.expirationDate).toLocaleDateString('pt-BR')}
                </option>
              ))}
            </select>
          )}
          {errors.batchId && (
            <p className="mt-1 text-sm text-danger-600">{errors.batchId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="applicationSite" className="block text-sm font-medium text-gray-700 mb-1.5">
            Local de Aplicação <span className="text-danger-500">*</span>
          </label>
          <select
            id="applicationSite"
            {...register('applicationSite')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.applicationSite ? 'border-danger-300' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Selecione o local</option>
            {APPLICATION_SITES.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
          {errors.applicationSite && (
            <p className="mt-1 text-sm text-danger-600">{errors.applicationSite.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1.5">
            Observações
          </label>
          <textarea
            id="observations"
            {...register('observations')}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.observations ? 'border-danger-300' : 'border-gray-300'
            }`}
            placeholder="Reações adversas, condições especiais, etc. (opcional)"
            disabled={isLoading}
          />
          {errors.observations && (
            <p className="mt-1 text-sm text-danger-600">{errors.observations.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Máximo de 500 caracteres</p>
        </div>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || !isDirty || batches.length === 0}
        >
          Registrar Aplicação
        </Button>
      </ModalFooter>
    </form>
  );
};
