import React from 'react';
import { Link } from 'react-router-dom';
const Withdrawals = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Withdrawals</h1>
      <Link to="/dashboard" className="text-primary-600">← Back to Dashboard</Link>
      <p className="mt-4 text-gray-600">Withdrawal history will be displayed here</p>
    </div>
  </div>
);
export default Withdrawals;
