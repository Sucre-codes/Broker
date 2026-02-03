import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaCamera,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profile'); // profile, security, preferences
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [autoCompound, setAutoCompound] = useState(user?.autoCompound || false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCompoundToggle = async () => {
    setLoading(true);
    try {
      await updateProfile({ autoCompound: !autoCompound });
      setAutoCompound(!autoCompound);
      toast.success(`Auto-compound ${!autoCompound ? 'enabled' : 'disabled'}!`);
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    setLoading(true);
    try {
      await userAPI.uploadPictureFile(formData);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>

          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Profile Settings</span>
          </h1>
          <p className="text-white/70">Manage your account and preferences</p>
        </div>

        {/* Profile Header Card */}
        <motion.div
          className="glass-card mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
    {user?.profilePicture ? (
      <img
        src={user.profilePicture}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-4xl font-bold text-white">
        {user?.firstName?.charAt(0)}
        {user?.lastName?.charAt(0)}
      </span>
    )}
  </div>

  {/* Hover / Tap Overlay */}
  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 opacity-100 md:opacity-0 transition cursor-pointer rounded-2xl">
    <FaCamera className="text-white text-2xl" />
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleProfilePictureUpload}
    />
  </label>
</div>


            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-white/60">{user?.email}</p>
              <p className="text-white/50 text-sm mt-1">
                Member since {format(new Date(user?.createdAt || Date.now()), 'MMM yyyy')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="glass-card mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setTab('profile')}
              className={`px-5 py-2.5 whitespace-nowrap rounded-lg font-medium transition ${
                tab === 'profile'
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaUser className="inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setTab('security')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                tab === 'security'
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaLock className="inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setTab('preferences')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                tab === 'preferences'
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaShieldAlt className="inline mr-2" />
              Preferences
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {/* Profile Tab */}
        {tab === 'profile' && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-bold mb-6">Personal Information</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full pl-12 pr-4 py-3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full pl-12 pr-4 py-3"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3"
                    required
                    disabled
                  />
                </div>
                <p className="text-white/50 text-sm mt-2">
                  Email cannot be changed for security reasons
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="loading mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-bold mb-6">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full pl-12 pr-4 py-3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full pl-12 pr-4 py-3"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-white/50 text-sm mt-2">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full pl-12 pr-4 py-3"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="loading mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {tab === 'preferences' && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-bold mb-6">Investment Preferences</h3>
            
            <div className="space-y-6">
              {/* Auto-Compound Toggle */}
              <div className="glass-dark p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">Auto-Compound Returns</h4>
                    <p className="text-white/60 text-sm">
                      Automatically reinvest your returns to maximize growth
                    </p>
                  </div>
                  <button
                    onClick={handleAutoCompoundToggle}
                    disabled={loading}
                    className="ml-4"
                  >
                    {autoCompound ? (
                      <FaToggleOn className="text-5xl text-green-400 hover:text-green-500 transition" />
                    ) : (
                      <FaToggleOff className="text-5xl text-white/30 hover:text-white/50 transition" />
                    )}
                  </button>
                </div>
              </div>

              {/* Account Stats */}
              <div className="glass-dark p-6 rounded-xl">
                <h4 className="font-bold text-lg mb-4">Account Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Total Invested</p>
                    <p className="text-2xl font-bold">${user?.totalInvested?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Total Returns</p>
                    <p className="text-2xl font-bold text-green-400">${user?.totalReturns?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Current Balance</p>
                    <p className="text-2xl font-bold">${user?.currentBalance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
