import React, { useEffect, useState } from 'react';
import { Calendar, User as UserIcon, Download, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { VaccineHistoryStats } from './VaccineHistoryStats';
import { VaccinesByTypeList } from './VaccinesByTypeList';
import { PendingDosesList } from './PendingDosesList';
import { MandatoryVaccinesList } from './MandatoryVaccinesList';
import { OptionalVaccinesList } from './OptionalVaccinesList';
import { useVaccinationHistory } from '../../hooks/useVaccinationHistory';
import { userService } from '../../services/user.service';
import type { User } from '../../types';

interface VaccinationCardModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * VaccinationCardModal - Displays vaccination card in a modal
 * Used by nurses to view patient vaccination history without navigation
 */
export const VaccinationCardModal: React.FC<VaccinationCardModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const { history, isLoading, error, fetchHistory, clearError } = useVaccinationHistory();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Fetch user info and history when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUserAndHistory = async () => {
      setLoadingUser(true);

      try {
        // Fetch target user info
        const userData = await userService.getById(userId);
        setTargetUser(userData);

        // Fetch vaccination history
        await fetchHistory(userId);
      } catch (err) {
        console.error('Error fetching user info:', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndHistory();
  }, [userId, isOpen, fetchHistory]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTargetUser(null);
      clearError();
    }
  }, [isOpen, clearError]);

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
    a.download = `cartao-vacinacao-${targetUser.name.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" showCloseButton={false}>
      {/* Custom Header with close button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Cartão de Vacinação</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!history}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {/* User Info Card */}
        {targetUser && (
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{targetUser.name}</h3>
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
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Visualizando como enfermeiro(a)
                </span>
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

        {/* Loading History State */}
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
                  <span>Emitido em: {new Date(history.issuedAt).toLocaleString('pt-BR')}</span>
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
    </Modal>
  );
};
