import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Syringe,
  Bell,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { vaccineService } from '../../services/vaccine.service';
import { notificationService } from '../../services/notification.service';
import type { VaccineScheduling, VaccineApplication, Notification } from '../../types';
import { formatDate, formatDateTime } from '../../utils/formatters';

/**
 * Employee Dashboard - Shows vaccination info and schedules
 */
export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [schedulings, setSchedulings] = useState<VaccineScheduling[]>([]);
  const [applications, setApplications] = useState<VaccineApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const [schedulingsData, applicationsData, notificationsData] =
          await Promise.all([
            vaccineService.listSchedulings(user.id),
            vaccineService.listApplications(user.id),
            notificationService.list(user.id, false),
          ]);

        setSchedulings(schedulingsData);
        setApplications(applicationsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Get next scheduled vaccination
  const nextScheduling = schedulings
    .filter((s) => new Date(s.scheduledDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    )[0];

  // Get recent applications (last 5)
  const recentApplications = applications
    .sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime()
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
          Bem-vindo, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Acompanhe suas vacinas e agendamentos
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próxima Vacina</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {nextScheduling ? formatDate(nextScheduling.scheduledDate) : '-'}
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
                <p className="text-sm text-gray-600">Vacinas Aplicadas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {applications.length}
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
                <p className="text-sm text-gray-600">Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {schedulings.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notificações</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {notifications.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next vaccination */}
        <Card>
          <CardHeader>
            <CardTitle>Próximo Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            {nextScheduling ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Vacina</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {nextScheduling.vaccine?.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Data e Hora</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(nextScheduling.scheduledDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dose</p>
                    <p className="text-sm font-medium text-gray-900">
                      {nextScheduling.doseNumber}ª dose
                    </p>
                  </div>
                </div>
                {nextScheduling.assignedNurse && (
                  <div>
                    <p className="text-sm text-gray-600">Enfermeiro</p>
                    <p className="text-sm font-medium text-gray-900">
                      {nextScheduling.assignedNurse.name}
                    </p>
                  </div>
                )}
                {nextScheduling.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="text-sm text-gray-900">
                      {nextScheduling.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum agendamento próximo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <Badge variant="info" size="sm">
                        Novo
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma notificação nova</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vaccination history */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vacinação</CardTitle>
        </CardHeader>
        <CardContent>
          {recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Vacina
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Dose
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Enfermeiro
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {application.vaccine?.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(application.applicationDate)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {application.doseNumber}ª dose
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {application.nurse?.name}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={application.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Syringe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma vacina aplicada ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
