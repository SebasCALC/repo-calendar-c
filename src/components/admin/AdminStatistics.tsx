import { useLanguage } from '@/contexts/LanguageContext';
import { getEvents } from '@/lib/supabaseQueries';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export const AdminStatistics = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get events
        const events = await getEvents();
        
        // Get users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get registrations count
        const { count: registrationsCount } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true });

        // Get upcoming events
        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = events.filter(e => e.date >= today);

        setStats({
          totalEvents: events.length,
          totalUsers: usersCount || 0,
          totalRegistrations: registrationsCount || 0,
          upcomingEvents: upcomingEvents.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.totalEvents')}
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.totalUsers')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.totalRegistrations')}
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('admin.upcomingEvents')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
        </CardContent>
      </Card>
    </div>
  );
};