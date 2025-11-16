import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Save, X, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { UpdateProfileSchema } from '../utils/validationSchemas';
import type { UpdateProfileFormData } from '../utils/validationSchemas';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../store/authStore';
import { FormInput } from '../components/common/FormInput';
import { MaskedInput } from '../components/common/MaskedInput';
import { Select } from '../components/common/Select';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UserRole } from '../types';
import { formatCPF, formatPhone, formatRole, formatDate, getInitials } from '../utils/formatters';
import { DashboardLayout } from '../components/layout/DashboardLayout';

/**
 * Profile page component
 * Displays and allows editing of the authenticated user's profile
 */
export const Profile: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const { user, isLoading, error, updateProfile, uploadPhoto } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      role: user?.role,
      coren: user?.coren || '',
    },
  });

  const selectedRole = watch('role');

  // Reset form when user data loads
  React.useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone || '',
        role: user.role,
        coren: user.coren || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      // Only send fields that have values
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.phone) updateData.phone = data.phone;
      if (data.role) updateData.role = data.role;
      if (data.coren) updateData.coren = data.coren;

      await updateProfile(updateData);
      setIsEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    setIsUploadingPhoto(true);
    try {
      await uploadPhoto(photoFile);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  const roleOptions = [
    { value: UserRole.EMPLOYEE, label: 'Funcionário' },
    { value: UserRole.NURSE, label: 'Enfermeiro' },
    { value: UserRole.MANAGER, label: 'Gerente' },
  ];

  const isManager = authUser?.role === UserRole.MANAGER;

  if (isLoading && !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-danger-600">Erro ao carregar perfil</p>
                {error && <p className="text-sm text-gray-600 mt-2">{error}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Photo */}
            <div className="relative">
              {photoPreview || user.profilePhotoUrl ? (
                <img
                  src={photoPreview || user.profilePhotoUrl!}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-4xl font-bold text-primary-600">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}

              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 shadow-lg"
              >
                <Camera size={20} />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  <button
                    onClick={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="bg-green-600 text-white rounded-full p-1.5 hover:bg-green-700 shadow-lg disabled:opacity-50"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="bg-danger-600 text-white rounded-full p-1.5 hover:bg-danger-700 shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-gray-600 justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <Badge variant="info">
                    <Shield className="h-3 w-3 mr-1" />
                    {formatRole(user.role)}
                  </Badge>
                  {user.coren && (
                    <Badge variant="default">COREN: {user.coren}</Badge>
                  )}
                  <Badge variant={user.isActive ? 'success' : 'danger'}>
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações Pessoais
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">CPF</p>
                    <p className="text-sm font-medium text-gray-900">{formatCPF(user.cpf)}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="text-sm font-medium text-gray-900">{formatPhone(user.phone)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Membro desde</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status da Conta
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={user.isActive ? 'success' : 'danger'}>
                    {user.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Função</span>
                  <Badge variant="info">{formatRole(user.role)}</Badge>
                </div>
                {user.role === UserRole.NURSE && user.coren && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">COREN</span>
                    <span className="text-sm font-medium text-gray-900">{user.coren}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Editar Perfil
                </h2>
                <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-danger-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
                    Informações Básicas
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nome Completo"
                      type="text"
                      placeholder="João Silva"
                      register={register('name')}
                      error={errors.name?.message}
                    />

                    <MaskedInput
                      label="Telefone"
                      mask="phone"
                      placeholder="(00) 00000-0000"
                      register={register('phone')}
                      error={errors.phone?.message}
                    />
                  </div>
                </div>

                {/* Only managers can change role */}
                {isManager && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
                      Informações da Conta
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Função"
                        options={roleOptions}
                        placeholder="Selecione a função"
                        register={register('role')}
                        error={errors.role?.message}
                      />

                      {selectedRole === UserRole.NURSE && (
                        <FormInput
                          label="COREN"
                          type="text"
                          placeholder="123456"
                          register={register('coren')}
                          error={errors.coren?.message}
                          helperText="Número do registro no Conselho Regional de Enfermagem"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading || !isDirty}
                    className="flex-1"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
