import React from 'react';
import { Link } from 'react-router-dom';
const Investments = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Investments</h1>
      <Link to="/dashboard" className="text-primary-600">← Back to Dashboard</Link>
      <p className="mt-4 text-gray-600">Investment list will be displayed here</p>
    </div>
  </div>
);
export default Investments;
