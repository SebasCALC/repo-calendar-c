import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, Award } from 'lucide-react';
import { Event, EventStatus } from '../types';
import { useTranslation } from '../i18n/i18n';

interface CalendarViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    t('calendar.months.january'), t('calendar.months.february'), t('calendar.months.march'),
    t('calendar.months.april'), t('calendar.months.may'), t('calendar.months.june'),
    t('calendar.months.july'), t('calendar.months.august'), t('calendar.months.september'),
    t('calendar.months.october'), t('calendar.months.november'), t('calendar.months.december')
  ];

  const weekDays = [
    t('calendar.weekdays.sunday'), t('calendar.weekdays.monday'), t('calendar.weekdays.tuesday'),
    t('calendar.weekdays.wednesday'), t('calendar.weekdays.thursday'), t('calendar.weekdays.friday'),
    t('calendar.weekdays.saturday')
  ];

  const { calendarDays, monthEvents } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateIter = new Date(startDate);
    
    for (let i = 0; i < 35; i++) {
      days.push(new Date(currentDateIter));
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    return { calendarDays: days, monthEvents };
  }, [currentDate, events]);

  const getEventsForDay = (date: Date) => {
    return monthEvents.filter(event => {
      const eventDate = new Date(event.date);
      const currentDay = new Date(date);
      return eventDate.toDateString() === currentDay.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'planned': return 'border-gray-500 bg-gray-50';
      case 'open': return 'border-green-500 bg-green-50';
      case 'confirmed': return 'border-blue-500 bg-blue-50';
      case 'canceled': return 'border-red-500 bg-red-50';
      case 'successful': return 'border-purple-500 bg-purple-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDay(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded-lg transition-all hover:shadow-md ${
                  isCurrentMonth 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-100'
                } ${
                  isToday 
                    ? 'ring-2 ring-blue-500 ring-opacity-50' 
                    : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${
                  isToday ? 'text-blue-600' : ''
                }`}>
                  {isCurrentMonth ? date.getDate() : ''}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`w-full text-left p-1 rounded text-xs transition-all hover:shadow-sm hover:scale-105 border ${getStatusColor(event.status)}`}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="font-medium truncate">
                          {t('common.language') === 'es' ? event.title_es : event.title_en}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-gray-600">
                        <Clock className="h-3 w-3 hidden sm:inline" />
                        <span className="text-xs">{event.time}</span>
                        <Users className="h-3 w-3 hidden sm:inline" />
                        <span className="hidden sm:inline">{event.available_seats}</span>
                      </div>
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>{t('events.statuses.planned')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>{t('events.statuses.open')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>{t('events.statuses.confirmed')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;