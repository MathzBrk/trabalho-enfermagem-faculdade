import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { VaccineForm } from '../../components/vaccines/VaccineForm';
import { useVaccines } from '../../hooks/useVaccines';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type Vaccine } from '../../types';
import type { CreateVaccineFormData, UpdateVaccineFormData } from '../../utils/vaccineSchemas';

/**
 * Vaccines List Page
 * Displays all vaccines with create, edit, and delete functionality
 */
export const VaccinesListPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === UserRole.MANAGER;

  const {
    vaccines,
    pagination,
    isLoading,
    error,
    fetchVaccines,
    createVaccine,
    updateVaccine,
    deleteVaccine,
    clearError,
  } = useVaccines();

  const [currentPage, setCurrentPage] = useState(1);
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [isObligatoryFilter, setIsObligatoryFilter] = useState<boolean | undefined>(undefined);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vaccines on mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      perPage: 12,
      sortBy: 'name',
      sortOrder: 'asc' as const,
      ...(manufacturerFilter && { manufacturer: manufacturerFilter }),
      ...(isObligatoryFilter !== undefined && { isObligatory: isObligatoryFilter }),
    };
    fetchVaccines(params);
  }, [currentPage, manufacturerFilter, isObligatoryFilter, fetchVaccines]);

  const handleCreateVaccine = async (data: CreateVaccineFormData) => {
    setIsSubmitting(true);
    try {
      await createVaccine(data);
      setShowCreateModal(false);
      // Refresh list
      fetchVaccines({ page: currentPage, perPage: 12 });
    } catch (err) {
      console.error('Create vaccine error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVaccine = async (data: UpdateVaccineFormData) => {
    if (!selectedVaccine) return;

    setIsSubmitting(true);
    try {
      await updateVaccine(selectedVaccine.id, data);
      setShowEditModal(false);
      setSelectedVaccine(null);
    } catch (err) {
      console.error('Update vaccine error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVaccine = async () => {
    if (!selectedVaccine) return;

    setIsSubmitting(true);
    try {
      await deleteVaccine(selectedVaccine.id);
      setShowDeleteModal(false);
      setSelectedVaccine(null);
    } catch (err) {
      console.error('Delete vaccine error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Vacinas</h1>
            <p className="text-gray-600 mt-1">
              Administre o catálogo de vacinas e seus estoques
            </p>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vacina
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fabricante
                </label>
                <input
                  type="text"
                  value={manufacturerFilter}
                  onChange={(e) => {
                    setManufacturerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filtrar por fabricante"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo
                </label>
                <select
                  value={isObligatoryFilter === undefined ? '' : isObligatoryFilter.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIsObligatoryFilter(value === '' ? undefined : value === 'true');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  <option value="true">Obrigatórias</option>
                  <option value="false">Não Obrigatórias</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setManufacturerFilter('');
                    setIsObligatoryFilter(undefined);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg flex justify-between items-center">
            <p className="text-danger-700">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && vaccines.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando vacinas...</p>
            </div>
          </div>
        )}

        {/* Vaccines Grid */}
        {!isLoading && vaccines.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma vacina encontrada</p>
              <p className="text-sm text-gray-500 mt-1">
                {manufacturerFilter || isObligatoryFilter !== undefined
                  ? 'Tente ajustar os filtros de busca'
                  : 'Clique em "Adicionar Vacina" para começar'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccines.map((vaccine) => (
              <Card
                key={vaccine.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/vaccines/${vaccine.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{vaccine.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {vaccine.manufacturer}
                      </p>
                    </div>
                    {vaccine.isObligatory && (
                      <Badge variant="info" size="sm">
                        Obrigatória
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Doses:</span>
                      <span className="font-medium text-gray-900">
                        {vaccine.dosesRequired}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estoque Total:</span>
                      <span className="font-medium text-gray-900">
                        {vaccine.totalStock}
                      </span>
                    </div>

                    {vaccine.intervalDays && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Intervalo:</span>
                        <span className="font-medium text-gray-900">
                          {vaccine.intervalDays} dias
                        </span>
                      </div>
                    )}

                    {vaccine.minStockLevel && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estoque Mínimo:</span>
                        <span className="font-medium text-gray-900">
                          {vaccine.minStockLevel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVaccine(vaccine);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>

                    {isManager && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-danger-600 hover:bg-danger-50 hover:border-danger-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVaccine(vaccine);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} vacinas)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext || isLoading}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Vaccine Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Adicionar Nova Vacina"
        size="lg"
      >
        <VaccineForm
          mode="create"
          onSubmit={handleCreateVaccine}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Vaccine Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVaccine(null);
        }}
        title="Editar Vacina"
        size="lg"
      >
        {selectedVaccine && (
          <VaccineForm
            mode="edit"
            initialData={selectedVaccine}
            onSubmit={handleEditVaccine}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedVaccine(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedVaccine(null);
        }}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja excluir a vacina{' '}
            <span className="font-semibold">{selectedVaccine?.name}</span>?
          </p>
          <p className="text-sm text-gray-600">
            Esta ação não pode ser desfeita. Todos os dados associados a esta vacina serão removidos.
          </p>

          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedVaccine(null);
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteVaccine}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
