import React from 'react';
import { Link, useParams } from 'react-router-dom';
const InvestmentDetails = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Investment Details</h1>
        <Link to="/investments" className="text-primary-600">← Back to Investments</Link>
        <p className="mt-4 text-gray-600">Details for investment #{id}</p>
      </div>
    </div>
  );
};
export default InvestmentDetails;
