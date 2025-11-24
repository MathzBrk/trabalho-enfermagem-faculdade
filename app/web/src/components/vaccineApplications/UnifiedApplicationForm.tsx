import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateScheduledApplicationSchema, CreateWalkInApplicationSchema, APPLICATION_SITES } from '../../utils/vaccineApplicationSchemas';
import type { CreateScheduledApplicationFormData, CreateWalkInApplicationFormData } from '../../utils/vaccineApplicationSchemas';
import type { User, Vaccine, VaccineBatch, VaccineScheduling } from '../../types';
import { FormInput } from '../common/FormInput';
import { Button } from '../ui/Button';
import { ModalFooter } from '../ui/Modal';
import { SchedulingMiniCard } from '../vaccineScheduling/SchedulingMiniCard';
import { userService } from '../../services/user.service';
import { vaccineService } from '../../services/vaccine.service';

type ApplicationType = 'scheduled' | 'walkin';

interface UnifiedApplicationFormProps {
  onSubmit: (data: CreateScheduledApplicationFormData | CreateWalkInApplicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Unified form component for recording both scheduled and walk-in vaccine applications
 * Features a radio selector at the top to switch between application types
 */
export const UnifiedApplicationForm: React.FC<UnifiedApplicationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Application type state
  const [applicationType, setApplicationType] = useState<ApplicationType>('scheduled');

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [batches, setBatches] = useState<VaccineBatch[]>([]);
  const [schedulings, setSchedulings] = useState<VaccineScheduling[]>([]);
  const [selectedScheduling, setSelectedScheduling] = useState<VaccineScheduling | null>(null);

  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingSchedulings, setLoadingSchedulings] = useState(false);

  // Separate forms for scheduled and walk-in to avoid TypeScript issues
  const scheduledForm = useForm<CreateScheduledApplicationFormData>({
    resolver: zodResolver(CreateScheduledApplicationSchema),
    defaultValues: {
      schedulingId: '',
      batchId: '',
      applicationSite: '',
      observations: '',
    },
  });

  const walkInForm = useForm<CreateWalkInApplicationFormData>({
    resolver: zodResolver(CreateWalkInApplicationSchema) as any,
    defaultValues: {
      receivedById: '',
      vaccineId: '',
      doseNumber: 1,
      batchId: '',
      applicationSite: '',
      observations: '',
    },
  });

  const selectedSchedulingId = scheduledForm.watch('schedulingId');
  const selectedVaccineId = walkInForm.watch('vaccineId');

  // Reset forms when application type changes
  useEffect(() => {
    if (applicationType === 'scheduled') {
      scheduledForm.reset({
        schedulingId: '',
        batchId: '',
        applicationSite: '',
        observations: '',
      });
    } else {
      walkInForm.reset({
        receivedById: '',
        vaccineId: '',
        doseNumber: 1,
        batchId: '',
        applicationSite: '',
        observations: '',
      });
    }
    setSelectedScheduling(null);
    setBatches([]);
  }, [applicationType, scheduledForm, walkInForm]);

  // Fetch today's schedulings for scheduled applications
  useEffect(() => {
    if (applicationType !== 'scheduled') return;

    const fetchSchedulings = async () => {
      setLoadingSchedulings(true);
      try {
        // Use the vaccine scheduling service to get today's schedulings
        const { vaccineSchedulingService } = await import('../../services/vaccineScheduling.service');
        const todaySchedulings = await vaccineSchedulingService.getByDate();
        // Filter only SCHEDULED and CONFIRMED appointments
        const activeSchedulings = todaySchedulings.filter(
          (s) => s.status === 'SCHEDULED' || s.status === 'CONFIRMED'
        );
        setSchedulings(activeSchedulings);
      } catch (err) {
        console.error('Error fetching schedulings:', err);
        setSchedulings([]);
      } finally {
        setLoadingSchedulings(false);
      }
    };

    fetchSchedulings();
  }, [applicationType]);

  // Fetch users for walk-in applications
  useEffect(() => {
    if (applicationType !== 'walkin') return;

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
  }, [applicationType]);

