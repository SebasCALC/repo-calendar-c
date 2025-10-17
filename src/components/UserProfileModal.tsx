import React, { useState } from 'react';
import { X, User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';
import { updateUserProfile, updateUserPassword } from '../lib/supabase';

interface UserProfileModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onClose,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    username: currentUser.username,
    full_name: currentUser.full_name,
    phone: currentUser.phone,
    age: currentUser.age
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    if (!profileData.username.trim()) {
      errors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!profileData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }

    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!profileData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(profileData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (profileData.age < 13 || profileData.age > 120) {
      errors.age = 'Age must be between 13 and 120';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setProfileLoading(true);
    
    try {
      const updatedProfile = await updateUserProfile(currentUser.id, profileData);
      onProfileUpdated(updatedProfile);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.message.includes('duplicate key')) {
        setProfileErrors({ username: 'Username already exists' });
      } else {
        setProfileErrors({ general: error.message || 'Failed to update profile' });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    
    try {
      await updateUserPassword(passwordData.newPassword);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert('Password updated successfully!');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordErrors({ general: error.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfileData({ ...profileData, [field]: value });
    if (profileErrors[field]) {
      setProfileErrors({ ...profileErrors, [field]: '' });
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({ ...passwordData, [field]: value });
    if (passwordErrors[field]) {
      setPasswordErrors({ ...passwordErrors, [field]: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">My Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info Banner */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentUser.full_name}</h3>
              <p className="text-gray-600">@{currentUser.username}</p>
              {currentUser.is_admin && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                  Administrator
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Change Password
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'profile' ? (
            /* Profile Tab */
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      profileErrors.username 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="Enter username"
                  />
                  {profileErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      profileErrors.age 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    min="13"
                    max="120"
                  />
                  {profileErrors.age && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.age}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => handleProfileChange('full_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    profileErrors.full_name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-purple-500'
                  }`}
                  placeholder="Enter full name"
                />
                {profileErrors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{profileErrors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Email address"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed here. Contact support to update your email address.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    profileErrors.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-purple-500'
                  }`}
                  placeholder="Enter phone number"
                />
                {profileErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{profileErrors.phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Residence *
                  </label>
                  <input
                    type="text"
                    value={profileData.country_of_residence}
                    onChange={(e) => handleProfileChange('country_of_residence', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      profileErrors.country_of_residence 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="Enter your country"
                  />
                  {profileErrors.country_of_residence && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.country_of_residence}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City or Town Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.city_town_name}
                    onChange={(e) => handleProfileChange('city_town_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      profileErrors.city_town_name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="Enter your city or town"
                  />
                  {profileErrors.city_town_name && (
                    <p className="text-red-500 text-xs mt-1">{profileErrors.city_town_name}</p>
                  )}
                </div>
              </div>

              {profileErrors.general && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">{profileErrors.general}</p>
                </div>
              )}

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
                  disabled={profileLoading}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{profileLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Password Tab */
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    <strong>Security Notice:</strong> Changing your password will require you to sign in again on all devices.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                      passwordErrors.newPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                      passwordErrors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {passwordErrors.general && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">{passwordErrors.general}</p>
                </div>
              )}

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
                  disabled={passwordLoading}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>{passwordLoading ? 'Updating...' : 'Change Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;