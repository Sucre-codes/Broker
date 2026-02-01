import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { investmentAPI } from '../utils/api';
import { FaHome, FaChartLine, FaHistory, FaMoneyBillWave, FaSignOutAlt, FaUser, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await investmentAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
            <FaChartLine className="text-white text-lg" />
          </div>
          <span className="text-xl font-display font-bold text-gradient">InvestHub</span>
        </div>

        <nav className="space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-xl font-medium">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/investments" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition">
            <FaChartLine />
            <span>Investments</span>
          </Link>
          <Link to="/withdrawals" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition">
            <FaMoneyBillWave />
            <span>Withdrawals</span>
          </Link>
          <Link to="/transactions" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition">
            <FaHistory />
            <span>Transactions</span>
          </Link>
          <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition">
            <FaUser />
            <span>Profile</span>
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition w-full absolute bottom-6"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your investments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <p className="text-primary-100 text-sm font-medium mb-2">Total Invested</p>
            <p className="text-4xl font-bold">${stats?.totalInvested?.toFixed(2) || '0.00'}</p>
            <div className="flex items-center mt-4 text-sm">
              <FaArrowUp className="mr-1" />
              <span>{stats?.activeInvestments || 0} active investments</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <p className="text-green-100 text-sm font-medium mb-2">Current Balance</p>
            <p className="text-4xl font-bold">${stats?.currentBalance?.toFixed(2) || '0.00'}</p>
            <div className="flex items-center mt-4 text-sm">
              <FaArrowUp className="mr-1" />
              <span>Growing daily</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <p className="text-accent-100 text-sm font-medium mb-2">Total Returns</p>
            <p className="text-4xl font-bold">${stats?.totalReturns?.toFixed(2) || '0.00'}</p>
            <div className="flex items-center mt-4 text-sm">
              <FaArrowUp className="mr-1" />
              <span>+{((stats?.totalReturns / stats?.totalInvested) * 100 || 0).toFixed(2)}%</span>
            </div>
          </motion.div>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link
            to="/invest/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            <FaPlus className="mr-2" />
            New Investment
          </Link>
        </div>

        {/* Recent Investments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Investments</h2>
          {stats?.recentInvestments?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentInvestments.map((investment) => (
                <Link
                  key={investment._id}
                  to={`/investments/${investment._id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {investment.assetType.replace('-', ' ')} - {investment.plan}
                    </p>
                    <p className="text-sm text-gray-600">
                      Started {format(new Date(investment.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${investment.currentValue?.toFixed(2)}</p>
                    <p className="text-sm text-green-600">
                      +${(investment.currentValue - investment.amount).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No investments yet. Start investing today!</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
