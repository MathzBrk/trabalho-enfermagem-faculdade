import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateVaccineBatchSchema, UpdateVaccineBatchSchema } from '../../utils/vaccineSchemas';
import type { CreateVaccineBatchFormData, UpdateVaccineBatchFormData } from '../../utils/vaccineSchemas';
import type { VaccineBatch } from '../../types';
import { FormInput } from '../common/FormInput';
import { Button } from '../ui/Button';
import { ModalFooter } from '../ui/Modal';

interface VaccineBatchFormProps {
  mode?: 'create' | 'edit';
  vaccineId?: string;
  initialData?: VaccineBatch;
  onSubmit: (data: CreateVaccineBatchFormData | UpdateVaccineBatchFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Form component for creating and editing vaccine batches
 */
export const VaccineBatchForm: React.FC<VaccineBatchFormProps> = ({
  mode = 'create',
  vaccineId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const schema = mode === 'create' ? CreateVaccineBatchSchema : UpdateVaccineBatchSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateVaccineBatchFormData | UpdateVaccineBatchFormData>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'edit' && initialData
      ? {
          batchNumber: initialData.batchNumber,
          quantity: initialData.currentQuantity,
          expirationDate: initialData.expirationDate.split('T')[0],
          receivedDate: initialData.receivedDate.split('T')[0],
        }
      : {
          vaccineId: vaccineId || '',
          batchNumber: '',
          quantity: 1,
          expirationDate: '',
          receivedDate: new Date().toISOString().split('T')[0],
        },
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        batchNumber: initialData.batchNumber,
        quantity: initialData.currentQuantity,
        expirationDate: initialData.expirationDate.split('T')[0],
        receivedDate: initialData.receivedDate.split('T')[0],
      });
    }
  }, [mode, initialData, reset]);

  const handleFormSubmit = async (data: CreateVaccineBatchFormData | UpdateVaccineBatchFormData) => {
    try {
      // Format data for API
      const formattedData = {
        ...data,
        receivedDate: data.receivedDate || undefined,
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
          Informações do Lote
        </h3>

        {!vaccineId && mode === 'create' && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-700">
              Atenção: Vacina não especificada. Certifique-se de selecionar uma vacina.
            </p>
          </div>
        )}

        <FormInput
          label="Número do Lote"
          type="text"
          placeholder="Ex: LOT123456"
          register={register('batchNumber')}
          error={errors.batchNumber?.message}
          required
          helperText="Número de identificação do lote do fabricante"
        />

        <FormInput
          label="Quantidade"
          type="number"
          placeholder="1"
          min="1"
          register={register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
          required
          helperText="Quantidade de doses no lote"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Data de Validade"
            type="date"
            register={register('expirationDate')}
            error={errors.expirationDate?.message}
            required
            helperText="Data de expiração do lote"
          />

          <FormInput
            label="Data de Recebimento"
            type="date"
            register={register('receivedDate')}
            error={errors.receivedDate?.message}
            helperText="Data em que o lote foi recebido (opcional)"
          />
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
          {mode === 'create' ? 'Registrar Lote' : 'Salvar Alterações'}
        </Button>
      </ModalFooter>
    </form>
  );
};
