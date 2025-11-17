import React, { useEffect, useState } from 'react';
import {
  Users,
  Syringe,
  TrendingUp,
  AlertTriangle,
  Package,
  Calendar,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { userService } from '../../services/user.service';
import { vaccineService } from '../../services/vaccine.service';
import type {
  User,
  Vaccine,
  VaccineBatch,
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
  const [batches, setBatches] = useState<VaccineBatch[]>([]);
  const [applications, setApplications] = useState<VaccineApplication[]>([]);
  const [schedulings, setSchedulings] = useState<VaccineScheduling[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersData, vaccinesData, batchesData, applicationsData, schedulingsData] =
          await Promise.all([
            userService.list({ page: 1, limit: 100 }),
            vaccineService.listVaccines(),
            vaccineService.listBatches(),
            vaccineService.listApplications(),
            vaccineService.listSchedulings(),
          ]);

        setUsers(usersData.data);
        setVaccines(vaccinesData);
        setBatches(batchesData);
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

  // Calculate stats
  const totalEmployees = users.filter((u) => u.role === 'EMPLOYEE').length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyApplications = applications.filter(
    (a) => new Date(a.applicationDate) >= thisMonth
  ).length;

  // Get expiring batches (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiringBatches = batches.filter(
    (b) => new Date(b.expirationDate) <= thirtyDaysFromNow
  );

  // Get low stock batches (< 20% available)
  const lowStockBatches = batches.filter(
    (b) => b.currentQuantity / b.initialQuantity < 0.2
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
        <h1 className="text-3xl font-bold text-gray-900">
          Painel do Gerente
        </h1>
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
                <p className="text-sm text-gray-600">Total Funcionários</p>
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
                <p className="text-sm text-gray-600">Lotes a Vencer</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {expiringBatches.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(expiringBatches.length > 0 || lowStockBatches.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringBatches.slice(0, 3).map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center gap-3 p-3 bg-danger-50 border border-danger-200 rounded-lg"
                >
                  <AlertTriangle className="h-5 w-5 text-danger-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-danger-900">
                      Lote próximo ao vencimento
                    </p>
                    <p className="text-xs text-danger-700">
                      {batch.vaccine?.name} - Lote {batch.batchNumber} vence em{' '}
                      {formatDate(batch.expirationDate)}
                    </p>
                  </div>
                  <Badge variant="danger" size="sm">
                    Urgente
                  </Badge>
                </div>
              ))}
              {lowStockBatches.slice(0, 2).map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center gap-3 p-3 bg-warning-50 border border-warning-200 rounded-lg"
                >
                  <Package className="h-5 w-5 text-warning-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warning-900">
                      Estoque baixo
                    </p>
                    <p className="text-xs text-warning-700">
                      {batch.vaccine?.name} - Apenas {batch.currentQuantity}{' '}
                      doses disponíveis
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">
                    Atenção
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vaccination coverage chart placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Cobertura Vacinal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Gráfico de cobertura vacinal
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Em desenvolvimento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Syringe className="h-4 w-4 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {applications[applications.length - 1]?.vaccine?.name}{' '}
                    aplicada
                  </p>
                  <p className="text-xs text-gray-500">Há 30 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Novo agendamento realizado
                  </p>
                  <p className="text-xs text-gray-500">Há 1 hora</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-warning-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Novo lote de vacinas registrado
                  </p>
                  <p className="text-xs text-gray-500">Há 3 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-danger-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Alerta de estoque baixo gerado
                  </p>
                  <p className="text-xs text-gray-500">Ontem</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Novo funcionário cadastrado
                  </p>
                  <p className="text-xs text-gray-500">Há 2 dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
