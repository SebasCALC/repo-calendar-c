import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventStatus } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Partial<Event>) => void;
  onCancel: () => void;
}

export const EventForm = ({ event, onSubmit, onCancel }: EventFormProps) => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const [titleEs, setTitleEs] = useState(event?.title.es || '');
  const [titleEn, setTitleEn] = useState(event?.title.en || '');
  const [descriptionEs, setDescriptionEs] = useState(event?.description.es || '');
  const [descriptionEn, setDescriptionEn] = useState(event?.description.en || '');
  const [date, setDate] = useState(event?.date || '');
  const [time, setTime] = useState(event?.time || '');
  const [location, setLocation] = useState(event?.location || '');
  const [maxSeats, setMaxSeats] = useState(event?.maxSeats.toString() || '');
  const [status, setStatus] = useState(event?.status || EventStatus.PLANNED);
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Event> = {
      title: { es: titleEs, en: titleEn },
      description: { es: descriptionEs, en: descriptionEn },
      date,
      time,
      location,
      maxSeats: parseInt(maxSeats),
      status,
      imageUrl: imageUrl || undefined,
    };

    if (event) {
      data.availableSeats = event.availableSeats;
    } else {
      data.availableSeats = parseInt(maxSeats);
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="titleEs">{t('form.titleEs')}</Label>
          <Input
            id="titleEs"
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleEn">{t('form.titleEn')}</Label>
          <Input
            id="titleEn"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionEs">{t('form.descriptionEs')}</Label>
        <Textarea
          id="descriptionEs"
          value={descriptionEs}
          onChange={(e) => setDescriptionEs(e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionEn">{t('form.descriptionEn')}</Label>
        <Textarea
          id="descriptionEn"
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{t('form.date')}</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">{t('form.time')}</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">{t('form.location')}</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxSeats">{t('form.maxSeats')}</Label>
          <Input
            id="maxSeats"
            type="number"
            min="1"
            value={maxSeats}
            onChange={(e) => setMaxSeats(e.target.value)}
            required
          />
        </div>

        {isAdmin && (
          <div className="space-y-2">
            <Label htmlFor="status">{t('form.status')}</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as EventStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventStatus.PLANNED}>{t('eventStatus.PLANNED')}</SelectItem>
                <SelectItem value={EventStatus.OPEN}>{t('eventStatus.OPEN')}</SelectItem>
                <SelectItem value={EventStatus.CONFIRMED}>{t('eventStatus.CONFIRMED')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">{t('form.imageUrl')}</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  );
};
