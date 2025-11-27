import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import {
  type FilterValues,
  SchedulingCard,
  SchedulingFilters,
} from '../../components/vaccineScheduling';
import { useAuth } from '../../hooks/useAuth';
import { useVaccineSchedulings } from '../../hooks/useVaccineSchedulings';
import { useVaccines } from '../../hooks/useVaccines';
import { userService } from '../../services/user.service';
import type { User } from '../../types';

/**
 * Schedulings List Page - "Meus Agendamentos"
 * Displays user's vaccine appointments where they are the PATIENT
 *
 * USE CASE: My Appointments (ALL ROLES)
 * - Shows appointments where authenticated user is the PATIENT
 * - Does NOT show nurse assignments
 * - Available to: NURSE, EMPLOYEE, MANAGER
 *
 * Note: Nurses have TWO separate views:
 * 1. This page (/schedulings) - Their personal appointments as patient
 * 2. Nurse Dashboard/Schedule - Appointments they're assigned to handle
 */
export const SchedulingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isManager, user } = useAuth();

  const {
    schedulings,
    pagination,
    isLoading,
    error,
    fetchSchedulings,
    confirmScheduling,
    cancelScheduling,
    clearError,
  } = useVaccineSchedulings();

  const { vaccines, fetchVaccines } = useVaccines();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({});
  const [users, setUsers] = useState<User[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSchedulingId, setSelectedSchedulingId] = useState<
    string | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load vaccines and users on mount
  useEffect(() => {
    fetchVaccines({ page: 1, perPage: 100 });

    // Load users if manager
    if (isManager) {
      userService
        .list({ page: 1, perPage: 1000 })
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.error('Error loading users:', error);
        });
    }
  }, [isManager, fetchVaccines]);

  // Fetch schedulings when page or filters change
  // IMPORTANT: We pass userId to explicitly request patient appointments only
  useEffect(() => {
    if (!user?.id) return;

    const params = {
      page: currentPage,
      limit: 12,
      userId: user.id, // Explicit: Show appointments where user is PATIENT
      ...filters,
    };
    fetchSchedulings(params);
  }, [currentPage, filters, fetchSchedulings, user?.id]);

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleConfirm = async (id: string) => {
    if (!user?.id) return;

    setActionLoading(true);
    try {
      await confirmScheduling(id);
      // Refresh list
      fetchSchedulings({
        page: currentPage,
        limit: 12,
        userId: user.id, // Explicit: Show patient appointments only
        ...filters,
      });
    } catch (err) {
      console.error('Error confirming scheduling:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = (id: string) => {
    setSelectedSchedulingId(id);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSchedulingId || !user?.id) return;

    setActionLoading(true);
    try {
      await cancelScheduling(selectedSchedulingId);
      setShowCancelModal(false);
      setSelectedSchedulingId(null);
      // Refresh list
      fetchSchedulings({
        page: currentPage,
        limit: 12,
        userId: user.id, // Explicit: Show patient appointments only
        ...filters,
      });
    } catch (err) {
      console.error('Error canceling scheduling:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Meus Agendamentos
            </h1>
            <p className="text-gray-600 mt-2">
              Visualize e gerencie seus agendamentos de vacinas
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/schedulings/new')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <SchedulingFilters
            onFilterChange={handleFilterChange}
            vaccines={vaccines}
            users={users}
            showUserFilter={isManager}
            isLoading={isLoading}
          />
        </div>

        {/* Schedulings list */}
        {isLoading && schedulings.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando agendamentos...</p>
            </div>
          </div>
        ) : schedulings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {Object.keys(filters).length > 0
                    ? 'Tente ajustar os filtros ou criar um novo agendamento.'
                    : 'Comece criando seu primeiro agendamento de vacina.'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/schedulings/new')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedulings.map((scheduling) => (
                <SchedulingCard
                  key={scheduling.id}
                  scheduling={scheduling}
                  showUserInfo={isManager}
                  onConfirm={handleConfirm}
                  onCancel={handleCancelClick}
                  isLoading={actionLoading}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.perPage + 1}
                  </span>{' '}
                  até{' '}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.perPage,
                      pagination.total,
                    )}
                  </span>{' '}
                  de <span className="font-medium">{pagination.total}</span>{' '}
                  agendamentos
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>

                  <span className="text-sm text-gray-700">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext || isLoading}
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          if (!actionLoading) {
            setShowCancelModal(false);
            setSelectedSchedulingId(null);
          }
        }}
        title="Cancelar Agendamento"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja cancelar este agendamento? Esta ação não pode
            ser desfeita.
          </p>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCancelModal(false);
                setSelectedSchedulingId(null);
              }}
              disabled={actionLoading}
            >
              Não, manter
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelConfirm}
              isLoading={actionLoading}
              disabled={actionLoading}
            >
              Sim, cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
