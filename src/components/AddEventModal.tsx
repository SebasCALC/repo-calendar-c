import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Users, Award } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AddEventModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onEventAdded: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ currentUser, onClose, onEventAdded }) => {
  const [formData, setFormData] = useState({
    title_es: '',
    title_en: '',
    description_es: '',
    description_en: '',
    date: '',
    time: '',
    location: '',
    max_seats: 10
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60)));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title_es.trim()) {
      newErrors.title_es = 'Spanish title is required';
    }

    if (!formData.title_en.trim()) {
      newErrors.title_en = 'English title is required';
    }

    if (!formData.description_es.trim()) {
      newErrors.description_es = 'Spanish description is required';
    }

    if (!formData.description_en.trim()) {
      newErrors.description_en = 'English description is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.date) {
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.date = 'Event date must be in the future';
      }
    }

    if (formData.max_seats < 1 || formData.max_seats > 1000) {
      newErrors.max_seats = 'Maximum seats must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title_es: formData.title_es.trim(),
          title_en: formData.title_en.trim(),
          description_es: formData.description_es.trim(),
          description_en: formData.description_en.trim(),
          date: formData.date,
          time: formData.time,
          location: formData.location.trim(),
          max_seats: formData.max_seats,
          available_seats: formData.max_seats,
          status: 'planned',
          provider_id: currentUser.id,
          provider_name: currentUser.name
        });

      if (error) throw error;

      onEventAdded();
      onClose();
      alert('Event created successfully!');
    } catch (error: any) {
      console.error('Error creating event:', error);
      setErrors({ general: error.message || 'Failed to create event' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Add New Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Event Information</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                    <input
                      type="text"
                      value={formData.title_es}
                      onChange={(e) => handleChange('title_es', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.title_es 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Título del evento"
                    />
                    {errors.title_es && <p className="text-red-500 text-xs mt-1">{errors.title_es}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">English</label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => handleChange('title_en', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.title_en 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Event title"
                    />
                    {errors.title_en && <p className="text-red-500 text-xs mt-1">{errors.title_en}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Description *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                    <textarea
                      value={formData.description_es}
                      onChange={(e) => handleChange('description_es', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.description_es 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Descripción del evento..."
                    />
                    {errors.description_es && <p className="text-red-500 text-xs mt-1">{errors.description_es}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">English</label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => handleChange('description_en', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.description_en 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Event description..."
                    />
                    {errors.description_en && <p className="text-red-500 text-xs mt-1">{errors.description_en}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Schedule</span>
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.date 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.time 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.location 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Event location"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Event Details</span>
              </h3>

              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Seats *
                  </label>
                  <input
                    type="number"
                    value={formData.max_seats}
                    onChange={(e) => handleChange('max_seats', parseInt(e.target.value) || 0)}
                    min="1"
                    max="1000"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.max_seats 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Number of available seats"
                  />
                  {errors.max_seats && <p className="text-red-500 text-xs mt-1">{errors.max_seats}</p>}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Event Preview</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{formData.max_seats} seats available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Status: Planned (will be visible to all users)</span>
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{loading ? 'Creating Event...' : 'Add Event'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;