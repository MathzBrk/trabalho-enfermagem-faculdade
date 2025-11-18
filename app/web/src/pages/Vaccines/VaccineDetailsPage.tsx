import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Package } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { VaccineForm } from '../../components/vaccines/VaccineForm';
import { VaccineBatchForm } from '../../components/vaccines/VaccineBatchForm';
import { VaccineBatchList } from '../../components/vaccines/VaccineBatchList';
import { useVaccines } from '../../hooks/useVaccines';
import { useVaccineBatches } from '../../hooks/useVaccineBatches';
import { formatDate } from '../../utils/formatters';
import type { Vaccine, VaccineBatch, VaccineBatchStatus } from '../../types';
import type { UpdateVaccineFormData, CreateVaccineBatchFormData, UpdateVaccineBatchFormData } from '../../utils/vaccineSchemas';

/**
 * Vaccine Details Page
 * Displays detailed information about a vaccine and its batches
 */
export const VaccineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getVaccineById, updateVaccine, isLoading: vaccineLoading, error: vaccineError } = useVaccines();
  const {
    batches,
    pagination,
    isLoading: batchesLoading,
    error: batchesError,
    fetchBatches,
    createBatch,
    updateBatch,
  } = useVaccineBatches();

  const [vaccine, setVaccine] = useState<Vaccine | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<VaccineBatchStatus | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<VaccineBatch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vaccine details on mount
  useEffect(() => {
    if (id) {
      loadVaccine();
    }
  }, [id]);

  // Fetch batches when vaccine is loaded or filters change
  useEffect(() => {
    if (id) {
      const params = {
        page: currentPage,
        perPage: 10,
        sortBy: 'expirationDate',
        sortOrder: 'asc' as const,
        ...(statusFilter && { status: statusFilter }),
      };
      fetchBatches(id, params);
    }
  }, [id, currentPage, statusFilter, fetchBatches]);

  const loadVaccine = async () => {
    if (!id) return;
    try {
      const data = await getVaccineById(id);
      setVaccine(data as Vaccine);
    } catch (err) {
      console.error('Error loading vaccine:', err);
    }
  };

  const handleEditVaccine = async (data: UpdateVaccineFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updated = await updateVaccine(id, data);
      setVaccine(updated);
      setShowEditModal(false);
    } catch (err) {
      console.error('Update vaccine error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBatch = async (data: CreateVaccineBatchFormData) => {
    setIsSubmitting(true);
    try {
      await createBatch({ ...data, vaccineId: id! });
      setShowBatchModal(false);
      // Refresh vaccine to update total stock
      loadVaccine();
    } catch (err) {
      console.error('Create batch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBatch = async (data: UpdateVaccineBatchFormData) => {
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      await updateBatch(selectedBatch.id, data);
      setShowEditBatchModal(false);
      setSelectedBatch(null);
      // Refresh vaccine to update total stock
      loadVaccine();
    } catch (err) {
      console.error('Update batch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditBatch = (batch: VaccineBatch) => {
    setSelectedBatch(batch);
    setShowEditBatchModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: VaccineBatchStatus | null) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (vaccineLoading && !vaccine) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando vacina...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (vaccineError || !vaccine) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardContent className="py-8">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-danger-600 font-semibold">
                  {vaccineError || 'Vacina não encontrada'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/vaccines')}
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Vacinas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigate('/vaccines')}
            className="hover:text-primary-600 transition-colors"
          >
            Vacinas
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{vaccine.name}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{vaccine.name}</h1>
              {vaccine.isObligatory && (
                <Badge variant="info">Obrigatória</Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">{vaccine.manufacturer}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/vaccines')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar Vacina
            </Button>
          </div>
        </div>

        {/* Vaccine Information Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Vacina</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vaccine.description && (
                  <div>
                    <p className="text-sm text-gray-600">Descrição</p>
                    <p className="text-gray-900 mt-1">{vaccine.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Número de Doses</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {vaccine.dosesRequired}
                    </p>
                  </div>

                  {vaccine.intervalDays && (
                    <div>
                      <p className="text-sm text-gray-600">Intervalo entre Doses</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {vaccine.intervalDays} dias
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Estoque Total</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {vaccine.totalStock}
                    </p>
                  </div>

                  {vaccine.minStockLevel && (
                    <div>
                      <p className="text-sm text-gray-600">Estoque Mínimo</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {vaccine.minStockLevel}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Criado em</p>
                      <p className="text-gray-900 mt-1">{formatDate(vaccine.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Atualizado em</p>
                      <p className="text-gray-900 mt-1">{formatDate(vaccine.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700 font-medium mb-1">
                    Estoque Disponível
                  </p>
                  <p className="text-3xl font-bold text-primary-900">
                    {vaccine.totalStock}
                  </p>
                  <p className="text-sm text-primary-600 mt-1">doses em estoque</p>
                </div>

                {vaccine.minStockLevel && (
                  <div
                    className={`p-4 rounded-lg ${
                      vaccine.totalStock <= vaccine.minStockLevel
                        ? 'bg-danger-50'
                        : 'bg-success-50'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-1 ${
                        vaccine.totalStock <= vaccine.minStockLevel
                          ? 'text-danger-700'
                          : 'text-success-700'
                      }`}
                    >
                      {vaccine.totalStock <= vaccine.minStockLevel
                        ? 'Estoque Baixo'
                        : 'Estoque Adequado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estoque mínimo: {vaccine.minStockLevel} doses
                    </p>
                  </div>
                )}

                <Button onClick={() => setShowBatchModal(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Lote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batches Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lotes da Vacina</CardTitle>
              <Button size="sm" onClick={() => setShowBatchModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {batchesError && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg mb-4">
                <p className="text-danger-700">{batchesError}</p>
              </div>
            )}

            <VaccineBatchList
              batches={batches}
              pagination={pagination}
              onPageChange={handlePageChange}
              onStatusFilter={handleStatusFilter}
              onEditBatch={handleOpenEditBatch}
              isLoading={batchesLoading}
              selectedStatus={statusFilter}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Vaccine Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Vacina"
        size="lg"
      >
        <VaccineForm
          mode="edit"
          initialData={vaccine}
          onSubmit={handleEditVaccine}
          onCancel={() => setShowEditModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Add Batch Modal */}
      <Modal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title="Adicionar Lote de Vacina"
        size="md"
      >
        <VaccineBatchForm
          mode="create"
          vaccineId={id}
          onSubmit={handleCreateBatch}
          onCancel={() => setShowBatchModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Batch Modal */}
      <Modal
        isOpen={showEditBatchModal}
        onClose={() => {
          setShowEditBatchModal(false);
          setSelectedBatch(null);
        }}
        title="Editar Lote de Vacina"
        size="md"
      >
        {selectedBatch && (
          <VaccineBatchForm
            mode="edit"
            vaccineId={id}
            initialData={selectedBatch}
            onSubmit={handleEditBatch}
            onCancel={() => {
              setShowEditBatchModal(false);
              setSelectedBatch(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
};
