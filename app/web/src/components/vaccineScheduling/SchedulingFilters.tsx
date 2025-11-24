import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import type { VaccineSchedulingStatus, Vaccine, User } from '../../types';

interface SchedulingFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  vaccines?: Vaccine[];
  users?: User[];
  showUserFilter?: boolean;
  isLoading?: boolean;
}

export interface FilterValues {
  status?: VaccineSchedulingStatus;
  vaccineId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * SchedulingFilters component
 * Provides filtering options for the schedulings list
 */
export const SchedulingFilters: React.FC<SchedulingFiltersProps> = ({
  onFilterChange,
  vaccines = [],
  users = [],
  showUserFilter = false,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterValues, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      {/* Toggle button for mobile */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as VaccineSchedulingStatus)}
              disabled={isLoading}
            >
              <option value="">Todos</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="COMPLETED">Concluído</option>
            </select>
          </div>

          {/* Vaccine filter */}
          <div>
            <label htmlFor="vaccine-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Vacina
            </label>
            <select
              id="vaccine-filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.vaccineId || ''}
              onChange={(e) => handleFilterChange('vaccineId', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Todas</option>
              {vaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.name}
                </option>
              ))}
            </select>
          </div>

          {/* User filter (only for managers) */}
          {showUserFilter && (
            <div>
              <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <select
                id="user-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Todos</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start date filter */}
          <div>
            <label htmlFor="start-date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Data inicial
            </label>
            <input
              type="date"
              id="start-date-filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              disabled={isLoading}
            />
          </div>

          {/* End date filter */}
          <div>
            <label htmlFor="end-date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Data final
            </label>
            <input
              type="date"
              id="end-date-filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
