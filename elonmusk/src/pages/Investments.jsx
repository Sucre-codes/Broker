import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaCar, 
  FaRocket, 
  FaBrain, 
  FaNetworkWired,
  FaChartLine,
  FaTrophy,
  FaClock,
  FaFilter
} from 'react-icons/fa';
import { investmentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';

const Investments = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, withdrawn, pending

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await investmentAPI.getAll();
      setInvestments(response.data.data);
    } catch (error) {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-400/20 text-green-400 border-green-400/30',
      completed: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
      withdrawn: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
      pending: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
      awaiting_payment: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
      rejected: 'bg-red-400/20 text-red-400 border-red-400/30'
    };
    return badges[status] || 'bg-gray-400/20 text-gray-400 border-gray-400/30';
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

  const filteredInvestments = investments.filter(inv => {
    if (filter === 'all') return true;
     if (filter === 'pending') {
      return inv.status === 'pending' || inv.status === 'awaiting_payment';
    }
    return inv.status === filter;
  });

  // Calculate totals
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = totalValue - investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-white/70">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold mb-1">
                <span className="gradient-text">My Investments</span>
              </h1>
              <p className="text-white/70">Track and manage your portfolio</p>
            </div>

            <Link to="/invest/new" className="btn-primary inline-flex items-center">
              <FaPlus className="mr-2" />
              New Investment
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Total Investments</p>
              <FaTrophy className="text-neon-blue" />
            </div>
            <p className="text-3xl font-display font-bold">{investments.length}</p>
          </motion.div>

          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Total Invested</p>
              <FaChartLine className="text-blue-400" />
            </div>
            <p className="text-3xl font-display font-bold">${totalInvested.toFixed(2)}</p>
          </motion.div>

          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Current Value</p>
              <FaChartLine className="text-green-400" />
            </div>
            <p className="text-3xl font-display font-bold">${totalValue.toFixed(2)}</p>
          </motion.div>

          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Total Profit</p>
              <FaTrophy className="text-purple-400" />
            </div>
            <p className={`text-3xl font-display font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <FaFilter className="text-white/60" />
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              All ({investments.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active' 
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Active ({investments.filter(i => i.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'completed' 
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Completed ({investments.filter(i => i.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('withdrawn')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'withdrawn' 
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Withdrawn ({investments.filter(i => i.status === 'withdrawn').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Pending ({investments.filter(i => i.status === 'pending' || i.status === 'awaiting_payment').length})
            </button>
          </div>
        </div>

        {/* Investments Grid */}
        {filteredInvestments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredInvestments.map((investment, index) => {
              const Icon = getCompanyIcon(investment.assetType);
              const gradient = getCompanyGradient(investment.assetType);
               const isPending = investment.status === 'pending' || investment.status === 'awaiting_payment';
              const profit = investment.currentValue - investment.amount;
              const profitPercentage = (profit / investment.amount * 100).toFixed(2);
              const daysElapsed = differenceInDays(new Date(), new Date(investment.startDate));
              const totalDays = differenceInDays(new Date(investment.endDate), new Date(investment.startDate));
              const progress = Math.min(100, (daysElapsed / totalDays * 100)).toFixed(0);

              return (
                <motion.div
                  key={investment._id}
                  className="glass-card p-5 sm:p-6 cursor-pointer group hover:scale-[1.02] transition-transform"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/investments/${investment._id}`)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="text-2xl text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(investment.status)}`}>
                      {formatStatus(investment.status)}
                    </div>
                  </div>

                  {/* Company & Plan */}
                  <h3 className="font-bold text-xl mb-1">{investment.assetType}</h3>
                  <p className="text-white/60 text-sm mb-4 capitalize">{investment.plan} Plan</p>

                  {/* Values */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/60 text-xs mb-1">Invested</p>
                      <p className="font-bold">${investment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs mb-1">Current</p>
                      <p className="font-bold">${investment.currentValue.toFixed(2)}</p>
                    </div>
                  </div>
                
                  {/* Profit */}
                  <div className="glass-dark p-3 sm:p-4 rounded-lg mb-4">
                    <p className="text-white/60 text-xs mb-1">Profit/Loss</p>
                    <p className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPercentage}%)
                    </p>
                  </div>

                  {isPending && (
                    <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-white/60 mb-2">
                        {investment.adminDetails
                          ? 'Payment details are ready. Submit your proof to activate this investment.'
                          : 'We are preparing your payment details. You can check back anytime.'}
                      </p>
                      <Link
                        to={`/payment/pending/${investment._id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="btn-neon inline-flex items-center text-xs px-4 py-2"
                      >
                        {investment.adminDetails ? 'Complete Payment' : 'View Status'}
                      </Link>
                    </div>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-white/60 mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${gradient}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between text-xs text-white/50 mt-3">
                    <span>{format(new Date(investment.startDate), 'MMM dd')}</span>
                    <span>{format(new Date(investment.endDate), 'MMM dd')}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            className="glass-card text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaTrophy className="text-6xl text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">No {filter !== 'all' ? filter : ''} investments found</p>
            <p className="text-white/40 text-sm mb-6">
              {filter === 'all' 
                ? 'Start your investment journey today!' 
                : `You don't have any ${filter} investments yet`}
            </p>
            <Link to="/invest/new" className="btn-primary inline-flex items-center">
              <FaPlus className="mr-2" />
              Create New Investment
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Investments;
