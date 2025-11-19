import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Syringe,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { vaccineService } from '../../services/vaccine.service';
import type { VaccineScheduling } from '../../types';
import { formatDateTime, formatDate } from '../../utils/formatters';

/**
 * Nurse Dashboard - Shows appointments and quick actions
 */
export const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedulings, setSchedulings] = useState<VaccineScheduling[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const schedulingsData = await vaccineService.listSchedulingsForNurse(
          user.id
        );
        setSchedulings(schedulingsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySchedulings = schedulings.filter((s) => {
    const scheduleDate = new Date(s.scheduledDate);
    return scheduleDate >= today && scheduleDate < tomorrow;
  });

  // Get upcoming appointments
  const upcomingSchedulings = schedulings
    .filter((s) => new Date(s.scheduledDate) >= tomorrow)
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    )
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus agendamentos e aplicações
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {todaySchedulings.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {upcomingSchedulings.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {schedulings.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ações Rápidas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <Syringe className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              className="justify-start"
              onClick={() => navigate('/vaccine-applications/new')}
            >
              <Syringe className="h-5 w-5" />
              Aplicar Vacina
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/nurse-schedule')}
            >
              <Calendar className="h-5 w-5" />
              Ver Agenda Completa
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertCircle className="h-5 w-5" />
              Reportar Problema
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedulings.length > 0 ? (
              <div className="space-y-3">
                {todaySchedulings.map((scheduling) => (
                  <div
                    key={scheduling.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {scheduling.user?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {scheduling.vaccine?.name} - {scheduling.doseNumber}ª
                          dose
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(scheduling.scheduledDate)}
                        </p>
                      </div>
                      <Button size="sm" variant="primary">
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedulings.length > 0 ? (
              <div className="space-y-3">
                {upcomingSchedulings.map((scheduling) => (
                  <div
                    key={scheduling.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {scheduling.user?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {scheduling.vaccine?.name} - {scheduling.doseNumber}ª
                          dose
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(scheduling.scheduledDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum agendamento próximo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <p className="text-sm text-gray-600">
                Você aplicou a vacina COVID-19 em Ana Costa às 14:30
              </p>
              <span className="text-xs text-gray-500 ml-auto">Há 2 horas</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              <p className="text-sm text-gray-600">
                Novo agendamento confirmado para amanhã às 10:00
              </p>
              <span className="text-xs text-gray-500 ml-auto">Há 4 horas</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-warning-500 rounded-full" />
              <p className="text-sm text-gray-600">
                Lembrete: Verificar estoque de vacinas contra gripe
              </p>
              <span className="text-xs text-gray-500 ml-auto">Ontem</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
