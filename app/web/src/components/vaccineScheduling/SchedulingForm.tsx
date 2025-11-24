import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import type { CreateVaccineSchedulingData, Vaccine, User } from '../../types';
import { UserRole } from '../../types';
import { userService } from '../../services/user.service';
import { vaccineService } from '../../services/vaccine.service';

interface SchedulingFormProps {
  onSubmit: (data: CreateVaccineSchedulingData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * SchedulingForm component
 * Form for creating a new vaccine scheduling
 */
export const SchedulingForm: React.FC<SchedulingFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateVaccineSchedulingData>({
    vaccineId: '',
    scheduledDate: '',
    doseNumber: 1,
    nurseId: undefined,
    notes: '',
  });

  // Separate state for date and time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [loadingVaccines, setLoadingVaccines] = useState(true);
  const [loadingNurses, setLoadingNurses] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load vaccines and nurses on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load vaccines
        setLoadingVaccines(true);
        const vaccinesResponse = await vaccineService.list({ page: 1, perPage: 100 });
        setVaccines(vaccinesResponse.data);
      } catch (error) {
        console.error('Error loading vaccines:', error);
      } finally {
        setLoadingVaccines(false);
      }

      try {
        // Load nurses
        setLoadingNurses(true);
        const nursesResponse = await userService.list({ role: UserRole.NURSE, page: 1, perPage: 100 });
        setNurses(nursesResponse.data);
      } catch (error) {
        console.error('Error loading nurses:', error);
      } finally {
        setLoadingNurses(false);
      }
    };

    loadData();
  }, []);

  // Update selected vaccine when vaccineId changes
  useEffect(() => {
    if (formData.vaccineId) {
      const vaccine = vaccines.find((v) => v.id === formData.vaccineId);
      setSelectedVaccine(vaccine || null);
    } else {
      setSelectedVaccine(null);
    }
  }, [formData.vaccineId, vaccines]);

  // Combine date and time into ISO string
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const dateTimeString = `${selectedDate}T${selectedTime}:00`;
      const dateTime = new Date(dateTimeString);
      setFormData((prev) => ({
        ...prev,
        scheduledDate: dateTime.toISOString(),
      }));
    } else if (!selectedDate && !selectedTime) {
      setFormData((prev) => ({
        ...prev,
        scheduledDate: '',
      }));
    }
  }, [selectedDate, selectedTime]);

  const handleChange = (field: keyof CreateVaccineSchedulingData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vaccineId) {
      newErrors.vaccineId = 'Selecione uma vacina';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Selecione uma data e hora';
    } else {
      const selectedDate = new Date(formData.scheduledDate);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.scheduledDate = 'A data deve ser no futuro';
      }
    }

    if (!formData.doseNumber || formData.doseNumber < 1) {
      newErrors.doseNumber = 'Número da dose inválido';
    }

    if (selectedVaccine && formData.doseNumber > selectedVaccine.dosesRequired) {
      newErrors.doseNumber = `Esta vacina requer apenas ${selectedVaccine.dosesRequired} dose(s)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Remove empty notes
      const submitData = {
        ...formData,
        notes: formData.notes?.trim() || undefined,
        nurseId: formData.nurseId || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Error submitting form:', error);
    }
  };

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vaccine selection */}
      <div>
        <label htmlFor="vaccine" className="block text-sm font-medium text-gray-700 mb-2">
          Vacina <span className="text-red-500">*</span>
        </label>
        <select
          id="vaccine"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.vaccineId ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.vaccineId}
          onChange={(e) => handleChange('vaccineId', e.target.value)}
          disabled={isLoading || loadingVaccines}
          required
        >
          <option value="">Selecione uma vacina</option>
          {vaccines.map((vaccine) => (
            <option key={vaccine.id} value={vaccine.id}>
              {vaccine.name} - {vaccine.manufacturer}
            </option>
          ))}
        </select>
        {errors.vaccineId && (
          <p className="mt-1 text-sm text-red-600">{errors.vaccineId}</p>
        )}
        {selectedVaccine && (
          <p className="mt-1 text-sm text-gray-600">
            Esta vacina requer {selectedVaccine.dosesRequired} dose(s)
            {selectedVaccine.intervalDays && ` com intervalo de ${selectedVaccine.intervalDays} dias`}
          </p>
        )}
      </div>

      {/* Dose number */}
      <div>
        <label htmlFor="doseNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Número da dose <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="doseNumber"
          min="1"
          max={selectedVaccine?.dosesRequired || 10}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.doseNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          value={formData.doseNumber}
          onChange={(e) => handleChange('doseNumber', parseInt(e.target.value) || 1)}
          disabled={isLoading || !selectedVaccine}
          required
        />
        {errors.doseNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.doseNumber}</p>
        )}
      </div>

      {/* Scheduled date and time - Separate fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date field */}
        <div>
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
            📅 Data do agendamento <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="scheduledDate"
            min={minDateTime.toISOString().split('T')[0]}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
            }`}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (errors.scheduledDate) {
                setErrors((prev) => {
                  const { scheduledDate: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            disabled={isLoading}
            required
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
          )}
        </div>

        {/* Time field */}
        <div>
          <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
            🕐 Horário do agendamento <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="scheduledTime"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
            }`}
            value={selectedTime}
            onChange={(e) => {
              setSelectedTime(e.target.value);
              if (errors.scheduledDate) {
                setErrors((prev) => {
                  const { scheduledDate: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            disabled={isLoading || !selectedDate}
            required
          />
          {!selectedDate && (
            <p className="mt-1 text-xs text-gray-500">Selecione a data primeiro</p>
          )}
        </div>
      </div>

      {/* Combined date/time preview */}
      {selectedDate && selectedTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <title>Confirmação de data e hora</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-900 font-medium">
              Agendamento será criado para: {new Date(`${selectedDate}T${selectedTime}`).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Nurse selection (optional) */}
      <div>
        <label htmlFor="nurse" className="block text-sm font-medium text-gray-700 mb-2">
          Enfermeiro(a) (opcional)
        </label>
        <select
          id="nurse"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={formData.nurseId || ''}
          onChange={(e) => handleChange('nurseId', e.target.value)}
          disabled={isLoading || loadingNurses}
        >
          <option value="">Nenhum enfermeiro selecionado</option>
          {nurses.map((nurse) => (
            <option key={nurse.id} value={nurse.id}>
              {nurse.name}
              {nurse.coren && ` - COREN: ${nurse.coren}`}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isLoading}
          placeholder="Adicione observações sobre o agendamento..."
        />
      </div>

      {/* Form actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading || loadingVaccines}
        >
          {isLoading ? 'Agendando...' : 'Agendar'}
        </Button>
      </div>
    </form>
  );
};
