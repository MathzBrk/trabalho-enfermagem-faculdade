import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FormInput } from '../components/common/FormInput';
import { MaskedInput } from '../components/common/MaskedInput';
import { Select } from '../components/common/Select';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useRegister } from '../hooks/useRegister';
import { UserRole } from '../types';
import {
  type RegisterFormData,
  RegisterFormSchema,
} from '../utils/validationSchemas';

/**
 * Registration page component
 * Allows new users to create an account with all required fields
 */
export const Registration = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-medical-lightBlue flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo and header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl mb-3">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Preencha os dados abaixo para se cadastrar no sistema
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-6 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-danger-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
                  Informações Pessoais
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
                  Informações da Conta
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FormInput
                      label="Senha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      register={register('password')}
                      error={errors.password?.message}
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} Univas Enfermagem. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
};