  // Fetch vaccines for walk-in applications
  useEffect(() => {
    if (applicationType !== 'walkin') return;

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
  }, [applicationType]);

  // Update selected scheduling when schedulingId changes
  useEffect(() => {
    if (applicationType !== 'scheduled' || !selectedSchedulingId) {
      setSelectedScheduling(null);
      return;
    }

    const scheduling = schedulings.find(s => s.id === selectedSchedulingId);
    setSelectedScheduling(scheduling || null);
  }, [applicationType, selectedSchedulingId, schedulings]);

  // Fetch batches when vaccine is determined (either from scheduling or direct selection)
  useEffect(() => {
    const vaccineId = applicationType === 'scheduled'
      ? selectedScheduling?.vaccineId
      : selectedVaccineId;

    if (!vaccineId) {
      setBatches([]);
      return;
    }

    const fetchBatches = async () => {
      setLoadingBatches(true);
      try {
        const response = await vaccineService.getBatches(vaccineId, {
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
  }, [applicationType, selectedScheduling?.vaccineId, selectedVaccineId]);

  const handleScheduledSubmit = async (data: CreateScheduledApplicationFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleWalkInSubmit = async (data: CreateWalkInApplicationFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const selectedVaccine = vaccines.find(v => v.id === selectedVaccineId);

  return (
    <form
      onSubmit={
        applicationType === 'scheduled'
          ? scheduledForm.handleSubmit(handleScheduledSubmit)
          : walkInForm.handleSubmit(handleWalkInSubmit)
      }
      className="space-y-6"
    >
      {/* Application Type Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
          Tipo de Aplicação
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="applicationType"
              value="scheduled"
              checked={applicationType === 'scheduled'}
              onChange={() => setApplicationType('scheduled')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">
              Aplicação Agendada
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="applicationType"
              value="walkin"
              checked={applicationType === 'walkin'}
              onChange={() => setApplicationType('walkin')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">
              Aplicação Avulsa
            </span>
          </label>
        </div>
        <p className="text-xs text-gray-500">
          {applicationType === 'scheduled'
            ? 'Selecione um agendamento existente para registrar a aplicação'
            : 'Registre uma aplicação sem agendamento prévio'}
        </p>
      </div>

      {/* Scheduled Application Fields */}
      {applicationType === 'scheduled' && (
        <>
          {/* Scheduling Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
              Selecionar Agendamento
            </h3>

            <div>
              <label htmlFor="schedulingId" className="block text-sm font-medium text-gray-700 mb-1.5">
                Agendamento <span className="text-danger-500">*</span>
              </label>
              {loadingSchedulings ? (
                <p className="text-sm text-gray-500">Carregando agendamentos...</p>
              ) : schedulings.length === 0 ? (
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <p className="text-sm text-warning-700">
                    Nenhum agendamento disponível para hoje. Considere registrar uma aplicação avulsa.
                  </p>
                </div>
              ) : (
                <select
                  id="schedulingId"
                  {...scheduledForm.register('schedulingId')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    scheduledForm.formState.errors.schedulingId ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Selecione um agendamento</option>
                  {schedulings.map((scheduling) => (
                    <option key={scheduling.id} value={scheduling.id}>
                      {scheduling.user?.name} - {scheduling.vaccine?.name} (Dose {scheduling.doseNumber}) - {' '}
                      {new Date(scheduling.scheduledDate).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </option>
                  ))}
                </select>
              )}
              {applicationType === 'scheduled' && scheduledForm.formState.errors.schedulingId && (
                <p className="mt-1 text-sm text-danger-600">{scheduledForm.formState.errors.schedulingId.message}</p>
              )}
            </div>

            {/* Display selected scheduling info */}
            {selectedScheduling && (
              <SchedulingMiniCard scheduling={selectedScheduling} />
            )}
          </div>
        </>
      )}

      {/* Walk-in Application Fields */}
      {applicationType === 'walkin' && (
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
                {...walkInForm.register('receivedById')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  walkInForm.formState.errors.receivedById ? 'border-danger-300' : 'border-gray-300'
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
            {walkInForm.formState.errors.receivedById && (
              <p className="mt-1 text-sm text-danger-600">{walkInForm.formState.errors.receivedById.message}</p>
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
                {...walkInForm.register('vaccineId')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  walkInForm.formState.errors.vaccineId ? 'border-danger-300' : 'border-gray-300'
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
            {walkInForm.formState.errors.vaccineId && (
              <p className="mt-1 text-sm text-danger-600">{walkInForm.formState.errors.vaccineId.message}</p>
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
            register={walkInForm.register('doseNumber', { valueAsNumber: true })}
            error={walkInForm.formState.errors.doseNumber?.message}
            required
            helperText={selectedVaccine ? `Esta vacina requer ${selectedVaccine.dosesRequired} dose(s)` : undefined}
          />
        </div>
      )}

      {/* Common Application Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
          Detalhes da Aplicação
        </h3>

        <div>
          <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-1.5">
            Lote da Vacina <span className="text-danger-500">*</span>
          </label>
          {applicationType === 'scheduled' && !selectedScheduling ? (
            <p className="text-sm text-gray-500">Selecione um agendamento primeiro</p>
          ) : applicationType === 'walkin' && !selectedVaccineId ? (
            <p className="text-sm text-gray-500">Selecione uma vacina primeiro</p>
          ) : loadingBatches ? (
            <p className="text-sm text-gray-500">Carregando lotes disponíveis...</p>
          ) : batches.length === 0 ? (
            <p className="text-sm text-danger-600">Nenhum lote disponível para esta vacina</p>
          ) : (
            <select
              id="batchId"
              {...(applicationType === 'scheduled' ? scheduledForm.register('batchId') : walkInForm.register('batchId'))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                (applicationType === 'scheduled' ? scheduledForm.formState.errors.batchId : walkInForm.formState.errors.batchId)
                  ? 'border-danger-300'
                  : 'border-gray-300'
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
          {(applicationType === 'scheduled' ? scheduledForm.formState.errors.batchId : walkInForm.formState.errors.batchId) && (
            <p className="mt-1 text-sm text-danger-600">
              {(applicationType === 'scheduled' ? scheduledForm.formState.errors.batchId?.message : walkInForm.formState.errors.batchId?.message)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="applicationSite" className="block text-sm font-medium text-gray-700 mb-1.5">
            Local de Aplicação <span className="text-danger-500">*</span>
          </label>
          <select
            id="applicationSite"
            {...(applicationType === 'scheduled' ? scheduledForm.register('applicationSite') : walkInForm.register('applicationSite'))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              (applicationType === 'scheduled' ? scheduledForm.formState.errors.applicationSite : walkInForm.formState.errors.applicationSite)
                ? 'border-danger-300'
                : 'border-gray-300'
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
          {(applicationType === 'scheduled' ? scheduledForm.formState.errors.applicationSite : walkInForm.formState.errors.applicationSite) && (
            <p className="mt-1 text-sm text-danger-600">
              {(applicationType === 'scheduled' ? scheduledForm.formState.errors.applicationSite?.message : walkInForm.formState.errors.applicationSite?.message)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1.5">
            Observações
          </label>
          <textarea
            id="observations"
            {...(applicationType === 'scheduled' ? scheduledForm.register('observations') : walkInForm.register('observations'))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              (applicationType === 'scheduled' ? scheduledForm.formState.errors.observations : walkInForm.formState.errors.observations)
                ? 'border-danger-300'
                : 'border-gray-300'
            }`}
            placeholder="Reações adversas, condições especiais, etc. (opcional)"
            disabled={isLoading}
          />
          {(applicationType === 'scheduled' ? scheduledForm.formState.errors.observations : walkInForm.formState.errors.observations) && (
            <p className="mt-1 text-sm text-danger-600">
              {(applicationType === 'scheduled' ? scheduledForm.formState.errors.observations?.message : walkInForm.formState.errors.observations?.message)}
            </p>
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
          disabled={
            isLoading ||
            (applicationType === 'scheduled'
              ? !scheduledForm.formState.isDirty || schedulings.length === 0
              : !walkInForm.formState.isDirty)
          }
        >
          Registrar Aplicação
        </Button>
      </ModalFooter>
    </form>
  );
};
