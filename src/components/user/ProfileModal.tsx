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
import { getUserRegistrations, getEventById } from '@/lib/supabaseQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (user) {
        try {
          const data = await getUserRegistrations(user.id);
          setRegistrations(data);
        } catch (error) {
          console.error('Error fetching registrations:', error);
        }
      }
    };
    fetchRegistrations();
  }, [user]);

  if (!user) return null;

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
                  const event = reg.events;
                  if (!event) return null;
                  
                  return (
                    <Card key={reg.id}>
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">
                          {event.title_es} / {event.title_en}
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
                            {reg.seats_booked} {t('event.availableSeats')}
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