/**
 * AlertCard Component - Displays inventory alerts with type-specific styling
 *
 * Renders different visual styles based on alert type:
 * - LOW_STOCK: Yellow/warning style with inventory icon
 * - EXPIRED_BATCH: Red/danger style with error icon
 * - NEARING_EXPIRATION_BATCH: Orange/warning style with clock icon
 */

import React from 'react';
import { AlertTriangle, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';
import type {
  Alert,
} from '../../types/alerts';
import {
  AlertType,
  isLowStockAlert,
  isExpiredBatchAlert,
  isNearingExpirationAlert,
} from '../../types/alerts';

/**
 * Props for AlertCard component
 */
export interface AlertCardProps {
  /** Alert data to display */
  alert: Alert;
  /** Optional className for styling */
  className?: string;
}

/**
 * Configuration for alert visual display
 */
interface AlertConfig {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeVariant: 'danger' | 'warning' | 'success' | 'info';
  badgeText: string;
  title: string;
  description: string;
}

/**
 * Get visual configuration based on alert type
 */
const getAlertConfig = (alert: Alert): AlertConfig => {
  const count = alert.objects.length;

  switch (alert.alertType) {
    case AlertType.LOW_STOCK:
      return {
        icon: <Package className="h-6 w-6" />,
        bgColor: 'bg-warning-50',
        borderColor: 'border-warning-500',
        textColor: 'text-warning-900',
        badgeVariant: 'warning',
        badgeText: 'Estoque Baixo',
        title: 'Alerta de Estoque Baixo',
        description: `${count} ${count === 1 ? 'vacina com' : 'vacinas com'} estoque abaixo do mínimo`,
      };

    case AlertType.EXPIRED_BATCH:
      return {
        icon: <AlertTriangle className="h-6 w-6" />,
        bgColor: 'bg-danger-50',
        borderColor: 'border-danger-500',
        textColor: 'text-danger-900',
        badgeVariant: 'danger',
        badgeText: 'Urgente',
        title: 'Lotes Vencidos',
        description: `${count} ${count === 1 ? 'lote vencido' : 'lotes vencidos'} - ação imediata necessária`,
      };

    case AlertType.NEARING_EXPIRATION_BATCH:
      return {
        icon: <Clock className="h-6 w-6" />,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-900',
        badgeVariant: 'warning',
        badgeText: 'Atenção',
        title: 'Lotes Próximos ao Vencimento',
        description: `${count} ${count === 1 ? 'lote vence' : 'lotes vencem'} nos próximos 30 dias`,
      };

    default:
      return {
        icon: <AlertTriangle className="h-6 w-6" />,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-500',
        textColor: 'text-gray-900',
        badgeVariant: 'info',
        badgeText: 'Info',
        title: 'Alerta',
        description: `${count} item(s)`,
      };
  }
};

/**
 * Render vaccine details for LOW_STOCK alerts
 */
const VaccineDetails: React.FC<{ vaccine: any }> = ({ vaccine }) => (
  <div className="py-2 px-3 bg-white rounded border border-warning-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium text-sm text-gray-900">{vaccine.name}</p>
        <p className="text-xs text-gray-600">{vaccine.manufacturer}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-warning-700">
          {vaccine.totalStock || vaccine.currentStock || 0} un.
        </p>
        <p className="text-xs text-gray-500">
          Mín: {vaccine.minStockLevel || 0}
        </p>
      </div>
    </div>
  </div>
);

/**
 * Render batch details for EXPIRED_BATCH and NEARING_EXPIRATION_BATCH alerts
 */
const BatchDetails: React.FC<{ batch: any; isExpired?: boolean }> = ({
  batch,
  isExpired = false,
}) => {
  const bgColor = isExpired ? 'bg-white' : 'bg-white';
  const borderColor = isExpired ? 'border-danger-200' : 'border-orange-200';

  return (
    <div className={`py-2 px-3 rounded border ${bgColor} ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900">
            Lote {batch.batchNumber}
          </p>
          <p className="text-xs text-gray-600">
            {batch.vaccine?.name || 'Vacina não identificada'}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${isExpired ? 'text-danger-700' : 'text-orange-700'}`}>
            {formatDate(batch.expirationDate)}
          </p>
          <p className="text-xs text-gray-500">
            {batch.currentQuantity || 0} doses
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * AlertCard Component
 *
 * Displays a single alert with type-specific styling and expandable details
 */
export const AlertCard: React.FC<AlertCardProps> = ({ alert, className = '' }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const config = getAlertConfig(alert);

  // Determine how many items to show initially
  const initialDisplayCount = 3;
  const hasMoreItems = alert.objects.length > initialDisplayCount;
  const displayedItems = isExpanded
    ? alert.objects
    : alert.objects.slice(0, initialDisplayCount);

  return (
    <Card className={`border-l-4 ${config.borderColor} ${className}`}>
      <CardHeader className={config.bgColor}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`${config.textColor} mt-1`}>
              {config.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{config.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {config.description}
              </p>
            </div>
          </div>
          <Badge variant={config.badgeVariant} size="sm">
            {config.badgeText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {isLowStockAlert(alert) &&
            displayedItems.map((vaccine, index) => (
              <VaccineDetails key={vaccine.id || index} vaccine={vaccine} />
            ))}

          {isExpiredBatchAlert(alert) &&
            displayedItems.map((batch, index) => (
              <BatchDetails
                key={batch.id || index}
                batch={batch}
                isExpired={true}
              />
            ))}

          {isNearingExpirationAlert(alert) &&
            displayedItems.map((batch, index) => (
              <BatchDetails
                key={batch.id || index}
                batch={batch}
                isExpired={false}
              />
            ))}

          {hasMoreItems && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Mostrar mais {alert.objects.length - initialDisplayCount} item(s)
                </>
              )}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
