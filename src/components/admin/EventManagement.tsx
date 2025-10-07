import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getEvents, addEvent, updateEvent, deleteEvent } from '@/lib/mockData';
import { Event, EventStatus } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EventForm } from '@/components/events/EventForm';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const EventManagement = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState(getEvents());
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [changingStatusEvent, setChangingStatusEvent] = useState<Event | null>(null);

  const handleAdd = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSubmit = (data: Partial<Event>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
      toast.success(t('provider.eventUpdated'));
    } else {
      if (!user) return;
      addEvent({
        ...data as any,
        providerId: user.id,
        providerName: user.name,
        status: EventStatus.PLANNED,
      });
      toast.success(t('provider.eventCreated'));
    }
    
    setEvents(getEvents());
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDelete = () => {
    if (!deletingEvent) return;
    
    deleteEvent(deletingEvent.id);
    toast.success(t('admin.statusUpdated'));
    setEvents(getEvents());
    setDeletingEvent(null);
  };

  const handleStatusChange = (newStatus: EventStatus) => {
    if (!changingStatusEvent) return;

    updateEvent(changingStatusEvent.id, { status: newStatus });
    toast.success(t('admin.statusUpdated'));
    setEvents(getEvents());
    setChangingStatusEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('admin.events')}</h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.addEvent')}
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {t('provider.noEvents')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title[language]}</h3>
                      <p className="text-sm text-muted-foreground">{event.providerName}</p>
                    </div>
                    <Badge
                      className="cursor-pointer"
                      onClick={() => setChangingStatusEvent(event)}
                    >
                      {t(`eventStatus.${event.status}`)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description[language]}
                  </p>
                  
                  <div className="text-sm">
                    <p>{new Date(event.date).toLocaleDateString()} - {event.time}</p>
                    <p>{event.location}</p>
                    <p>{event.availableSeats} / {event.maxSeats} {t('event.availableSeats')}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4 mr-1" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingEvent(event)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? t('admin.editEvent') : t('admin.addEvent')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingEvent ? t('admin.editEvent') : t('admin.addEvent')}
            </DialogDescription>
          </DialogHeader>
          <EventForm
            event={editingEvent || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingEvent(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingEvent} onOpenChange={() => setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteEvent')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!changingStatusEvent} onOpenChange={() => setChangingStatusEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.changeStatus')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('admin.changeStatus')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={changingStatusEvent?.status}
              onValueChange={(value) => handleStatusChange(value as EventStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventStatus.PLANNED}>
                  {t('eventStatus.PLANNED')}
                </SelectItem>
                <SelectItem value={EventStatus.OPEN}>
                  {t('eventStatus.OPEN')}
                </SelectItem>
                <SelectItem value={EventStatus.CONFIRMED}>
                  {t('eventStatus.CONFIRMED')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
