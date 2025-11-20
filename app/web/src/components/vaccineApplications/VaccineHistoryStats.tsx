import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import type { VaccinationHistorySummary } from '../../types';

interface VaccineHistoryStatsProps {
  summary: VaccinationHistorySummary;
}

/**
 * Display vaccination history statistics and compliance metrics
 */
export const VaccineHistoryStats: React.FC<VaccineHistoryStatsProps> = ({ summary }) => {
  const stats = [
    {
      label: 'Vacinas Aplicadas',
      value: summary.totalVaccinesApplied,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Vacinas Completas',
      value: summary.totalVaccinesCompleted,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: 'Doses Pendentes',
      value: summary.totalDosesPending,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      label: 'Obrigatórias Pendentes',
      value: summary.totalMandatoryPending,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Statistics Cards */}
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Compliance Percentage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conformidade</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.compliancePercentage}%
              </p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="transform -rotate-90 h-16 w-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - summary.compliancePercentage / 100)}`}
                  className={
                    summary.compliancePercentage >= 80
                      ? 'text-success-600'
                      : summary.compliancePercentage >= 50
                      ? 'text-warning-600'
                      : 'text-danger-600'
                  }
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
