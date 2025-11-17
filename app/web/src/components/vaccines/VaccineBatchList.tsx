import React from 'react';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import type { VaccineBatch, VaccineBatchStatus, Pagination } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';

interface VaccineBatchListProps {
  batches: VaccineBatch[];
  pagination: Pagination | null;
  onPageChange?: (page: number) => void;
  onStatusFilter?: (status: VaccineBatchStatus | null) => void;
  onEditBatch?: (batch: VaccineBatch) => void;
  isLoading?: boolean;
  selectedStatus?: VaccineBatchStatus | null;
}

/**
 * Reusable table component for displaying vaccine batches
 */
export const VaccineBatchList: React.FC<VaccineBatchListProps> = ({
  batches,
  pagination,
  onPageChange,
  onStatusFilter,
  onEditBatch,
  isLoading = false,
  selectedStatus = null,
}) => {
  const getStatusBadge = (status: VaccineBatchStatus) => {
    const statusConfig = {
      AVAILABLE: { variant: 'success' as const, label: 'Disponível' },
      EXPIRED: { variant: 'danger' as const, label: 'Expirado' },
      DEPLETED: { variant: 'warning' as const, label: 'Esgotado' },
      DISCARDED: { variant: 'default' as const, label: 'Descartado' },
    };

    const config = statusConfig[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando lotes...</p>
        </div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhum lote encontrado</p>
        <p className="text-sm text-gray-500 mt-1">
          {selectedStatus
            ? 'Tente alterar o filtro de status'
            : 'Adicione um lote para começar'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      {onStatusFilter && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => onStatusFilter(e.target.value as VaccineBatchStatus | null || null)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos</option>
            <option value="AVAILABLE">Disponível</option>
            <option value="EXPIRED">Expirado</option>
            <option value="DEPLETED">Esgotado</option>
            <option value="DISCARDED">Descartado</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Número do Lote
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Quantidade
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Data de Validade
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Data de Recebimento
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
              {onEditBatch && (
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {batch.batchNumber}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <span className="font-medium text-gray-900">
                    {batch.currentQuantity}
                  </span>
                  {' / '}
                  <span className="text-gray-500">{batch.initialQuantity}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(batch.expirationDate)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(batch.receivedDate)}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(batch.status)}
                </td>
                {onEditBatch && (
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditBatch(batch)}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} lotes)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext || isLoading}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
