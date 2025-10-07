import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut, Calendar, Shield, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { LoginModal } from './auth/LoginModal';
import { RegisterModal } from './auth/RegisterModal';
import { ProfileModal } from './user/ProfileModal';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const Header = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, isAdmin, isProvider } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Expediciones Angostura" className="h-12 w-12" />
              <h1 className="text-2xl lg:text-3xl font-bold brand-font text-primary">
                Expediciones Angostura
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={() => setShowLogin(true)}>
                    {t('common.login')}
                  </Button>
                  <Button onClick={() => setShowRegister(true)}>
                    {t('common.register')}
                  </Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setShowProfile(true)}>
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.myProfile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('nav.events')}
                    </DropdownMenuItem>
                    {isProvider && (
                      <DropdownMenuItem onClick={() => navigate('/provider')}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        {t('nav.provider')}
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        {t('nav.admin')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('common.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal 
        open={showLogin} 
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <RegisterModal 
        open={showRegister} 
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
      <ProfileModal 
        open={showProfile} 
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};
