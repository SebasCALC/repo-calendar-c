import { Header } from '@/components/Header';
import { Calendar } from '@/components/calendar/Calendar';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('calendar.title')}</h1>
        <Calendar />
      </div>
    </div>
  );
};

export default Index;
