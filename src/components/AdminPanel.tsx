import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Plus, CreditCard as Edit3, Eye } from 'lucide-react';
import { Event, UserProfile, EventRegistration, EventStatus } from '../types';
import { supabase } from '../lib/supabase';
import AddEventModal from './AddEventModal';
import EventRegistrationsModal from './EventRegistrationsModal';
import { useTranslation } from '../i18n/i18n';

interface AdminPanelProps {
  events: Event[];
  currentUser: UserProfile;
  onClose: () => void;
  onEventsUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  events, 
  currentUser,
  onClose, 
  onEventsUpdate 
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'date' | 'month' | 'year'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadUsersAndRegistrations();
  }, []);

  const loadUsersAndRegistrations = async () => {
    try {
      const [usersResponse, registrationsResponse] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('event_registrations').select('*')
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (registrationsResponse.error) throw registrationsResponse.error;

      setUsers(usersResponse.data || []);
      setRegistrations(registrationsResponse.data || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: 'available' | 'fully-booked' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;
      onEventsUpdate();
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Error updating event status');
    }
  };

  const handleViewRegistrations = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
  };

  const filterEvents = (events: Event[]) => {
    if (filterType === 'all') {
      return events;
    }

    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      
      switch (filterType) {
        case 'date':
          if (!selectedDate) return true;
          const filterDate = new Date(selectedDate);
          return eventDate.toDateString() === filterDate.toDateString();
        
        case 'month':
          return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
        
        case 'year':
          return eventDate.getFullYear() === selectedYear;
        
        default:
          return true;
      }
    });
  };

  const resetFilters = () => {
    setFilterType('all');
    setSelectedDate('');
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  };

  const getEventRegistrations = (eventId: string) => {
    return registrations.filter(reg => reg.event_id === eventId);
  };

  const getUserRegistrations = (userId: string) => {
    return registrations.filter(reg => reg.user_id === userId);
  };

  const filteredEvents = filterEvents(events);
  const totalEvents = events.length;
  const filteredAvailableEvents = filteredEvents.filter(e => e.status === 'open' || e.status === 'confirmed').length;
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalRegistrations = registrations.length;

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Month names for dropdown
  const monthNames = [
    t('calendar.months.january'), t('calendar.months.february'), t('calendar.months.march'),
    t('calendar.months.april'), t('calendar.months.may'), t('calendar.months.june'),
    t('calendar.months.july'), t('calendar.months.august'), t('calendar.months.september'),
    t('calendar.months.october'), t('calendar.months.november'), t('calendar.months.december')
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
          <h2 className="text-xl font-semibold">
            {currentUser.role === 'admin' ? t('admin.adminPanel') : 'Provider Panel'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalEvents}</p>
                <p className="text-sm">{t('admin.totalEvents')}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{filteredAvailableEvents}</p>
                <p className="text-sm">{t('admin.availableFiltered')}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-800 p-3 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm">{t('admin.registeredUsers')}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalRegistrations}</p>
                <p className="text-sm">{t('admin.totalBookings')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === 'events'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {t('admin.eventManagement')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {t('admin.usersRegistrations')}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'events' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{t('admin.eventManagement')}</h3>
                <button 
                  onClick={() => setShowAddEventModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('admin.addEvent')}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                {/* Filter Controls */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.filterBy')}</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="all">{t('admin.allEvents')}</option>
                        <option value="date">{t('admin.specificDate')}</option>
                        <option value="month">{t('admin.monthYear')}</option>
                        <option value="year">{t('admin.year')}</option>
                      </select>
                    </div>

                    {filterType === 'date' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.selectDate')}</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    )}

                    {(filterType === 'month' || filterType === 'year') && (
                      <>
                        {filterType === 'month' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.month')}</label>
                            <select
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              {monthNames.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.year')}</label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            {yearOptions.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {filterType !== 'all' && (
                      <div className="flex items-end">
                        <button
                          onClick={resetFilters}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          {t('admin.clearFilters')}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {filterType !== 'all' && (
                    <div className="mt-3 text-sm text-gray-600">
                      {t('admin.showing')} {filteredEvents.length} {t('admin.of')} {events.length} {t('admin.events')}
                    </div>
                  )}
                </div>

                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Event</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Seats</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Registrations</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          {filterType === 'all' ? t('admin.noEvents') : t('admin.noEventsFilter')}
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map(event => {
                      const eventRegistrations = getEventRegistrations(event.id);
                      const totalSeatsBooked = eventRegistrations.reduce((sum, reg) => sum + reg.seats_requested, 0);
                      
                      return (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="font-medium">
                                {t('common.language') === 'es' ? event.title_es : event.title_en}
                              </p>
                              <p className="text-sm text-gray-600">{event.location}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="text-sm">{new Date(event.date).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-600">{event.time}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <p>{event.available_seats} / {event.max_seats}</p>
                            <p className="text-xs text-gray-600">Booked: {totalSeatsBooked}</p>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              event.status === 'open' || event.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'planned'
                                ? 'bg-gray-100 text-gray-800'
                                : event.status === 'canceled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {t(`events.statuses.${event.status}`)}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {eventRegistrations.length} users
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {(currentUser.role === 'admin' || event.provider_id === currentUser.id) && (
                              <div className="flex space-x-1">
                                <select
                                  value={event.status}
                                  onChange={(e) => handleStatusChange(event.id, e.target.value as EventStatus)}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                                  disabled={currentUser.role === 'provider' && event.provider_id !== currentUser.id}
                                >
                                  <option value="planned">Planned</option>
                                  {currentUser.role === 'admin' && (
                                    <>
                                      <option value="open">Open</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="canceled">Canceled</option>
                                      <option value="successful">Successful</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <button
                              onClick={() => handleViewRegistrations(event)}
                              className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View Users</span>
                            </button>
                          </td>
                        </tr>
                      );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-6">User Registrations</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">User</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Contact</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Registrations</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Total Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user => user.role === 'user').map(user => {
                      const userRegs = getUserRegistrations(user.id);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">-</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="space-y-1">
                              {userRegs.map((reg, index) => {
                                const event = events.find(e => e.id === reg.event_id);
                                return (
                                  <div key={index} className="text-xs">
                                    <p className="font-medium">
                                      {event ? (t('common.language') === 'es' ? event.title_es : event.title_en) : 'Unknown Event'}
                                    </p>
                                    <p className="text-gray-600">{reg.seats_booked} seats</p>
                                  </div>
                                );
                              })}
                              {userRegs.length === 0 && (
                                <p className="text-xs text-gray-500">No registrations</p>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {userRegs.reduce((sum, reg) => sum + reg.seats_booked, 0)} seats
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <AddEventModal
          currentUser={currentUser}
          onClose={() => setShowAddEventModal(false)}
          onEventAdded={onEventsUpdate}
        />
      )}

      {/* Event Registrations Modal */}
      {showRegistrationsModal && selectedEvent && (
        <EventRegistrationsModal
          event={selectedEvent}
          registrations={registrations}
          users={users}
          onClose={() => {
            setShowRegistrationsModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;