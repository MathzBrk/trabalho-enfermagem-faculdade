import React, { useEffect } from 'react';
import { Download, Calendar, User as UserIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VaccineHistoryStats } from '../../components/vaccineApplications/VaccineHistoryStats';
import { VaccinesByTypeList } from '../../components/vaccineApplications/VaccinesByTypeList';
import { PendingDosesList } from '../../components/vaccineApplications/PendingDosesList';
import { MandatoryVaccinesList } from '../../components/vaccineApplications/MandatoryVaccinesList';
import { OptionalVaccinesList } from '../../components/vaccineApplications/OptionalVaccinesList';
import { useVaccinationHistory } from '../../hooks/useVaccinationHistory';
import { useAuthStore } from '../../store/authStore';

/**
 * Vaccination Card Page
 * Displays complete vaccination history for the logged-in user
 * Access: EMPLOYEE/MANAGER/NURSE - shows only their own card
 * Note: Nurses view other users' cards via VaccinationCardModal in VaccineApplicationsPage
 */
export const VaccinationCardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { history, isLoading, error, fetchHistory, clearError } = useVaccinationHistory();

  // Fetch logged-in user's vaccination history
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserHistory = async () => {
      try {
        await fetchHistory(user.id);
      } catch (err) {
        console.error('Error fetching vaccination history:', err);
      }
    };

    fetchUserHistory();
  }, [user?.id, fetchHistory]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!history || !user) return;

    // Create a simple text export
    let exportText = '=== CARTÃO DE VACINAÇÃO ===\n\n';
    exportText += `Paciente: ${user.name}\n`;
    exportText += `CPF: ${user.cpf}\n`;
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
            <h1 className="text-3xl font-bold text-gray-900">Meu Cartão de Vacinação</h1>
            <p className="text-gray-600 mt-1">
              Seu histórico completo de vacinação e doses pendentes
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
        {user && (
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">CPF:</span> {user.cpf}
                    </p>
                    {user.email && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-600 text-white text-sm rounded-full">
                  Seu cartão
                </span>
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

            {/* Optional Vaccines Not Taken */}
            {history.optionalNotTaken.length > 0 && (
              <OptionalVaccinesList optionalNotTaken={history.optionalNotTaken} />
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
