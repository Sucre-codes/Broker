import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaMoneyBillWave, 
  FaClock, 
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import { withdrawalAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await withdrawalAPI.getAll();
      setWithdrawals(response.data.data);
    } catch (error) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-400" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-400" />;
      case 'processing':
        return <FaSpinner className="text-yellow-400 animate-spin" />;
      default:
        return <FaClock className="text-blue-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-white/70">Loading withdrawals...</p>
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">
                <span className="gradient-text">Withdrawals</span>
              </h1>
              <p className="text-white/70">Track your withdrawal requests</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Total</p>
              <FaMoneyBillWave className="text-neon-blue" />
            </div>
            <p className="text-3xl font-display font-bold">{withdrawals.length}</p>
            <p className="text-white/50 text-sm">All withdrawals</p>
          </motion.div>

          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Pending</p>
              <FaClock className="text-blue-400" />
            </div>
            <p className="text-3xl font-display font-bold">
              {withdrawals.filter(w => w.status === 'pending').length}
            </p>
            <p className="text-white/50 text-sm">Awaiting review</p>
          </motion.div>

          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Completed</p>
              <FaCheckCircle className="text-green-400" />
            </div>
            <p className="text-3xl font-display font-bold">
              {withdrawals.filter(w => w.status === 'completed').length}
            </p>
            <p className="text-white/50 text-sm">Successfully paid</p>
          </motion.div>

          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Total Amount</p>
              <FaMoneyBillWave className="text-green-400" />
            </div>
            <p className="text-3xl font-display font-bold">
              ${withdrawals.reduce((sum, w) => sum + w.amount + w.profit, 0).toFixed(2)}
            </p>
            <p className="text-white/50 text-sm">All time</p>
          </motion.div>
        </div>

        {/* Withdrawals List */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-display font-bold mb-6">Withdrawal History</h2>

          {withdrawals.length > 0 ? (
            <div className="space-y-4">
              {withdrawals.map((withdrawal, index) => (
                <motion.div
                  key={withdrawal._id}
                  className="glass-dark p-6 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <FaMoneyBillWave className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          ${(withdrawal.amount + withdrawal.profit).toFixed(2)}
                        </h3>
                        <p className="text-white/60 text-sm">
                          Requested {format(new Date(withdrawal.requestedAt || withdrawal.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${getStatusColor(withdrawal.status)}`}>
                        {getStatusIcon(withdrawal.status)}
                        <span className="capitalize">{withdrawal.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-white/60 text-sm">Principal</p>
                      <p className="font-semibold">${withdrawal.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Profit</p>
                      <p className="font-semibold text-green-400">${withdrawal.profit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Method</p>
                      <p className="font-semibold capitalize">{withdrawal.withdrawalMethod}</p>
                    </div>
                  </div>

                  {withdrawal.adminNotes && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-xs mb-1">Admin Notes:</p>
                      <p className="text-sm">{withdrawal.adminNotes}</p>
                    </div>
                  )}

                  {withdrawal.completedAt && (
                    <div className="mt-3 text-sm text-white/60">
                      Completed on {format(new Date(withdrawal.completedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FaMoneyBillWave className="text-6xl text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No withdrawals yet</p>
              <p className="text-white/40 text-sm mb-6">
                Visit your investments to request a withdrawal
              </p>
              <Link to="/dashboard" className="btn-primary inline-flex items-center">
                <FaArrowLeft className="mr-2" />
                View Investments
              </Link>
            </div>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="glass-card mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold mb-4">Withdrawal Information</h3>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
              <p>Minimum holding period is 1 week (7 days) from investment start date</p>
            </div>
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
              <p>Processing typically takes 2-5 business days after approval</p>
            </div>
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
              <p>You'll receive both your principal and earned profits</p>
            </div>
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
              <p>Email notifications sent at each status change</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Withdrawals;
