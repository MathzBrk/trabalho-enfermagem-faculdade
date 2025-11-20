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

/**
 * NurseSchedulePage - Monthly calendar view of nurse schedulings
 * Access: NURSE only
 */
export const NurseSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { createApplication } = useVaccineApplications();

  // Month/Year state
  const [currentDate, setCurrentDate] = useState(new Date());
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
          prefilledSchedulingId={selectedSchedulingId || undefined}
        />
      </Modal>
    </DashboardLayout>
  );
};
