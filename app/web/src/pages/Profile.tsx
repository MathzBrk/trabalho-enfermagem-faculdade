import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Camera, Save, X } from 'lucide-react';
import { UpdateProfileSchema, UpdateProfileFormData } from '../utils/validationSchemas';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../store/authStore';
import { FormInput } from '../components/common/FormInput';
import { MaskedInput } from '../components/common/MaskedInput';
import { Select } from '../components/common/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UserRole } from '../types';
import { formatCPF, formatPhone, formatRole, formatDate, getInitials } from '../utils/formatters';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <p className="text-danger-600">Erro ao carregar perfil</p>
            {error && <p className="text-sm text-gray-600 mt-2">{error}</p>}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
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
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>

              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <Badge variant="primary">{formatRole(user.role)}</Badge>
                {user.coren && <Badge variant="secondary">COREN: {user.coren}</Badge>}
                <Badge variant={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>
                  <strong>CPF:</strong> {formatCPF(user.cpf)}
                </p>
                {user.phone && (
                  <p>
                    <strong>Telefone:</strong> {formatPhone(user.phone)}
                  </p>
                )}
                <p>
                  <strong>Cadastrado em:</strong> {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Editar Perfil
              </Button>
            )}
          </div>
        </Card>

        {/* Edit Form */}
        {isEditing && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Editar Perfil
              </h2>
              <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                <X size={20} />
              </Button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-danger-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Only managers can change role */}
              {isManager && (
                <>
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
                </>
              )}

              <div className="flex gap-3">
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
          </Card>
        )}
      </div>
    </div>
  );
};
