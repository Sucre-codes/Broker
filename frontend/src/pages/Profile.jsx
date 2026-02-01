import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        <Link to="/dashboard" className="text-primary-600">← Back to Dashboard</Link>
        <div className="mt-6 bg-white rounded-xl p-6">
          <p className="text-gray-700"><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
          <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
};
export default Profile;
