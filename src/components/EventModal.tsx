import React, { useState } from 'react';
import { X, Clock, Users, Award, Calendar, CreditCard as Edit3, MapPin } from 'lucide-react';
import { Event, UserProfile, EventRegistration, EventStatus } from '../types';
import { useTranslation } from '../i18n/i18n';

interface EventModalProps {
  event: Event;
  currentUser: UserProfile | null;
  userRegistrations: EventRegistration[];
  onClose: () => void;
  onBook: (eventId: string, seatsRequested: number) => void;
  onUpdate: (event: Event) => void;
}

const EventModal: React.FC<EventModalProps> = ({ 
  event, 
  currentUser, 
  userRegistrations,
  onClose, 
  onBook, 
  onUpdate 
}) => {
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const { t } = useTranslation();

  const isUserRegistered = userRegistrations.some(reg => reg.event_id === event.id);

  const canRegister = currentUser && 
    (event.status === 'open' || event.status === 'confirmed') && 
    event.available_seats > 0 && 
    !isUserRegistered;

  const canEdit = currentUser && 
    (currentUser.role === 'admin' || 
     (currentUser.role === 'provider' && event.provider_id === currentUser.id));

  const handleBooking = () => {
    if (seatsRequested > event.available_seats) {
      alert('Not enough seats available');
      return;
    }

    if (seatsRequested < 1 || seatsRequested > 4) {
      alert('You can book between 1 and 4 seats');
      return;
    }

    onBook(event.id, seatsRequested);
  };

  const handleStatusChange = (newStatus: EventStatus) => {
    onUpdate({
      ...event,
      status: newStatus
    });
  };

  const handleEventUpdate = () => {
    const updatedEvent = {
      ...editedEvent,
      updated_at: new Date().toISOString()
    };
    onUpdate(updatedEvent);
    setIsEditing(false);
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'successful': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
          <h2 className="text-xl font-semibold">{t('common.language') === 'es' ? event.title_es : event.title_en}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('eventModal.title')}</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                    <input
                      type="text"
                      value={editedEvent.title_es}
                      onChange={(e) => setEditedEvent({ ...editedEvent, title_es: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">English</label>
                    <input
                      type="text"
                      value={editedEvent.title_en}
                      onChange={(e) => setEditedEvent({ ...editedEvent, title_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('events.description')}</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                    <textarea
                      value={editedEvent.description_es}
                      onChange={(e) => setEditedEvent({ ...editedEvent, description_es: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">English</label>
                    <textarea
                      value={editedEvent.description_en}
                      onChange={(e) => setEditedEvent({ ...editedEvent, description_en: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('events.date')}</label>
                  <input
                    type="date"
                    value={editedEvent.date}
                    onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('events.time')}</label>
                  <input
                    type="time"
                    value={editedEvent.time}
                    onChange={(e) => setEditedEvent({ ...editedEvent, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('events.location')}</label>
                  <input
                    type="text"
                    value={editedEvent.location}
                    onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('events.maxSeats')}</label>
                  <input
                    type="number"
                    value={editedEvent.max_seats}
                    onChange={(e) => setEditedEvent({ ...editedEvent, max_seats: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('events.availableSeats')}</label>
                  <input
                    type="number"
                    value={editedEvent.available_seats}
                    onChange={(e) => setEditedEvent({ ...editedEvent, available_seats: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleEventUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('eventModal.saveChanges')}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Event Details */}
              <div>
                <p className="text-gray-600 leading-relaxed">
                  {t('common.language') === 'es' ? event.description_es : event.description_en}
                </p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t('events.date')}</p>
                      <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t('events.time')}</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t('events.location')}</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">{t('events.seatsAvailable')}</p>
                      <p className="font-medium">{event.available_seats} / {event.max_seats}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{t('events.status')}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(event.status)}`}>
                  {t(`events.statuses.${event.status}`)}
                </span>
              </div>

              {/* Registration Status */}
              {isUserRegistered && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">✓ {t('events.alreadyRegistered')}</p>
                </div>
              )}

              {/* Registration Section */}
              {canRegister && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">{t('events.registerForEvent')}</h3>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm text-blue-700 mb-1">{t('events.seatsRequested')}:</label>
                      <select
                        value={seatsRequested}
                        onChange={(e) => setSeatsRequested(parseInt(e.target.value))}
                        className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {[1, 2, 3, 4].filter(n => n <= event.available_seats).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleBooking}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t('events.registerNow')}
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Controls */}
              {canEdit && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">{t('eventModal.adminControls')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>{t('eventModal.editEvent')}</span>
                    </button>
                    
                    {currentUser?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleStatusChange('open')}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Open
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange('confirmed')}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Mark Confirmed
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange('canceled')}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Event
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange('successful')}
                          className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Mark Successful
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!currentUser && (event.status === 'open' || event.status === 'confirmed') && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">{t('events.loginToRegister')}</p>
                </div>
              )}

              {currentUser && (event.status === 'planned') && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">This event is still being planned. Registration will open soon.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;