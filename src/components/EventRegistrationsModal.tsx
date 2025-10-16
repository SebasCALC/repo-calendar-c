import React from 'react';
import { X, Users, Mail, Phone, User } from 'lucide-react';
import { Event, UserProfile, EventRegistration } from '../types';

interface EventRegistrationsModalProps {
  event: Event;
  registrations: EventRegistration[];
  users: UserProfile[];
  onClose: () => void;
}

const EventRegistrationsModal: React.FC<EventRegistrationsModalProps> = ({
  event,
  registrations,
  users,
  onClose
}) => {
  // Get registrations for this specific event
  const eventRegistrations = registrations.filter(reg => reg.event_id === event.id);
  
  // Get user details for each registration
  const registeredUsers = eventRegistrations.map(registration => {
    const user = users.find(u => u.id === registration.user_id);
    return {
      registration,
      user
    };
  }).filter(item => item.user); // Filter out any registrations without user data

  const totalSeatsBooked = eventRegistrations.reduce((sum, reg) => sum + reg.seats_requested, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">Event Registrations</h2>
              <p className="text-indigo-100 text-sm">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Event Summary */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{registeredUsers.length}</p>
                <p className="text-sm">Registered Users</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalSeatsBooked}</p>
                <p className="text-sm">Total Seats Booked</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{event.seats_available}</p>
                <p className="text-sm">Seats Available</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-800 p-3 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{event.total_seats}</p>
                <p className="text-sm">Total Seats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="p-6">
          {registeredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Registrations Yet</h3>
              <p className="text-gray-500">No users have registered for this event.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Registered Users ({registeredUsers.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">
                        User Details
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">
                        Contact Information
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">
                        Registration Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map(({ registration, user }) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user?.full_name}</p>
                              <p className="text-sm text-gray-600">@{user?.username}</p>
                              <p className="text-xs text-gray-500">Age: {user?.age}</p>
                              <p className="text-xs text-gray-500">{user?.city_town_name}, {user?.country_of_residence}</p>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{user?.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{user?.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {registration.seats_requested} seat{registration.seats_requested > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Registered: {new Date(registration.registration_date).toLocaleDateString()} at{' '}
                              {new Date(registration.registration_date).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationsModal;