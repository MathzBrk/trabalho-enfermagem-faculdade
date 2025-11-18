import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateVaccineSchema, UpdateVaccineSchema } from '../../utils/vaccineSchemas';
import type { CreateVaccineFormData, UpdateVaccineFormData } from '../../utils/vaccineSchemas';
import type { Vaccine } from '../../types';
import { FormInput } from '../common/FormInput';
import { Button } from '../ui/Button';
import { ModalFooter } from '../ui/Modal';

interface VaccineFormProps {
  mode: 'create' | 'edit';
  initialData?: Vaccine;
  onSubmit: (data: CreateVaccineFormData | UpdateVaccineFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Reusable form component for creating and editing vaccines
 */
export const VaccineForm: React.FC<VaccineFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const schema = mode === 'create' ? CreateVaccineSchema : UpdateVaccineSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateVaccineFormData | UpdateVaccineFormData>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'edit' && initialData
      ? {
          name: initialData.name,
          manufacturer: initialData.manufacturer,
          description: initialData.description || '',
          dosesRequired: initialData.dosesRequired,
          isObligatory: initialData.isObligatory,
          intervalDays: initialData.intervalDays || undefined,
          minStockLevel: initialData.minStockLevel || undefined,
        }
      : {
          name: '',
          manufacturer: '',
          description: '',
          dosesRequired: 1,
          isObligatory: false,
          intervalDays: undefined,
          minStockLevel: undefined,
        },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name,
        manufacturer: initialData.manufacturer,
        description: initialData.description || '',
        dosesRequired: initialData.dosesRequired,
        isObligatory: initialData.isObligatory,
        intervalDays: initialData.intervalDays || undefined,
        minStockLevel: initialData.minStockLevel || undefined,
      });
    }
  }, [mode, initialData, reset]);

  const handleFormSubmit = async (data: CreateVaccineFormData | UpdateVaccineFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const formattedData = {
        ...data,
        description: data.description || undefined,
        intervalDays: data.intervalDays || undefined,
        minStockLevel: data.minStockLevel || undefined,
      };
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
          Informações Básicas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nome da Vacina"
            type="text"
            placeholder="Ex: Tríplice Viral"
            register={register('name')}
            error={errors.name?.message}
            required
          />

          <FormInput
            label="Fabricante"
            type="text"
            placeholder="Ex: Pfizer"
            register={register('manufacturer')}
            error={errors.manufacturer?.message}
            required
          />
        </div>

        <FormInput
          label="Descrição"
          type="text"
          placeholder="Descrição da vacina (opcional)"
          register={register('description')}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Número de Doses"
            type="number"
            placeholder="1"
            min="1"
            max="10"
            register={register('dosesRequired', { valueAsNumber: true })}
            error={errors.dosesRequired?.message}
            required
            helperText="Quantidade de doses necessárias"
          />

          <FormInput
            label="Intervalo entre Doses (dias)"
            type="number"
            placeholder="0"
            min="0"
            max="365"
            register={register('intervalDays', {
              setValueAs: (v) => v === '' ? undefined : parseInt(v, 10),
            })}
            error={errors.intervalDays?.message}
            helperText="Deixe em branco se não aplicável"
          />
        </div>

        <FormInput
          label="Estoque Mínimo"
          type="number"
          placeholder="0"
          min="0"
          register={register('minStockLevel', {
            setValueAs: (v) => v === '' ? undefined : parseInt(v, 10),
          })}
          error={errors.minStockLevel?.message}
          helperText="Nível mínimo de estoque para alertas"
        />

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isObligatory"
              type="checkbox"
              {...register('isObligatory')}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isObligatory" className="font-medium text-gray-700">
              Vacina Obrigatória
            </label>
            <p className="text-gray-500">
              Marque se esta vacina é obrigatória por legislação
            </p>
          </div>
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
          disabled={isLoading || (mode === 'edit' && !isDirty)}
        >
          {mode === 'create' ? 'Criar Vacina' : 'Salvar Alterações'}
        </Button>
      </ModalFooter>
    </form>
  );
};
