import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { investmentAPI } from '../utils/api';
import { FaHome, FaBuilding, FaChartPie, FaBitcoin, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const NewInvestment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    assetType: '',
    plan: '',
    amount: '',
    timeframeWeeks: '',
    paymentMethod: 'stripe'
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const assets = [
    { value: 'real-estate', label: 'Real Estate', icon: FaHome, color: 'from-blue-500 to-blue-600' },
    { value: 'business', label: 'Business', icon: FaBuilding, color: 'from-green-500 to-green-600' },
    { value: 'stocks', label: 'Stocks', icon: FaChartPie, color: 'from-purple-500 to-purple-600' },
    { value: 'crypto', label: 'Crypto', icon: FaBitcoin, color: 'from-orange-500 to-orange-600' }
  ];

  const plans = [
    { value: 'starter', label: 'Starter', rate: '8-12%', color: 'border-gray-300' },
    { value: 'silver', label: 'Silver', rate: '15-20%', color: 'border-gray-400' },
    { value: 'gold', label: 'Gold', rate: '25-35%', color: 'border-yellow-500' },
    { value: 'platinum', label: 'Platinum', rate: '40-50%', color: 'border-purple-500' }
  ];

  const calculatePreview = async () => {
    if (!formData.plan || !formData.amount || !formData.timeframeWeeks) return;
    try {
      const response = await investmentAPI.calculate({
        plan: formData.plan,
        amount: parseFloat(formData.amount),
        timeframeWeeks: parseInt(formData.timeframeWeeks)
      });
      setPreview(response.data.data);
    } catch (error) {
      toast.error('Error calculating preview');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await investmentAPI.create({
        ...formData,
        amount: parseFloat(formData.amount),
        timeframeWeeks: parseInt(formData.timeframeWeeks),
        transactionId: 'demo_' + Date.now()
      });
      toast.success('Investment created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Create New Investment</h1>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Asset Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {assets.map((asset) => (
                  <button
                    key={asset.value}
                    onClick={() => {
                      setFormData({...formData, assetType: asset.value});
                      setStep(2);
                    }}
                    className={`p-6 rounded-xl border-2 hover:shadow-lg transition ${
                      formData.assetType === asset.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${asset.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <asset.icon className="text-white text-2xl" />
                    </div>
                    <p className="font-semibold text-gray-900">{asset.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Plan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {plans.map((plan) => (
                  <button
                    key={plan.value}
                    onClick={() => {
                      setFormData({...formData, plan: plan.value});
                      setStep(3);
                    }}
                    className={`p-6 rounded-xl border-2 hover:shadow-lg transition ${
                      formData.plan === plan.value ? 'border-primary-600 bg-primary-50' : plan.color
                    }`}
                  >
                    <p className="font-bold text-gray-900 text-lg mb-1">{plan.label}</p>
                    <p className="text-2xl font-display font-bold text-gray-900 mb-1">{plan.rate}</p>
                    <p className="text-sm text-gray-600">Annual Return</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="text-primary-600 hover:text-primary-700">← Back</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Investment Details</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (minimum $10)</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    onBlur={calculatePreview}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe (weeks, minimum 2)</label>
                  <input
                    type="number"
                    min="2"
                    value={formData.timeframeWeeks}
                    onChange={(e) => setFormData({...formData, timeframeWeeks: e.target.value})}
                    onBlur={calculatePreview}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="wire">Wire Transfer</option>
                  </select>
                </div>
              </div>

              {preview && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Investment Preview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Investment Amount</p>
                      <p className="font-bold text-gray-900">${preview.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expected ROI</p>
                      <p className="font-bold text-green-600">${preview.expectedROI}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Return</p>
                      <p className="font-bold text-gray-900">${preview.totalReturn}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Daily Growth</p>
                      <p className="font-bold text-gray-900">${preview.dailyGrowth}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="text-primary-600 hover:text-primary-700">← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.amount || !formData.timeframeWeeks}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Investment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewInvestment;
