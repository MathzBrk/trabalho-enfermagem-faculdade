import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  RefreshCw,
  Syringe,
  TrendingUp,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { AlertCard } from '../../components/alerts/AlertCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { VaccinationCoverage } from '../../components/vaccination-coverage/VaccinationCoverage';
import { useAlerts } from '../../hooks/useAlerts';
import { useVaccinationCoverage } from '../../hooks/useVaccinationCoverage';
import { userService } from '../../services/user.service';
import { vaccineService } from '../../services/vaccine.service';
import type {
  User,
  Vaccine,
  VaccineApplication,
  VaccineScheduling,
} from '../../types';
import { formatDate } from '../../utils/formatters';

/**
 * Manager Dashboard - Shows overview stats and management tools
 */
export const ManagerDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [applications, setApplications] = useState<VaccineApplication[]>([]);
  const [schedulings, setSchedulings] = useState<VaccineScheduling[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time alerts from API
  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useAlerts();

  // Fetch vaccination coverage data from API
  const {
    coverage,
    loading: coverageLoading,
    error: coverageError,
    refetch: refetchCoverage,
  } = useVaccinationCoverage();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersData, vaccinesData, applicationsData, schedulingsData] =
          await Promise.all([
            userService.listUsers(),
            vaccineService.listVaccines(),
            vaccineService.listApplications(),
            vaccineService.listSchedulings(),
          ]);

        setUsers(usersData);
        setVaccines(vaccinesData);
        setApplications(applicationsData);
        setSchedulings(schedulingsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  console.log(`Users loaded: ${users.length}`);

  // Calculate stats - count all active users (employees, nurses, managers)
  const totalEmployees = users.filter((u) => u.isActive).length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyApplications = applications.filter(
    (a) => new Date(a.applicationDate) >= thisMonth,
  ).length;

  // Get total alerts count from API instead of calculating locally
  const totalAlertsCount = alerts.reduce(
    (sum, alert) => sum + alert.objects.length,
    0,
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Painel do Gerente</h1>
        <p className="text-gray-600 mt-1">
          Visão geral do sistema de vacinação
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total de Funcionários Ativos
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalEmployees}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vacinas Cadastradas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {vaccines.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <Syringe className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aplicações (Mês)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {monthlyApplications}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalAlertsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts from API */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Alertas do Sistema
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Monitoramento em tempo real de estoque e validade
            </p>
          </div>
          <button
            type="button"
            onClick={refetchAlerts}
            disabled={alertsLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Atualizar alertas"
          >
            <RefreshCw
              className={`h-4 w-4 ${alertsLoading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </button>
        </div>

        {/* Loading State */}
        {alertsLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <RefreshCw className="h-8 w-8 animate-spin mb-3" />
                <p>Carregando alertas...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!alertsLoading && alertsError && (
          <Card className="border-danger-200 bg-danger-50">
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-danger-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-danger-900">
                    Erro ao carregar alertas
                  </p>
                  <p className="text-sm text-danger-700 mt-1">{alertsError}</p>
                  <button
                    type="button"
                    onClick={refetchAlerts}
                    className="mt-3 text-sm font-medium text-danger-600 hover:text-danger-700 underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Alerts State */}
        {!alertsLoading && !alertsError && alerts.length === 0 && (
          <Card className="border-success-200 bg-success-50">
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-success-700">
                <CheckCircle className="h-12 w-12 mb-3" />
                <p className="font-medium text-lg">Nenhum alerta ativo</p>
                <p className="text-sm text-success-600 mt-1">
                  Sistema operando normalmente. Todos os indicadores estão
                  dentro dos parâmetros.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts List */}
        {!alertsLoading && !alertsError && alerts.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((alert, index) => (
              <AlertCard key={`${alert.alertType}-${index}`} alert={alert} />
            ))}
          </div>
        )}
      </div>

      {/* Vaccination Coverage Section */}
      {coverageLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mb-3" />
              <p>Carregando dados de cobertura vacinal...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!coverageLoading && coverageError && (
        <Card className="border-danger-200 bg-danger-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-danger-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-danger-900">
                  Erro ao carregar dados de cobertura vacinal
                </p>
                <p className="text-sm text-danger-700 mt-1">{coverageError}</p>
                <button
                  type="button"
                  onClick={refetchCoverage}
                  className="mt-3 text-sm font-medium text-danger-600 hover:text-danger-700 underline"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!coverageLoading && !coverageError && coverage && (
        <VaccinationCoverage
          data={coverage}
          onRefresh={refetchCoverage}
          isRefreshing={coverageLoading}
        />
      )}

      {/* Upcoming schedulings */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {schedulings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Funcionário
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Vacina
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Enfermeiro
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Dose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedulings.slice(0, 5).map((scheduling) => (
                    <tr
                      key={scheduling.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {scheduling.user?.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {scheduling.vaccine?.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(scheduling.scheduledDate)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {scheduling.assignedNurse?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {scheduling.doseNumber}ª dose
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum agendamento próximo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
