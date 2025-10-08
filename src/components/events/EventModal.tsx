import { Event, EventStatus } from '@/types/event';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, User as UserIcon } from 'lucide-react';
import { registerForEvent as dbRegisterForEvent, cancelRegistration as dbCancelRegistration, getUserRegistrations } from '@/lib/supabaseQueries';
import { UserRole } from '@/types/user';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface EventModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
}

export const EventModal = ({ event, open, onClose }: EventModalProps) => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      if (user) {
        try {
          const registrations = await getUserRegistrations(user.id);
          setIsRegistered(registrations.some(r => r.event_id === event.id));
        } catch (error) {
          console.error('Error checking registration:', error);
        }
      }
    };
    checkRegistration();
  }, [user, event.id]);

  const getStatusBadge = (status: EventStatus) => {
    const colors = {
      [EventStatus.PLANNED]: 'bg-status-planned text-white',
      [EventStatus.OPEN]: 'bg-status-open text-white',
      [EventStatus.CONFIRMED]: 'bg-status-confirmed text-white',
    };
    
    return (
      <Badge className={colors[status]}>
        {t(`eventStatus.${status}`)}
      </Badge>
    );
  };

  const handleRegister = async () => {
    if (!user) return;

    if (user.role !== UserRole.USER) {
      toast.error(t('event.onlyUsersCanRegister') || 'Only users with USER role can register for events');
      return;
    }

    if (event.status !== EventStatus.OPEN) {
      toast.error(t('event.notOpenYet') || 'This event is not open for registration');
      return;
    }

    if (event.availableSeats < 1) {
      toast.error(t('event.noSeatsAvailable') || 'No seats available');
      return;
    }

    setLoading(true);
    try {
      await dbRegisterForEvent(event.id, user.id, user.name, user.email, 1);
      toast.success(t('event.registrationSuccess'));
      setIsRegistered(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || t('event.registrationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await dbCancelRegistration(event.id, user.id);
      toast.success(t('event.cancellationSuccess'));
      setIsRegistered(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast.error(error.message || t('event.cancellationError'));
    } finally {
      setLoading(false);
    }
  };

  const canShowRegisterButton = () => {
    if (!isAuthenticated) return false;
    if (!user) return false;
    if (user.role !== UserRole.USER) return false;
    if (event.status === EventStatus.PLANNED) return false;
    if (event.availableSeats === 0) return false;
    return true;
  };

  const getActionMessage = () => {
    if (event.status === EventStatus.PLANNED) {
      return t('event.notOpenYet');
    }
    
    if (!isAuthenticated) {
      return t('event.loginToRegister');
    }

    if (user && user.role !== UserRole.USER) {
      return t('event.onlyUsersCanRegister');
    }

    return null;
  };

  const actionMessage = getActionMessage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.title[language]}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('event.details')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {getStatusBadge(event.status)}
          </div>

          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title[language]}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          <p className="text-muted-foreground">{event.description[language]}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('event.date')}</p>
                <p className="font-medium">
                  {new Date(event.date).toLocaleDateString()} - {event.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('event.location')}</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('event.availableSeats')}</p>
                <p className="font-medium">{event.availableSeats} / {event.maxSeats}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('event.provider')}</p>
                <p className="font-medium">{event.providerName}</p>
              </div>
            </div>
          </div>

          {actionMessage && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-center">{actionMessage}</p>
            </div>
          )}

          {isRegistered && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm font-medium">
                {t('event.registrationSuccess')} - 1 {t('event.availableSeats')}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {isRegistered ? (
              <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                {loading ? t('common.loading') : t('event.cancelRegistration')}
              </Button>
            ) : canShowRegisterButton() ? (
              <Button onClick={handleRegister} disabled={loading}>
                {loading ? t('common.loading') : t('event.reserveSeat')}
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};