/**
 * VaccinationCoverage Component
 *
 * Comprehensive vaccination coverage dashboard for managers.
 * Displays:
 * - Summary cards (average coverage, targets reached, critical vaccines)
 * - Horizontal bar chart with coverage by vaccine
 * - Critical vaccines list
 * - Completion rate donut chart
 */

import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import type React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  VaccinationCoverageResponse,
  VaccineCoverageDetail,
} from '../../types/vaccinationCoverage';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

/**
 * Props for VaccinationCoverage component
 */
interface VaccinationCoverageProps {
  /** Coverage data from API */
  data: VaccinationCoverageResponse;
  /** Callback for refresh action */
  onRefresh?: () => void;
  /** Loading state during refresh */
  isRefreshing?: boolean;
}

/**
 * Get color based on vaccine coverage status
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'critical':
      return '#EF4444'; // red-500
    case 'below_target':
      return '#F59E0B'; // amber-500
    case 'at_target':
      return '#10B981'; // green-500
    case 'above_target':
      return '#059669'; // green-600
    default:
      return '#6B7280'; // gray-500
  }
};

/**
 * Custom tooltip for bar chart
 */
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as VaccineCoverageDetail;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.vaccineName}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-700">
            Cobertura: <span className="font-medium">{data.coveragePercentage}%</span>
          </p>
          <p className="text-gray-700">
            Doses completas:{' '}
            <span className="font-medium">
              {data.completeDoses} / {data.shoudHaveDoses}
            </span>
          </p>
          {data.partialDoses !== undefined && data.partialDoses > 0 && (
            <p className="text-gray-700">
              Doses parciais: <span className="font-medium">{data.partialDoses}</span>
            </p>
          )}
          <p className="text-gray-700">
            Tipo:{' '}
            <span className="font-medium">
              {data.isObligatory ? 'Obrigatória' : 'Opcional'}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Custom tooltip for pie chart
 */
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-700">
          {data.value} usuários ({data.payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

/**
 * VaccinationCoverage Component
 */
export const VaccinationCoverage: React.FC<VaccinationCoverageProps> = ({
  data,
  onRefresh,
  isRefreshing = false,
}) => {
  const { summary, details, criticalVaccines, completion } = data;

  // Prepare data for completion pie chart
  const completionData = [
    {
      name: 'Totalmente vacinados',
      value: completion.fullyVaccinatedUsers,
      color: '#10B981',
      percentage: Math.round(
        (completion.fullyVaccinatedUsers /
          (completion.fullyVaccinatedUsers +
            completion.partiallyVaccinatedUsers +
            completion.notStartedUsers)) *
          100
      ),
    },
    {
      name: 'Parcialmente vacinados',
      value: completion.partiallyVaccinatedUsers,
      color: '#F59E0B',
      percentage: Math.round(
        (completion.partiallyVaccinatedUsers /
          (completion.fullyVaccinatedUsers +
            completion.partiallyVaccinatedUsers +
            completion.notStartedUsers)) *
          100
      ),
    },
    {
      name: 'Não iniciados',
      value: completion.notStartedUsers,
      color: '#EF4444',
      percentage: Math.round(
        (completion.notStartedUsers /
          (completion.fullyVaccinatedUsers +
            completion.partiallyVaccinatedUsers +
            completion.notStartedUsers)) *
          100
      ),
    },
  ];

  // Sort details by coverage percentage (lowest first for better visibility)
  const sortedDetails = [...details].sort(
    (a, b) => a.coveragePercentage - b.coveragePercentage
  );

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cobertura Vacinal</h2>
          <p className="text-sm text-gray-600 mt-1">
            Análise detalhada da cobertura vacinal da organização
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Atualizar dados"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Coverage */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cobertura Média</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.averageCoverage}%
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Targets Reached */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Metas Atingidas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.targetReached} / {details.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Vaccines */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vacinas Críticas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.criticalVaccines}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Value */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meta Padrão</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.defaultTargetValue}%
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cobertura por Vacina</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedDetails.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={sortedDetails}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 120, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="vaccineName"
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <ReferenceLine
                    x={summary.defaultTargetValue}
                    stroke="#6B7280"
                    strokeDasharray="3 3"
                    label={{
                      value: `Meta: ${summary.defaultTargetValue}%`,
                      position: 'top',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="coveragePercentage" radius={[0, 8, 8, 0]}>
                    {sortedDetails.map((entry) => (
                      <Cell key={entry.vaccineName} fill={getStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Nenhuma vacina cadastrada</p>
              </div>
            )}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#EF4444]" />
                <span>Crítico (&lt; 50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
                <span>Abaixo da meta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#10B981]" />
                <span>Na meta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#059669]" />
                <span>Acima da meta</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Completion Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso dos Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {completionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="text-center -mt-48 mb-32 pointer-events-none">
              <p className="text-3xl font-bold text-gray-900">
                {completion.completionRate}%
              </p>
              <p className="text-sm text-gray-600">Concluído</p>
            </div>
            {/* Legend */}
            <div className="space-y-2">
              {completionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Vaccines List */}
      {criticalVaccines.length > 0 && (
        <Card className="border-danger-200 bg-danger-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
              <CardTitle className="text-danger-900">
                Vacinas que Precisam de Atenção
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalVaccines.map((vaccine) => (
                <div
                  key={vaccine.vaccineName}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-danger-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-danger-600" />
                    <div>
                      <p className="font-medium text-gray-900">{vaccine.vaccineName}</p>
                      <p className="text-sm text-gray-600">
                        Cobertura atual: {vaccine.coveragePercentage}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-danger-700">
                      -{vaccine.gapToTarget}%
                    </p>
                    <p className="text-xs text-gray-600">para atingir meta</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Critical Vaccines State */}
      {criticalVaccines.length === 0 && (
        <Card className="border-success-200 bg-success-50">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-success-700">
              <CheckCircle2 className="h-12 w-12 mb-3" />
              <p className="font-medium text-lg">Nenhuma vacina crítica</p>
              <p className="text-sm text-success-600 mt-1">
                Todas as vacinas estão com cobertura adequada
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
