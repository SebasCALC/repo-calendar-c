import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MyEvents } from '@/components/provider/MyEvents';

const ProviderDashboard = () => {
  const { isProvider } = useAuth();
  const { t } = useLanguage();

  if (!isProvider) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('provider.title')}</h1>
        <MyEvents />
      </div>
    </div>
  );
};

export default ProviderDashboard;
