import React from 'react';
import { Card, CardContent } from '../ui/Card';
import type { MonthlySchedulingsResponse } from '../../services/vaccineScheduling.service';

interface MonthlyCalendarProps {
  year: number;
  month: number;
  schedulings: MonthlySchedulingsResponse;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

/**
 * MonthlyCalendar - Calendar grid component showing monthly schedulings
 */
export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  year,
  month,
  schedulings,
  selectedDate,
  onDateClick,
}) => {
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Create array of day cells (including empty cells for alignment)
  const dayCells = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(null);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    dayCells.push(day);
  }

  const getSchedulingsForDate = (day: number) => {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedulings[dateKey] || [];
  };

  const getDateStats = (day: number) => {
    const daySchedulings = getSchedulingsForDate(day);

    const stats = {
      total: daySchedulings.length,
      scheduled: daySchedulings.filter((s) => s.status === 'SCHEDULED').length,
      completed: daySchedulings.filter((s) => s.status === 'COMPLETED').length,
      cancelled: daySchedulings.filter((s) => s.status === 'CANCELLED').length,
    };

    return stats;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() + 1 === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() + 1 === month &&
      selectedDate.getFullYear() === year
    );
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month - 1, day);
    onDateClick(date);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {dayCells.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const stats = getDateStats(day);
            const hasSchedulings = stats.total > 0;
            const today = isToday(day);
            const selected = isSelected(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square p-2 rounded-lg border-2 transition-all
                  hover:border-primary-300 hover:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  ${today ? 'bg-primary-50 border-primary-300' : 'border-gray-200'}
                  ${selected ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                  ${!hasSchedulings ? 'opacity-50' : ''}
                `}
              >
                <div className="h-full flex flex-col">
                  {/* Day number */}
                  <div
                    className={`
                      text-sm font-semibold mb-1
                      ${today ? 'text-primary-700' : 'text-gray-700'}
                    `}
                  >
                    {day}
                  </div>

                  {/* Scheduling indicators */}
                  {hasSchedulings && (
                    <div className="flex-1 flex flex-col gap-1">
                      {/* Total count badge */}
                      <div className="bg-gray-100 text-gray-700 text-xs rounded px-1 py-0.5 text-center font-medium">
                        {stats.total}
                      </div>

                      {/* Status indicators - small colored dots */}
                      <div className="flex gap-1 justify-center">
                        {stats.scheduled > 0 && (
                          <div
                            className="w-2 h-2 rounded-full bg-blue-500"
                            title={`${stats.scheduled} agendado(s)`}
                          />
                        )}
                        {stats.completed > 0 && (
                          <div
                            className="w-2 h-2 rounded-full bg-green-500"
                            title={`${stats.completed} concluído(s)`}
                          />
                        )}
                        {stats.cancelled > 0 && (
                          <div
                            className="w-2 h-2 rounded-full bg-red-500"
                            title={`${stats.cancelled} cancelado(s)`}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Legenda:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Agendado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Concluído</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Cancelado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
