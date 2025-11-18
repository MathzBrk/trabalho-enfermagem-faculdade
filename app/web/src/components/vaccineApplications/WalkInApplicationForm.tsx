import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateWalkInApplicationSchema, APPLICATION_SITES } from '../../utils/vaccineApplicationSchemas';
import type { CreateWalkInApplicationFormData } from '../../utils/vaccineApplicationSchemas';
import type { User, Vaccine, VaccineBatch } from '../../types';
import { FormInput } from '../common/FormInput';
import { Button } from '../ui/Button';
import { ModalFooter } from '../ui/Modal';
import { userService } from '../../services/user.service';
import { vaccineService } from '../../services/vaccine.service';

interface WalkInApplicationFormProps {
  onSubmit: (data: CreateWalkInApplicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Form component for recording walk-in vaccine applications
 * Requires manual selection of patient, vaccine, dose, and batch
 */
export const WalkInApplicationForm: React.FC<WalkInApplicationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [batches, setBatches] = useState<VaccineBatch[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(CreateWalkInApplicationSchema),
    defaultValues: {
      receivedById: '',
      vaccineId: '',
      doseNumber: 1,
      batchId: '',
      applicationSite: '',
      observations: '',
    },
  });

  const selectedVaccineId = watch('vaccineId');

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const userList = await userService.listUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch vaccines on mount
  useEffect(() => {
    const fetchVaccines = async () => {
      setLoadingVaccines(true);
      try {
        const response = await vaccineService.list({ page: 1, perPage: 100 });
        setVaccines(response.data);
      } catch (error) {
        console.error('Error fetching vaccines:', error);
      } finally {
        setLoadingVaccines(false);
      }
    };

    fetchVaccines();
  }, []);

  // Fetch batches when vaccine is selected
  useEffect(() => {
    if (!selectedVaccineId) {
      setBatches([]);
      return;
    }

    const fetchBatches = async () => {
      setLoadingBatches(true);
      try {
        const response = await vaccineService.getBatches(selectedVaccineId, {
          page: 1,
          perPage: 100,
          status: 'AVAILABLE',
        });
        // Filter batches with quantity > 0
        const availableBatches = response.data.filter(batch => batch.currentQuantity > 0);
        setBatches(availableBatches);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [selectedVaccineId]);

  const handleFormSubmit = async (data: CreateWalkInApplicationFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const selectedVaccine = vaccines.find(v => v.id === selectedVaccineId);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Patient and Vaccine Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
          Paciente e Vacina
        </h3>

        <div>
          <label htmlFor="receivedById" className="block text-sm font-medium text-gray-700 mb-1.5">
            Paciente <span className="text-danger-500">*</span>
          </label>
          {loadingUsers ? (
            <p className="text-sm text-gray-500">Carregando pacientes...</p>
          ) : (
            <select
              id="receivedById"
              {...register('receivedById')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.receivedById ? 'border-danger-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Selecione o paciente</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
          )}
          {errors.receivedById && (
            <p className="mt-1 text-sm text-danger-600">{errors.receivedById.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="vaccineId" className="block text-sm font-medium text-gray-700 mb-1.5">
            Vacina <span className="text-danger-500">*</span>
          </label>
          {loadingVaccines ? (
            <p className="text-sm text-gray-500">Carregando vacinas...</p>
          ) : (
            <select
              id="vaccineId"
              {...register('vaccineId')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.vaccineId ? 'border-danger-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Selecione a vacina</option>
              {vaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.name} - {vaccine.manufacturer}
                </option>
              ))}
            </select>
          )}
          {errors.vaccineId && (
            <p className="mt-1 text-sm text-danger-600">{errors.vaccineId.message}</p>
          )}
          {selectedVaccine && (
            <p className="mt-1 text-xs text-gray-500">
              Doses necessárias: {selectedVaccine.dosesRequired}
              {selectedVaccine.intervalDays && ` | Intervalo: ${selectedVaccine.intervalDays} dias`}
            </p>
          )}
        </div>

        <FormInput
          label="Número da Dose"
          type="number"
          placeholder="1"
          min="1"
          max="10"
          register={register('doseNumber', { valueAsNumber: true })}
          error={errors.doseNumber?.message}
          required
          helperText={selectedVaccine ? `Esta vacina requer ${selectedVaccine.dosesRequired} dose(s)` : undefined}
        />
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
          {!selectedVaccineId ? (
            <p className="text-sm text-gray-500">Selecione uma vacina primeiro</p>
          ) : loadingBatches ? (
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
          disabled={isLoading || !isDirty}
        >
          Registrar Aplicação
        </Button>
      </ModalFooter>
    </form>
  );
};
