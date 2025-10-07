import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminStatistics } from '@/components/admin/AdminStatistics';
import { EventManagement } from '@/components/admin/EventManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { Header } from '@/components/Header';

const Admin = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('admin.title')}</h1>

        <Tabs defaultValue="statistics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="statistics">{t('admin.statistics')}</TabsTrigger>
            <TabsTrigger value="events">{t('admin.events')}</TabsTrigger>
            <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="mt-6">
            <AdminStatistics />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
