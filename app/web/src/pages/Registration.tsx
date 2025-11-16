import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { RegisterFormSchema, type RegisterFormData } from '../utils/validationSchemas';
import { useRegister } from '../hooks/useRegister';
import { FormInput } from '../components/common/FormInput';
import { MaskedInput } from '../components/common/MaskedInput';
import { Select } from '../components/common/Select';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { UserRole } from '../types';

/**
 * Registration page component
 * Allows new users to create an account with all required fields
 */
export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      role: '' as any,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;

      await registerUser(registerData);

      // TODO: Upload profile photo if provided
      // if (profilePhoto) {
      //   await uploadPhoto(profilePhoto);
      // }

      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the hook
      console.error('Registration error:', err);
    }
  };

  const roleOptions = [
    { value: UserRole.EMPLOYEE, label: 'Funcionário' },
    { value: UserRole.NURSE, label: 'Enfermeiro' },
    { value: UserRole.MANAGER, label: 'Gerente' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">
            Preencha os dados abaixo para se cadastrar
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Informações Pessoais
            </h2>

            <FormInput
              label="Nome Completo"
              type="text"
              placeholder="João Silva"
              register={register('name')}
              error={errors.name?.message}
              required
            />

            <FormInput
              label="Email"
              type="email"
              placeholder="joao@exemplo.com"
              register={register('email')}
              error={errors.email?.message}
              required
            />

            <MaskedInput
              label="CPF"
              mask="cpf"
              placeholder="000.000.000-00"
              register={register('cpf')}
              error={errors.cpf?.message}
              required
            />

            <MaskedInput
              label="Telefone"
              mask="phone"
              placeholder="(00) 00000-0000"
              register={register('phone')}
              error={errors.phone?.message}
              required
            />
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Informações da Conta
            </h2>

            <Select
              label="Função"
              options={roleOptions}
              placeholder="Selecione sua função"
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

            <div className="relative">
              <FormInput
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                register={register('password')}
                error={errors.password?.message}
                helperText="Mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial"
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

            <div className="relative">
              <FormInput
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                register={register('confirmPassword')}
                error={errors.confirmPassword?.message}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Foto de Perfil (Opcional)
            </h2>

            <FileUpload
              label="Foto de Perfil"
              accept="image/*"
              maxSize={5}
              preview={true}
              onChange={setProfilePhoto}
              helperText="JPG, PNG ou GIF até 5MB"
            />
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};
