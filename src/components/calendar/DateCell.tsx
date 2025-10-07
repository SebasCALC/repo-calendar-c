import { Event, EventStatus } from '@/types/event';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { EventModal } from '../events/EventModal';

interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
}

export const DateCell = ({ date, isCurrentMonth, events }: DateCellProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const dateStr = date.toISOString().split('T')[0];
  const dayEvents = events.filter((e) => e.date === dateStr);

  const handleClick = () => {
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
    } else if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PLANNED:
        return 'bg-status-planned';
      case EventStatus.OPEN:
        return 'bg-status-open';
      case EventStatus.CONFIRMED:
        return 'bg-status-confirmed';
      default:
        return 'bg-primary';
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          'min-h-24 p-2 border rounded-lg cursor-pointer transition-colors hover:bg-accent',
          isCurrentMonth ? 'bg-background' : 'bg-muted/30',
          isToday && 'border-primary border-2'
        )}
      >
        <div className="flex justify-between items-start mb-1">
          <span
            className={cn(
              'text-sm font-medium',
              !isCurrentMonth && 'text-muted-foreground',
              isToday && 'font-bold text-primary'
            )}
          >
            {date.getDate()}
          </span>
        </div>
        
        {dayEvents.length > 0 && (
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={cn(
                  'text-xs p-1 rounded truncate text-white',
                  getStatusColor(event.status)
                )}
              >
                {event.title.es}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayEvents.length - 2} más
              </div>
            )}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
};
