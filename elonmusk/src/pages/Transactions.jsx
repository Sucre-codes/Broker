import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaHistory, 
  FaArrowUp, 
  FaArrowDown,
  FaCreditCard,
  FaFilter,
  FaDownload,
  FaCalendar
} from 'react-icons/fa';
import { transactionAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, deposit, withdrawal, return

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data.data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return { icon: FaArrowDown, color: 'text-green-400', bg: 'bg-green-400/20' };
      case 'withdrawal':
        return { icon: FaArrowUp, color: 'text-blue-400', bg: 'bg-blue-400/20' };
      case 'return':
        return { icon: FaArrowDown, color: 'text-purple-400', bg: 'bg-purple-400/20' };
      default:
        return { icon: FaCreditCard, color: 'text-gray-400', bg: 'bg-gray-400/20' };
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-400/20 text-green-400 border-green-400/30',
      pending: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
      failed: 'bg-red-400/20 text-red-400 border-red-400/30',
      cancelled: 'bg-gray-400/20 text-gray-400 border-gray-400/30'
    };
    return badges[status] || 'bg-gray-400/20 text-gray-400 border-gray-400/30';
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Status', 'Payment Method', 'Description'].join(','),
      ...transactions.map(t => [
        format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        t.type,
        t.amount,
        t.status,
        t.paymentMethod || '',
        t.description || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Transactions exported successfully!');
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  // Calculate totals
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-white/70">Loading transactions...</p>
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
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold mb-1">
                <span className="gradient-text">Transaction History</span>
              </h1>
              <p className="text-white/70">View all your financial activities</p>
            </div>

            <button
              onClick={exportToCSV}
              className="btn-secondary inline-flex items-center justify-center w-full sm:w-auto"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
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
              <p className="text-white/60 text-sm font-semibold">Total Transactions</p>
              <FaHistory className="text-neon-blue" />
            </div>
            <p className="text-3xl font-display font-bold">{transactions.length}</p>
          </motion.div>

          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Total Deposits</p>
              <FaArrowDown className="text-green-400" />
            </div>
            <p className="text-3xl font-display font-bold text-green-400">
              ${totalDeposits.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Total Withdrawals</p>
              <FaArrowUp className="text-blue-400" />
            </div>
            <p className="text-3xl font-display font-bold text-blue-400">
              ${totalWithdrawals.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-semibold">Net Flow</p>
              <FaCreditCard className="text-purple-400" />
            </div>
            <p className={`text-3xl font-display font-bold ${totalDeposits - totalWithdrawals >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${(totalDeposits - totalWithdrawals).toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 sm:p-5 mb-8">
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
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'deposit' 
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Deposits ({transactions.filter(t => t.type === 'deposit').length})
            </button>
            <button
              onClick={() => setFilter('withdrawal')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'withdrawal' 
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Withdrawals ({transactions.filter(t => t.type === 'withdrawal').length})
            </button>
            <button
              onClick={() => setFilter('return')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'return' 
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Returns ({transactions.filter(t => t.type === 'return').length})
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <motion.div
          className="glass-card p-5 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-display font-bold mb-6">Recent Transactions</h2>

          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction, index) => {
                const { icon: Icon, color, bg } = getTransactionIcon(transaction.type);

                return (
                  <motion.div
                    key={transaction._id}
                    className="glass-dark p-4 sm:p-6 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                          <Icon className={`${color} text-xl`} />
                        </div>
                        <div>
                          <h3 className="font-bold capitalize">{transaction.type}</h3>
                          <p className="text-white/60 text-sm">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {transaction.description && (
                            <p className="text-white/50 text-xs mt-1">{transaction.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-xl sm:text-2xl font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'return' 
                            ? 'text-green-400' 
                            : 'text-blue-400'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'return' ? '+' : '-'}
                          ${transaction.amount.toFixed(2)}
                        </p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-semibold mt-2 ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {transaction.paymentMethod && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                        <span className="text-white/60">Payment Method:</span>
                        <span className="font-semibold capitalize">{transaction.paymentMethod}</span>
                      </div>
                    )}

                    {transaction.externalTransactionId && (
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-white/60">Transaction ID:</span>
                        <span className="font-mono text-xs">{transaction.externalTransactionId.substring(0, 20)}...</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-16 px-4">
              <FaHistory className="text-6xl text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No {filter !== 'all' ? filter : ''} transactions found</p>
              <p className="text-white/40 text-sm">
                {filter === 'all' 
                  ? 'Your transaction history will appear here' 
                  : `No ${filter} transactions yet`}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Transactions;
