import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { type User, UserRole } from '../../types';
import { FormInput } from '../common/FormInput';
import { MaskedInput } from '../common/MaskedInput';
import { Select } from '../common/Select';
import { Button } from '../ui/Button';
import { Modal, ModalFooter } from '../ui/Modal';

// Validation schema for creating a new user
const CreateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(255, 'Nome muito longo')
      .trim(),
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Formato de email inválido')
      .toLowerCase()
      .trim()
      .max(255, 'Email muito longo'),
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(128, 'Senha muito longa'),
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório')
      .regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos'),
    phone: z
      .string()
      .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
      .optional()
      .or(z.literal('')),
    role: z.enum(['EMPLOYEE', 'NURSE', 'MANAGER'], {
      error: () => ({ message: 'Selecione uma função válida' }),
    }),
    coren: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'NURSE') {
      if (!data.coren || data.coren.trim().length === 0) {
        ctx.addIssue({
          path: ['coren'],
          code: z.ZodIssueCode.custom,
          message: 'COREN é obrigatório para enfermeiros',
        });
      }
    }
  });

// Validation schema for editing an existing user
const EditUserSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(255, 'Nome muito longo')
      .trim(),
    phone: z
      .string()
      .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
      .optional()
      .or(z.literal('')),
    role: z.enum(['EMPLOYEE', 'NURSE', 'MANAGER'], {
      error: () => ({ message: 'Selecione uma função válida' }),
    }),
    coren: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'NURSE') {
      if (!data.coren || data.coren.trim().length === 0) {
        ctx.addIssue({
          path: ['coren'],
          code: z.ZodIssueCode.custom,
          message: 'COREN é obrigatório para enfermeiros',
        });
      }
    }
  });

type CreateUserFormData = z.infer<typeof CreateUserSchema>;
type EditUserFormData = z.infer<typeof EditUserSchema>;

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData | EditUserFormData) => Promise<void>;
  user?: User | null;
  isLoading?: boolean;
}

/**
 * Modal for creating or editing a user
 * If user prop is provided, it's in edit mode, otherwise create mode
 */
export const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}: UserFormModalProps) => {
  const isEditMode = !!user;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData | EditUserFormData>({
    resolver: zodResolver(isEditMode ? EditUserSchema : CreateUserSchema),
    defaultValues: isEditMode
      ? {
          name: user.name,
          phone: user.phone || '',
          role: user.role,
          coren: user.coren || '',
        }
      : {
          name: '',
          email: '',
          password: '',
          cpf: '',
          phone: '',
          role: '' as any,
          coren: '',
        },
  });

  const selectedRole = watch('role');

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && user) {
        reset({
          name: user.name,
          phone: user.phone || '',
          role: user.role,
          coren: user.coren || '',
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          cpf: '',
          phone: '',
          role: '' as any,
          coren: '',
        });
      }
    }
  }, [isOpen, isEditMode, user, reset]);

  const handleFormSubmit = async (
    data: CreateUserFormData | EditUserFormData,
  ) => {
    await onSubmit(data);
    reset();
  };

  const roleOptions = [
    { value: UserRole.EMPLOYEE, label: 'Funcionário' },
    { value: UserRole.NURSE, label: 'Enfermeiro' },
    { value: UserRole.MANAGER, label: 'Gerente' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Usuário' : 'Criar Novo Usuário'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nome Completo"
            type="text"
            placeholder="João Silva"
            register={register('name')}
            error={errors.name?.message}
            required
          />

          {!isEditMode && (
            <FormInput
              label="Email"
              type="email"
              placeholder="joao@exemplo.com"
              register={register(
                'email' as keyof (CreateUserFormData | EditUserFormData),
              )}
              error={'email' in errors ? errors.email?.message : undefined}
              required
            />
          )}
        </div>

        {!isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MaskedInput
              label="CPF"
              mask="cpf"
              placeholder="000.000.000-00"
              register={register(
                'cpf' as keyof (CreateUserFormData | EditUserFormData),
              )}
              error={'cpf' in errors ? errors.cpf?.message : undefined}
              setValue={(value) => setValue('cpf' as keyof (CreateUserFormData | EditUserFormData), value)}
              required
            />

            <MaskedInput
              label="Telefone"
              mask="phone"
              placeholder="(00) 00000-0000"
              register={register('phone')}
              error={errors.phone?.message}
              setValue={(value) => setValue('phone', value)}
            />
          </div>
        )}

        {isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MaskedInput
              label="Telefone"
              mask="phone"
              placeholder="(00) 00000-0000"
              register={register('phone')}
              error={errors.phone?.message}
              setValue={(value) => setValue('phone', value)}
            />
          </div>
        )}

        {/* Role and COREN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Função"
            options={roleOptions}
            placeholder="Selecione a função"
            register={register('role')}
            error={errors.role?.message}
            required
          />

          {selectedRole === UserRole.NURSE && (
            <FormInput
              label="COREN"
              type="text"
              placeholder="123456"
              register={register('coren')}
              error={errors.coren?.message}
              helperText="Número do registro no Conselho Regional de Enfermagem"
              required
            />
          )}
        </div>

        {/* Password (only for create mode) */}
        {!isEditMode && (
          <div className="relative">
            <FormInput
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              register={register(
                'password' as keyof (CreateUserFormData | EditUserFormData),
              )}
              error={
                'password' in errors ? errors.password?.message : undefined
              }
              helperText="Mínimo 6 caracteres"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        )}

        {/* Actions */}
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
