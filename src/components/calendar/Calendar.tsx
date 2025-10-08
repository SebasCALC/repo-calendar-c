import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateCell } from './DateCell';
import { getEvents } from '@/lib/supabaseQueries';
import { Event } from '@/types/event';
import { toast } from 'sonner';

export const Calendar = () => {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error(t('calendar.errorLoading') || 'Error loading events');
      }
    };
    fetchEvents();
  }, []);

  const monthNames = language === 'es' 
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = language === 'es'
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendarDays = () => {
    const days = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push(
        <DateCell
          key={`prev-${day}`}
          date={date}
          isCurrentMonth={false}
          events={events}
        />
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(
        <DateCell
          key={`current-${day}`}
          date={date}
          isCurrentMonth={true}
          events={events}
        />
      );
    }

    // Next month days to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push(
        <DateCell
          key={`next-${day}`}
          date={date}
          isCurrentMonth={false}
          events={events}
        />
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              {t('calendar.today')}
            </Button>
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};