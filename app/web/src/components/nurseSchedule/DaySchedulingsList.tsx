import React from 'react';
import { X, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { SchedulingCard } from './SchedulingCard';
import type { MonthlySchedulingItem } from '../../services/vaccineScheduling.service';

interface DaySchedulingsListProps {
  date: Date | null;
  schedulings: MonthlySchedulingItem[];
  onClose: () => void;
  onApplyVaccine?: (schedulingId: string) => void;
  onCancelScheduling?: (schedulingId: string) => void;
  onReassignNurse?: (schedulingId: string) => void;
}

/**
 * DaySchedulingsList - Displays list of schedulings for a selected day
 */
export const DaySchedulingsList: React.FC<DaySchedulingsListProps> = ({
  date,
  schedulings,
  onClose,
  onApplyVaccine,
  onCancelScheduling,
  onReassignNurse,
}) => {
  if (!date) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const sortedSchedulings = [...schedulings].sort(
    (a, b) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  return (
    <Card className="border-primary-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <div>
              <CardTitle className="capitalize">{formatDate(date)}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {schedulings.length} agendamento{schedulings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {sortedSchedulings.length > 0 ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {sortedSchedulings.map((scheduling) => (
              <SchedulingCard
                key={scheduling.id}
                scheduling={scheduling}
                onApplyVaccine={onApplyVaccine}
                onCancelScheduling={onCancelScheduling}
                onReassignNurse={onReassignNurse}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum agendamento para este dia</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
