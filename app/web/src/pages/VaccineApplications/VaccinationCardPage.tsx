import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Calendar, User as UserIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VaccineHistoryStats } from '../../components/vaccineApplications/VaccineHistoryStats';
import { VaccinesByTypeList } from '../../components/vaccineApplications/VaccinesByTypeList';
import { PendingDosesList } from '../../components/vaccineApplications/PendingDosesList';
import { MandatoryVaccinesList } from '../../components/vaccineApplications/MandatoryVaccinesList';
import { useVaccinationHistory } from '../../hooks/useVaccinationHistory';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type User } from '../../types';
import { userService } from '../../services/user.service';

/**
 * Vaccination Card Page
 * Displays complete vaccination history for a user
 * Access:
 *  - EMPLOYEE/MANAGER: Only their own card (userId param optional)
 *  - NURSE: Any user's card (userId param required)
 */
export const VaccinationCardPage: React.FC = () => {
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const user = useAuthStore((state) => state.user);
  const { history, isLoading, error, fetchHistory, clearError } = useVaccinationHistory();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Determine which user's history to fetch
  const targetUserId = urlUserId || user?.id;

  // Fetch target user info and validate access rights
  useEffect(() => {
    if (!user || !targetUserId) return;

    const fetchUserAndHistory = async () => {
      setLoadingUser(true);

      try {
        // If viewing own card, use current user info
        if (targetUserId === user.id) {
          setTargetUser(user);
        } else {
          // Fetch target user info
          const userData = await userService.getById(targetUserId);
          setTargetUser(userData);
        }

        // NURSE can view any user's card
        if (user.role === UserRole.NURSE) {
          await fetchHistory(targetUserId);
          return;
        }

        // EMPLOYEE/MANAGER can only view their own card
        if (user.role === UserRole.EMPLOYEE || user.role === UserRole.MANAGER) {
          if (targetUserId === user.id) {
            await fetchHistory(targetUserId);
          } else {
            // Redirect or show error - trying to access another user's card
            console.error('Access denied: Can only view your own vaccination history');
          }
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndHistory();
  }, [user, targetUserId, fetchHistory]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!history || !targetUser) return;

    // Create a simple text export
    let exportText = '=== CARTÃO DE VACINAÇÃO ===\n\n';
    exportText += `Paciente: ${targetUser.name}\n`;
    exportText += `CPF: ${targetUser.cpf}\n`;
    exportText += `Emitido em: ${new Date(history.issuedAt).toLocaleString('pt-BR')}\n\n`;

    exportText += '=== RESUMO ===\n';
    exportText += `Vacinas Aplicadas: ${history.summary.totalVaccinesApplied}\n`;
    exportText += `Vacinas Completas: ${history.summary.totalVaccinesCompleted}\n`;
    exportText += `Doses Pendentes: ${history.summary.totalDosesPending}\n`;
    exportText += `Obrigatórias Pendentes: ${history.summary.totalMandatoryPending}\n`;
    exportText += `Conformidade: ${history.summary.compliancePercentage}%\n\n`;

    exportText += '=== VACINAS APLICADAS ===\n';
    history.vaccinesByType.forEach((vt) => {
      exportText += `\n${vt.vaccine.name} (${vt.vaccine.manufacturer})\n`;
      exportText += `Status: ${vt.isComplete ? 'Completa' : 'Em andamento'}\n`;
      exportText += `Doses: ${vt.dosesApplied}/${vt.totalDosesRequired}\n`;
      vt.doses.forEach((dose) => {
        exportText += `  Dose ${dose.doseNumber}: ${new Date(dose.applicationDate).toLocaleDateString('pt-BR')}\n`;
        exportText += `    Local: ${dose.applicationSite}\n`;
        exportText += `    Lote: ${dose.batch.batchNumber}\n`;
        exportText += `    Aplicado por: ${dose.appliedBy.name}\n`;
      });
    });

    // Create download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartao-vacinacao-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cartão de Vacinação</h1>
            <p className="text-gray-600 mt-1">
              Histórico completo de vacinação e doses pendentes
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!history}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={!history}>
              <Download className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        {targetUser && (
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{targetUser.name}</h2>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">CPF:</span> {targetUser.cpf}
                    </p>
                    {targetUser.email && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {targetUser.email}
                      </p>
                    )}
                  </div>
                </div>
                {targetUserId === user?.id ? (
                  <span className="px-3 py-1 bg-primary-600 text-white text-sm rounded-full">
                    Seu cartão
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    Visualizando como enfermeiro(a)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading User State */}
        {loadingUser && !targetUser && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-gray-600">Carregando informações do usuário...</p>
              </div>
            </CardContent>
          </Card>
        )}

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
        {isLoading && !history && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando histórico de vacinação...</p>
            </div>
          </div>
        )}

        {/* History Content */}
        {history && (
          <>
            {/* Issue Date */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Emitido em: {new Date(history.issuedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <VaccineHistoryStats summary={history.summary} />

            {/* Mandatory Vaccines Not Taken */}
            {history.mandatoryNotTaken.length > 0 && (
              <MandatoryVaccinesList mandatoryNotTaken={history.mandatoryNotTaken} />
            )}

            {/* Pending Doses */}
            {history.pendingDoses.length > 0 && (
              <PendingDosesList pendingDoses={history.pendingDoses} />
            )}

            {/* Vaccines by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vacinas</CardTitle>
              </CardHeader>
              <CardContent>
                <VaccinesByTypeList vaccinesByType={history.vaccinesByType} />
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !history && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum histórico de vacinação disponível</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
