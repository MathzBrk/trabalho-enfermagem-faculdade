import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Users, Search, Eye } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { UnifiedApplicationForm } from '../../components/vaccineApplications/UnifiedApplicationForm';
import { useVaccineApplications } from '../../hooks/useVaccineApplications';
import { userService } from '../../services/user.service';
import type { VaccineApplication, User } from '../../types';

/**
 * Vaccine Applications Management Page (NURSE only)
 * Allows nurses to record vaccine applications with a unified form
 * Features user search to view vaccination cards
 */
export const VaccineApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    applications,
    pagination,
    isLoading,
    error,
    fetchApplications,
    createApplication,
    clearError,
  } = useVaccineApplications();

  const [currentPage, setCurrentPage] = useState(1);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User search for vaccination card viewing
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Auto-open modal if navigating to /vaccine-applications/new
  useEffect(() => {
    if (location.pathname.endsWith('/new')) {
      setShowApplicationModal(true);
    }
  }, [location.pathname]);

  // Fetch applications on mount and when page changes
  useEffect(() => {
    fetchApplications({
      page: currentPage,
      perPage: 20,
      sortBy: 'applicationDate',
      sortOrder: 'desc',
    });
  }, [currentPage, fetchApplications]);

  // Fetch users for search functionality
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await userService.listUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.cpf.includes(query)
    );
  });

  const handleOpenModal = () => {
    setShowApplicationModal(true);
    // Update URL without navigation
    window.history.pushState({}, '', '/vaccine-applications/new');
  };

  const handleCloseModal = () => {
    setShowApplicationModal(false);
    // Reset URL to base applications page
    window.history.pushState({}, '', '/vaccine-applications');
  };

  const handleApplicationSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createApplication(data);
      handleCloseModal();
      // Refresh applications list
      fetchApplications({
        page: currentPage,
        perPage: 20,
        sortBy: 'applicationDate',
        sortOrder: 'desc',
      });
    } catch (err) {
      console.error('Error creating application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setShowUserDropdown(false);
  };

  const handleViewVaccinationCard = () => {
    if (selectedUser) {
      navigate(`/vaccination-card/${selectedUser.id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aplicações de Vacinas</h1>
            <p className="text-gray-600 mt-1">
              Registre aplicações de vacinas e consulte cartões de vacinação
            </p>
          </div>

          <Button onClick={handleOpenModal}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Nova Aplicação
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg flex justify-between items-center">
            <p className="text-danger-700">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </div>
        )}

        {/* User Search Card - Quick Access to Vaccination Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Consultar Cartão de Vacinação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Pesquise um paciente para visualizar seu cartão de vacinação antes de aplicar uma vacina
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowUserDropdown(true);
                    setSelectedUser(null);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* User Dropdown */}
                {showUserDropdown && searchQuery && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.slice(0, 10).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email} - CPF: {user.cpf}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showUserDropdown && searchQuery && filteredUsers.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <p className="text-sm text-gray-500">Nenhum paciente encontrado</p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleViewVaccinationCard}
                disabled={!selectedUser}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Cartão
              </Button>
            </div>

            {selectedUser && (
              <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm font-medium text-primary-900">
                  Paciente selecionado: {selectedUser.name}
                </p>
                <p className="text-xs text-primary-700 mt-1">
                  Email: {selectedUser.email} | CPF: {selectedUser.cpf}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Aplicações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && applications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
                  <p className="mt-4 text-gray-600">Carregando aplicações...</p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma aplicação registrada ainda</p>
                <p className="text-sm text-gray-500 mt-1">
                  Comece registrando uma aplicação de vacina
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vacina
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dose
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Local
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aplicado por
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app: VaccineApplication) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(app.applicationDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {app.user?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {app.vaccine?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{app.doseNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {app.applicationSite}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {app.appliedBy?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              app.schedulingId
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {app.schedulingId ? 'Agendada' : 'Avulsa'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} aplicações)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                  >
                    Anterior
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!pagination.hasNext || isLoading}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unified Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={handleCloseModal}
        title="Registrar Aplicação de Vacina"
        size="lg"
      >
        <UnifiedApplicationForm
          onSubmit={handleApplicationSubmit}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>
    </DashboardLayout>
  );
};
