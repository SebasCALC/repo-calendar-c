import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, UserRole } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const UserManagement = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>(() => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  });
  const [promotingUser, setPromotingUser] = useState<User | null>(null);
  const [demotingUser, setDemotingUser] = useState<User | null>(null);

  const handlePromote = () => {
    if (!promotingUser) return;

    const updatedUsers = users.map((u) =>
      u.id === promotingUser.id ? { ...u, role: UserRole.PROVIDER } : u
    );
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    toast.success(t('admin.statusUpdated'));
    setPromotingUser(null);
  };

  const handleDemote = () => {
    if (!demotingUser) return;

    const updatedUsers = users.map((u) =>
      u.id === demotingUser.id ? { ...u, role: UserRole.USER } : u
    );
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    toast.success(t('admin.statusUpdated'));
    setDemotingUser(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t('admin.users')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <Badge variant="outline">{t(`role.${user.role}`)}</Badge>

                <div className="flex gap-2">
                  {user.role === UserRole.USER && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPromotingUser(user)}
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {t('admin.promoteToProvider')}
                    </Button>
                  )}
                  {user.role === UserRole.PROVIDER && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDemotingUser(user)}
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      {t('admin.demoteToUser')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!promotingUser} onOpenChange={() => setPromotingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.promoteToProvider')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.confirmPromotion')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromote}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!demotingUser} onOpenChange={() => setDemotingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.demoteToUser')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.confirmDemotion')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDemote}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
