import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getEventsByProvider, addEvent, updateEvent, deleteEvent } from '@/lib/mockData';
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

export const MyEvents = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState(user ? getEventsByProvider(user.id) : []);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

  const handleAdd = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSubmit = (data: Partial<Event>) => {
    if (!user) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, data);
      toast.success(t('provider.eventUpdated'));
    } else {
      addEvent({
        ...data as any,
        providerId: user.id,
        providerName: user.name,
        status: EventStatus.PLANNED,
      });
      toast.success(t('provider.eventCreated'));
    }
    
    setEvents(getEventsByProvider(user.id));
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDelete = () => {
    if (!deletingEvent || !user) return;
    
    deleteEvent(deletingEvent.id);
    toast.success(t('admin.statusUpdated'));
    setEvents(getEventsByProvider(user.id));
    setDeletingEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('provider.myEvents')}</h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t('provider.createEvent')}
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
                    <h3 className="font-semibold text-lg">{event.title[language]}</h3>
                    <Badge>{t(`eventStatus.${event.status}`)}</Badge>
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
              {editingEvent ? t('admin.editEvent') : t('provider.createEvent')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingEvent ? t('admin.editEvent') : t('provider.createEvent')}
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
    </div>
  );
};
