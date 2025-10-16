import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Users, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddEventModalProps {
  onClose: () => void;
  onEventAdded: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onEventAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    total_seats: 10
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

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      const now = new Date();

      if (startDate <= now) {
        newErrors.start_time = 'Start time must be in the future';
      }

      if (endDate <= startDate) {
        newErrors.end_time = 'End time must be after start time';
      }

      const duration = calculateDuration(formData.start_time, formData.end_time);
      if (duration < 15) {
        newErrors.end_time = 'Event must be at least 15 minutes long';
      }
    }

    if (formData.total_seats < 1 || formData.total_seats > 1000) {
      newErrors.total_seats = 'Total seats must be between 1 and 1000';
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
      const duration = calculateDuration(formData.start_time, formData.end_time);
      
      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          duration,
          difficulty: formData.difficulty,
          total_seats: formData.total_seats,
          seats_available: formData.total_seats,
          status: 'available'
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

  const duration = calculateDuration(formData.start_time, formData.end_time);

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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.title 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter event title"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Describe the event, what participants can expect, requirements, etc."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Schedule</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.start_time 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.end_time 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                </div>
              </div>

              {duration > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Duration: {Math.floor(duration / 60)}h {duration % 60}m ({duration} minutes)
                  </p>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span>Event Details</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) => handleChange('total_seats', parseInt(e.target.value) || 0)}
                    min="1"
                    max="1000"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.total_seats 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Number of available seats"
                  />
                  {errors.total_seats && <p className="text-red-500 text-xs mt-1">{errors.total_seats}</p>}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Event Preview</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{formData.total_seats} seats available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    formData.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    formData.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formData.difficulty}
                  </span>
                </div>
                {duration > 0 && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{duration} minutes duration</span>
                  </div>
                )}
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