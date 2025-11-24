import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/common/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { UserFormModal } from '../../components/users/UserFormModal';
import { userService } from '../../services/user.service';
import { UserRole, type User } from '../../types';
import { formatDate, formatCPF, formatPhone } from '../../utils/formatters';
import { cn } from '../../utils/cn';

/**
 * Employees Management Page (MANAGER only)
 * Allows managers to list, create, edit, activate/deactivate, and delete employees
 */
export const UsersManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const perPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleActiveDialogOpen, setIsToggleActiveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load users
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        perPage,
        sortBy: 'name',
        sortOrder: 'asc' as const,
      };

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter !== '') {
        params.isActive = statusFilter === 'active';
      }

      const response = await userService.list(params);
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar funcionários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter, statusFilter]);

  // Create user
  const handleCreateUser = async (data: any) => {
    setActionLoading(true);
    try {
      await userService.create(data);
      setSuccessMessage('Funcionário criado com sucesso!');
      setIsFormModalOpen(false);
      loadUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar funcionário');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.update(selectedUser.id, data);
      setSuccessMessage('Funcionário atualizado com sucesso!');
      setIsFormModalOpen(false);
      setSelectedUser(null);
      loadUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar funcionário');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.delete(selectedUser.id);
      setSuccessMessage('Funcionário excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir funcionário');
      setTimeout(() => setError(null), 5000);
      setIsDeleteDialogOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle user active status
  const handleToggleActive = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.activate(selectedUser.id, !selectedUser.isActive);
      setSuccessMessage(
        `Funcionário ${!selectedUser.isActive ? 'ativado' : 'desativado'} com sucesso!`
      );
      setIsToggleActiveDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status do funcionário');
      setTimeout(() => setError(null), 5000);
      setIsToggleActiveDialogOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter by search term (client-side)
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.cpf.includes(term)
    );
  });

  const roleLabels: Record<UserRole, string> = {
    [UserRole.EMPLOYEE]: 'Funcionário',
    [UserRole.NURSE]: 'Enfermeiro',
    [UserRole.MANAGER]: 'Gerente',
  };

  const roleColors: Record<UserRole, string> = {
    [UserRole.EMPLOYEE]: 'bg-gray-100 text-gray-800',
    [UserRole.NURSE]: 'bg-primary-100 text-primary-800',
    [UserRole.MANAGER]: 'bg-success-100 text-success-800',
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Funcionários</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os funcionários do sistema
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedUser(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Novo Funcionário
          </Button>
        </div>

        {/* Success/Error messages */}
        {successMessage && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-success-700 text-sm font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label htmlFor="search-users" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search-users"
                    type="text"
                    placeholder="Nome, email ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role filter */}
              <div>
                <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Função
                </label>
                <Select
                  id="role-filter"
                  options={[
                    { value: UserRole.EMPLOYEE, label: 'Funcionário' },
                    { value: UserRole.NURSE, label: 'Enfermeiro' },
                    { value: UserRole.MANAGER, label: 'Gerente' },
                  ]}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                  placeholder="Todas"
                />
              </div>

              {/* Status filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  id="status-filter"
                  options={[
                    { value: 'active', label: 'Ativos' },
                    { value: 'inactive', label: 'Inativos' },
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | '')}
                  placeholder="Todos"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">
                Funcionários ({totalUsers})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadUsers}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <RefreshCw className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Carregando funcionários...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Users className="h-16 w-16 mb-4 opacity-40" />
                <p className="text-lg font-semibold text-gray-700">Nenhum funcionário encontrado</p>
                <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros ou criar um novo funcionário</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Telefone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">CPF</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Função</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">COREN</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Criado em</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.phone ? formatPhone(user.phone) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatCPF(user.cpf)}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            roleColors[user.role]
                          )}
                        >
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.coren || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            user.isActive
                              ? 'bg-success-100 text-success-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsToggleActiveDialogOpen(true);
                            }}
                            className={cn(
                              'p-2 rounded-md hover:bg-gray-100 transition-colors',
                              user.isActive ? 'text-warning-600 hover:text-warning-700' : 'text-success-600 hover:text-success-700'
                            )}
                            title={user.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {user.isActive ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsFormModalOpen(true);
                            }}
                            className="p-2 rounded-md hover:bg-gray-100 text-primary-600 hover:text-primary-700 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-2 rounded-md hover:bg-gray-100 text-danger-600 hover:text-danger-700 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredUsers.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Form Modal */}
        <UserFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          user={selectedUser}
          isLoading={actionLoading}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUser}
          title="Excluir Funcionário"
          message={`Tem certeza que deseja excluir o funcionário "${selectedUser?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={actionLoading}
        />

        {/* Toggle Active Status Dialog */}
        <ConfirmDialog
          isOpen={isToggleActiveDialogOpen}
          onClose={() => {
            setIsToggleActiveDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleToggleActive}
          title={selectedUser?.isActive ? 'Desativar Funcionário' : 'Ativar Funcionário'}
          message={
            selectedUser?.isActive
              ? `Tem certeza que deseja desativar o funcionário "${selectedUser?.name}"? Ele não poderá mais acessar o sistema.`
              : `Tem certeza que deseja ativar o funcionário "${selectedUser?.name}"? Ele poderá acessar o sistema novamente.`
          }
          confirmText={selectedUser?.isActive ? 'Desativar' : 'Ativar'}
          cancelText="Cancelar"
          variant={selectedUser?.isActive ? 'warning' : 'success'}
          isLoading={actionLoading}
        />
      </div>
    </DashboardLayout>
  );
};
