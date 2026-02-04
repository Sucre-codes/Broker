import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaRocket, 
  FaCar, 
  FaBrain, 
  FaNetworkWired,
  FaCalendar,
  FaMoneyBillWave,
  FaChartLine,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { investmentAPI, withdrawalAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchInvestment();
  }, [id]);

  const fetchInvestment = async () => {
    try {
      const response = await investmentAPI.getOne(id);
      setInvestment(response.data.data);
    } catch (error) {
      toast.error('Failed to load investment');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!investment) return;

    // Check if can withdraw (1 week minimum)
    const daysSinceStart = differenceInDays(new Date(), new Date(investment.startDate));
    if (daysSinceStart < 7) {
      toast.error(`Minimum holding period is 1 week. ${7 - daysSinceStart} days remaining.`);
      return;
    }

    if (investment.status !== 'active') {
      toast.error('This investment is not active');
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawalAPI.request({
        investmentId: investment._id,
        withdrawalMethod: 'bank',
        withdrawalDetails: 'Primary account'
      });
      
      toast.success('Withdrawal request submitted! 🎉');
      navigate('/withdrawals');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const getCompanyIcon = (assetType) => {
    const icons = {
      'Tesla': FaCar,
      'SpaceX': FaRocket,
      'Deepmind Technology': FaBrain,
      'The Boring Company': FaNetworkWired,
      'Neuralink': FaBrain
    };
    return icons[assetType] || FaRocket;
  };

  const getCompanyGradient = (assetType) => {
    const gradients = {
      'Tesla': 'from-red-500 to-orange-600',
      'SpaceX': 'from-blue-600 to-purple-700',
      'Deepmind Technology': 'from-purple-500 to-pink-600',
      'The Boring Company': 'from-gray-600 to-cyan-600',
      'Neuralink': 'from-pink-500 to-orange-500'
    };
    return gradients[assetType] || 'from-neon-blue to-neon-purple';
  };

   const formatStatus = (status) => {
    const labels = {
      awaiting_payment: 'awaiting payment',
      pending: 'pending',
      active: 'active',
      completed: 'completed',
      withdrawn: 'withdrawn',
      rejected: 'rejected'
    };
    return labels[status] || status.replace('_', ' ');
  };

  const generateChartData = () => {
    if (!investment) return [];
    
    const startDate = new Date(investment.startDate);
    const endDate = new Date(investment.endDate);
    const totalDays = differenceInDays(endDate, startDate);
    const daysPassed = Math.min(differenceInDays(new Date(), startDate), totalDays);
    
    const data = [];
    for (let i = 0; i <= daysPassed; i++) {
      const value = investment.amount + (investment.dailyGrowth * i);
      data.push({
        day: i,
        value: parseFloat(value.toFixed(2))
      });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-white/70">Loading investment details...</p>
        </div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="text-center">
          <p className="text-white/70 mb-4">Investment not found</p>
          <Link to="/dashboard" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getCompanyIcon(investment.assetType);
  const gradient = getCompanyGradient(investment.assetType);
  const profit = investment.currentValue - investment.amount;
  const profitPercentage = (profit / investment.amount * 100).toFixed(2);
  const progress = Math.min(100, ((new Date() - new Date(investment.startDate)) / (new Date(investment.endDate) - new Date(investment.startDate)) * 100));
  const canWithdraw = differenceInDays(new Date(), new Date(investment.startDate)) >= 7;
  const chartData = generateChartData();
  const isPending = investment.status === 'pending' || investment.status === 'awaiting_payment';
  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>

           <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-4">
            <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center`}>
              <Icon className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold">
                <span className="gradient-text">{investment.assetType}</span>
              </h1>
              <p className="text-white/70 text-lg capitalize">
                {investment.plan} Plan • {formatStatus(investment.status)}
              </p>
            </div>
          </div>
        </div>
         {isPending && (
          <motion.div
            className="glass-card p-5 sm:p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">Payment Action Required</h2>
                <p className="text-white/70 text-sm">
                  {investment.adminDetails
                    ? 'Your payment details are ready. Submit your proof to activate this investment.'
                    : 'We are preparing your payment details. Check back soon for transfer instructions.'}
                </p>
              </div>
              <Link to={`/payment/pending/${investment._id}`} className="btn-neon text-sm px-4 py-2 text-center">
                {investment.adminDetails ? 'Complete Payment' : 'View Status'}
              </Link>
            </div>
          </motion.div>
        )}


        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/60 text-sm font-semibold">Current Value</p>
                  <FaMoneyBillWave className="text-green-400" />
                </div>
                <p className="text-3xl font-display font-bold">
                  ${investment.currentValue?.toFixed(2)}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Initial: ${investment.amount.toFixed(2)}
                </p>
              </motion.div>

              <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/60 text-sm font-semibold">Total Profit</p>
                  <FaChartLine className="text-neon-purple" />
                </div>
                <p className={`text-3xl font-display font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {profitPercentage}% ROI
                </p>
              </motion.div>

              <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/60 text-sm font-semibold">Daily Growth</p>
                  <FaClock className="text-neon-blue" />
                </div>
                <p className="text-3xl font-display font-bold">
                  ${investment.dailyGrowth?.toFixed(2)}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Per day
                </p>
              </motion.div>
            </div>

            {/* Growth Chart */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-display font-bold mb-6">Growth Chart</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="rgba(255,255,255,0.5)"
                      label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)"
                      label={{ value: 'Value ($)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(0,212,255,0.3)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00d4ff" 
                      strokeWidth={3}
                      dot={{ fill: '#00d4ff', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-display font-bold mb-6">Investment Progress</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>
                    Started: {format(new Date(investment.startDate), 'MMM dd, yyyy')}
                  </span>
                  <span>
                    Ends: {format(new Date(investment.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-center text-white/70">
                  {progress.toFixed(0)}% Complete
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Info */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="font-bold mb-4 text-lg">Investment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Company</span>
                  <span className="font-semibold">{investment.assetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Plan</span>
                  <span className="font-semibold capitalize">{investment.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Duration</span>
                  <span className="font-semibold">{investment.timeframeWeeks} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Return Rate</span>
                  <span className="font-semibold">{(investment.annualReturnRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Expected ROI</span>
                  <span className="font-semibold text-green-400">${investment.expectedROI?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Auto-Compound</span>
                  <span className="font-semibold">{investment.autoCompound ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold mb-4 text-lg">Payment Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Method</span>
                  <span className="font-semibold capitalize">{investment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Status</span>
                  <span className="font-semibold text-green-400 capitalize">{investment.paymentStatus}</span>
                </div>
                {investment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Transaction ID</span>
                    <span className="font-semibold text-xs truncate ml-2">{investment.transactionId.substring(0, 12)}...</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Withdrawal Button */}
            <motion.div
              className="glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {canWithdraw && investment.status === 'active' ? (
                <div>
                  <h3 className="font-bold mb-4 text-lg">Ready to Withdraw</h3>
                  <p className="text-white/70 text-sm mb-4">
                    You can now withdraw your investment and profits.
                  </p>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {withdrawing ? (
                      <>
                        <div className="loading mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave className="mr-2" />
                        Withdraw ${investment.currentValue?.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold mb-4 text-lg">Withdrawal Info</h3>
                  {investment.status !== 'active' ? (
                    <p className="text-white/70 text-sm">
                      This investment is {investment.status}.
                    </p>
                  ) : (
                    <>
                      <p className="text-white/70 text-sm mb-3">
                        Minimum holding period: 1 week
                      </p>
                      <p className="text-yellow-400 text-sm">
                        {7 - differenceInDays(new Date(), new Date(investment.startDate))} days remaining
                      </p>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDetails;
