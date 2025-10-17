import React, { useState, useEffect } from 'react';
import { Calendar, User, LogIn, UserPlus, Settings, LogOut, Globe } from 'lucide-react';
import CalendarView from './components/CalendarView';
import EventModal from './components/EventModal';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import AdminPanel from './components/AdminPanel';
import UserProfileModal from './components/UserProfileModal';
import { Event, UserProfile, EventRegistration } from './types';
import { supabase, signOut, getCurrentUser, getUserProfile } from './lib/supabase';
import { useTranslation } from './i18n/i18n';

function App() {
  const { t, language, changeLanguage } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    getCurrentUser().then(async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          // Combine profile with email from auth user
          setCurrentUser({ ...profile, email: user.email || profile.email });
          await loadUserRegistrations(user.id);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          // Combine profile with email from auth user
          setCurrentUser({ ...profile, email: session.user.email || profile.email });
          await loadUserRegistrations(session.user.id);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRegistrations([]);
      }
    });

    loadEvents();

    return () => subscription.unsubscribe();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadUserRegistrations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserRegistrations(data || []);
    } catch (error) {
      console.error('Error loading user registrations:', error);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleBooking = async (eventId: string, seatsRequested: number) => {
    if (!currentUser) return;

    try {
      // Insert registration
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          user_id: currentUser.id,
          event_id: eventId,
          seats_requested: seatsRequested
        });

      if (registrationError) throw registrationError;

      // Update event seats
      const event = events.find(e => e.id === eventId);
      if (event) {
        const newSeatsAvailable = event.seats_available - seatsRequested;
        const { error: updateError } = await supabase
          .from('events')
          .update({
            seats_available: Math.max(0, newSeatsAvailable),
            status: newSeatsAvailable <= 0 ? 'fully-booked' : event.status
          })
          .eq('id', eventId);

        if (updateError) throw updateError;
      }

      // Reload data
      await loadEvents();
      await loadUserRegistrations(currentUser.id);
      setShowEventModal(false);
      alert(`Successfully registered for ${seatsRequested} seat(s)!`);
    } catch (error: any) {
      console.error('Error booking event:', error);
      if (error.code === '23505') {
        alert('You are already registered for this event');
      } else {
        alert('Error booking event. Please try again.');
      }
    }
  };

  const handleEventUpdate = async (updatedEvent: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updatedEvent.title,
          description: updatedEvent.description,
          start_time: updatedEvent.start_time,
          end_time: updatedEvent.end_time,
          duration: updatedEvent.duration,
          difficulty: updatedEvent.difficulty,
          seats_available: updatedEvent.seats_available,
          total_seats: updatedEvent.total_seats,
          status: updatedEvent.status
        })
        .eq('id', updatedEvent.id);

      if (error) throw error;

      await loadEvents();
      setShowEventModal(false);
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 py-2 lg:flex lg:justify-between lg:items-center lg:h-16 lg:py-0">
            {/* Brand Icon - spans both rows on small screens */}
            <div className="row-span-2 flex items-center lg:row-span-1">
              <a 
                href="https://expedicionesangostura.github.io/EA.home/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <img 
                  src="/1logo-ea-bolt.png" 
                  alt="Expediciones Angostura Logo" 
                  className="h-11 w-11 object-contain"
                />
              </a>
            </div>
            
            {/* Top row content - Title and subtitle */}
            <div className="flex items-center lg:space-x-4">
              <div>
                <h1 className="text-3xl font-caveat font-semibold text-gray-900">{t('header.title')}</h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('header.subtitle')}</p>
              </div>
            </div>
            
            {/* Bottom row content - Language switcher and auth */}
            <div className="flex items-center justify-end space-x-4 mt-2 lg:mt-0">
              {/* Language Switcher */}
              <div className="flex items-center space-x-2 border-r border-gray-300 pr-4">
                <Globe className="h-4 w-4 text-gray-600" />
                <button
                  onClick={() => changeLanguage('es')}
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    language === 'es' 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('languages.spanish')}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    language === 'en' 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('languages.english')}
                </button>
              </div>

              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      {currentUser.full_name}
                    </button>
                  </div>
                  {currentUser.is_admin && (
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('header.adminPanel')}</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t('header.login')}</span>
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{t('header.register')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalendarView events={events} onEventClick={handleEventClick} />
      </main>

      {/* Modals */}
      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          currentUser={currentUser}
          userRegistrations={userRegistrations}
          onClose={() => setShowEventModal(false)}
          onBook={handleBooking}
          onUpdate={handleEventUpdate}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showAdminPanel && currentUser?.is_admin && (
        <AdminPanel
          events={events}
          onClose={() => setShowAdminPanel(false)}
          onEventsUpdate={loadEvents}
        />
      )}

      {showProfileModal && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default App;