import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DaySchedulingsList } from '../../components/nurseSchedule/DaySchedulingsList';
import { MonthlyCalendar } from '../../components/nurseSchedule/MonthlyCalendar';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { UnifiedApplicationForm } from '../../components/vaccineApplications/UnifiedApplicationForm';
import { useVaccineApplications } from '../../hooks/useVaccineApplications';
import { vaccineSchedulingService } from '../../services/vaccineScheduling.service';
import type { MonthlySchedulingsResponse } from '../../services/vaccineScheduling.service';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/user.service';
import { UserRole } from '../../types';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

/**
 * NurseSchedulePage - Monthly calendar view of nurse schedulings
 * Access: NURSE only
 */
export const NurseSchedulePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { createApplication } = useVaccineApplications();

  // Month/Year state
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  // Schedulings state
  const [schedulings, setSchedulings] = useState<MonthlySchedulingsResponse>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected day state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedSchedulingId, setSelectedSchedulingId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reassign nurse modal state
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignSchedulingId, setReassignSchedulingId] = useState<string | null>(null);
  const [nurses, setNurses] = useState<any[]>([]);
  const [selectedNurseId, setSelectedNurseId] = useState<string>('');
  const [loadingNurses, setLoadingNurses] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  // Fetch schedulings when month/year changes
  useEffect(() => {
    const fetchSchedulings = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await vaccineSchedulingService.getNurseMonthlySchedulings(
          user.id,
          year,
          month - 1, // Convert from 1-12 to 0-11 for API
        );
        setSchedulings(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar agendamentos';
        setError(errorMessage);
        console.error('Error fetching schedulings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedulings();
  }, [user?.id, year, month]);

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseDayList = () => {
    setSelectedDate(null);
  };

  const handleApplyVaccine = (schedulingId: string) => {
    setSelectedSchedulingId(schedulingId);
    setShowApplicationModal(true);
  };

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedSchedulingId(null);
  };

  const handleApplicationSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createApplication(data);
      handleCloseApplicationModal();

      // Refresh schedulings to show updated status
      if (user?.id) {
        const refreshedData =
          await vaccineSchedulingService.getNurseMonthlySchedulings(
            user.id,
            year,
            month - 1, // Convert from 1-12 to 0-11 for API
          );
        setSchedulings(refreshedData);
      }
    } catch (err) {
      console.error('Error creating application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelScheduling = async (schedulingId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await vaccineSchedulingService.delete(schedulingId);

      // Refresh schedulings
      if (user?.id) {
        const refreshedData = await vaccineSchedulingService.getNurseMonthlySchedulings(
          user.id,
          year,
          month - 1,
        );
        setSchedulings(refreshedData);
      }
    } catch (err) {
      console.error('Error canceling scheduling:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cancelar agendamento');
    }
  };

  const handleReassignNurse = async (schedulingId: string) => {
    setReassignSchedulingId(schedulingId);
    setShowReassignModal(true);

    // Load nurses
    setLoadingNurses(true);
    try {
      const response = await userService.list({ role: UserRole.NURSE, page: 1, perPage: 100 });
      setNurses(response.data);
    } catch (err) {
      console.error('Error loading nurses:', err);
      setError('Erro ao carregar lista de enfermeiros');
    } finally {
      setLoadingNurses(false);
    }
  };

  const handleCloseReassignModal = () => {
    setShowReassignModal(false);
    setReassignSchedulingId(null);
    setSelectedNurseId('');
  };

  const handleConfirmReassign = async () => {
    if (!reassignSchedulingId || !selectedNurseId) {
      return;
    }

    setIsReassigning(true);
    try {
      await vaccineSchedulingService.update(reassignSchedulingId, {
        nurseId: selectedNurseId,
      });

      handleCloseReassignModal();

      // Refresh schedulings
      if (user?.id) {
        const refreshedData = await vaccineSchedulingService.getNurseMonthlySchedulings(
          user.id,
          year,
          month - 1,
        );
        setSchedulings(refreshedData);
      }
    } catch (err) {
      console.error('Error reassigning nurse:', err);
      setError(err instanceof Error ? err.message : 'Erro ao reatribuir enfermeiro');
    } finally {
      setIsReassigning(false);
    }
  };

  const getMonthName = () => {
    return new Date(year, month - 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getSelectedDateSchedulings = () => {
    if (!selectedDate) return [];
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return schedulings[dateKey] || [];
  };

  const getTotalSchedulings = () => {
    return Object.values(schedulings).reduce(
      (total, daySchedulings) => total + daySchedulings.length,
      0,
    );
  };

  const getScheduledCount = () => {
    return Object.values(schedulings).reduce(
      (total, daySchedulings) =>
        total + daySchedulings.filter((s) => s.status === 'SCHEDULED').length,
      0,
    );
  };

  const getCompletedCount = () => {
    return Object.values(schedulings).reduce(
      (total, daySchedulings) =>
        total + daySchedulings.filter((s) => s.status === 'COMPLETED').length,
      0,
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minha Agenda</h1>
            <p className="text-gray-600 mt-1">
              Visualize seus agendamentos mensais de vacinação
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg flex justify-between items-center">
            <p className="text-danger-700">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              Fechar
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total de Agendamentos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {getTotalSchedulings()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Agendados</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {getScheduledCount()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {getCompletedCount()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Month Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <CardTitle className="flex items-center gap-2 capitalize">
                <CalendarIcon className="h-5 w-5" />
                {getMonthName()}
              </CardTitle>

              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <MonthlyCalendar
                year={year}
                month={month}
                schedulings={schedulings}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
              />
            </div>

            {/* Day Schedulings List */}
            <div>
              {selectedDate ? (
                <DaySchedulingsList
                  date={selectedDate}
                  schedulings={getSelectedDateSchedulings()}
                  onClose={handleCloseDayList}
                  onApplyVaccine={handleApplyVaccine}
                  onCancelScheduling={handleCancelScheduling}
                  onReassignNurse={handleReassignNurse}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Selecione um dia no calendário para ver os agendamentos
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && getTotalSchedulings() === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum agendamento para este mês</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={handleCloseApplicationModal}
        title="Registrar Aplicação de Vacina"
        size="lg"
      >
        <UnifiedApplicationForm
          onSubmit={handleApplicationSubmit}
          onCancel={handleCloseApplicationModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Reassign Nurse Modal */}
      <Modal
        isOpen={showReassignModal}
        onClose={handleCloseReassignModal}
        title="Reatribuir Enfermeiro(a)"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione um novo enfermeiro(a) para este agendamento:
          </p>

          {loadingNurses ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : (
            <div>
              <label htmlFor="nurseSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Enfermeiro(a) <span className="text-red-500">*</span>
              </label>
              <select
                id="nurseSelect"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedNurseId}
                onChange={(e) => setSelectedNurseId(e.target.value)}
                disabled={isReassigning}
              >
                <option value="">Selecione um enfermeiro(a)</option>
                {nurses.map((nurse) => (
                  <option key={nurse.id} value={nurse.id}>
                    {nurse.name}
                    {nurse.coren && ` - COREN: ${nurse.coren}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleCloseReassignModal}
              disabled={isReassigning}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReassign}
              disabled={!selectedNurseId || isReassigning}
              isLoading={isReassigning}
            >
              {isReassigning ? 'Reatribuindo...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
