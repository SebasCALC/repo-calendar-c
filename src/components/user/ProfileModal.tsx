import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getUserRegistrations } from '@/lib/registrations';
import { getEventById } from '@/lib/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users } from 'lucide-react';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  if (!user) return null;

  const registrations = getUserRegistrations(user.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('profile.title')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('auth.name')}</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('auth.email')}</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('form.status')}</p>
            <Badge variant="outline">{t(`role.${user.role}`)}</Badge>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t('profile.myRegistrations')}</h3>
            {registrations.length === 0 ? (
              <p className="text-muted-foreground">{t('profile.noRegistrations')}</p>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => {
                  const event = getEventById(reg.eventId);
                  if (!event) return null;
                  
                  return (
                    <Card key={reg.id}>
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">
                          {event.title[language]}
                        </h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()} - {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {reg.seatsBooked} {t('event.availableSeats')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
