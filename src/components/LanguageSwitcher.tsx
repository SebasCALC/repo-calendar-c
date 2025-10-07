import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="font-semibold"
    >
      {language === 'es' ? 'EN' : 'ES'}
    </Button>
  );
};
