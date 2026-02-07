import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaRocket, 
  FaPlus, 
  FaChartLine, 
  FaWallet, 
  FaHistory, 
  FaSignOutAlt,
  FaUser,
  FaCar,
  FaBrain,
  FaNetworkWired,
  FaBolt,
  FaArrowUp,
  FaTrophy,
  FaBars
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { investmentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Sidebar from "../components/Sidebar";
import logo from "../assets/brandmark.svg";


const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingInvestments, setPendingInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
       const [statsResponse, investmentsResponse] = await Promise.all([
        investmentAPI.getDashboardStats(),
        investmentAPI.getAll()
      ]);
      setStats(statsResponse.data.data);
      const pending = investmentsResponse.data.data.filter(
        (investment) => investment.status === 'pending' || investment.status === 'awaiting_payment'
      );
      setPendingInvestments(pending);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-white/70">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-10"></div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
    isOpen={sidebarOpen}
    onClose={() => setSidebarOpen(false)}
  />


      {/* Main Content */}
      <main className="relative z-10 lg:ml-72">
        {/* Top Bar */}
       <div className="glass border-b border-white/10 sticky top-0 z-30">
  <div className="px-5 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
    
    {/* Mobile Hamburger */}
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden text-white/80 hover:text-white"
    >
      <FaBars size={22} />
    </button>

    {/* Welcome */}
    <div>
      <h1 className="text-xl sm:text-2xl font-display font-bold">
        Welcome back,{" "}
        <span className="gradient-text">
          {user?.firstName || "Investor"}
        </span>{" "}
        🚀
      </h1>
      <p className="text-white/60 text-sm hidden sm:block">
        Track your journey to the future
      </p>
    </div>

    {/* CTA */}
    <Link
      to="/invest/new"
      className="btn-primary hidden sm:inline-flex items-center"
    >
      <FaPlus className="mr-2" />
      New Investment
    </Link>
  </div>
</div>


        {/* Dashboard Content */}
        <div className="px-5 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Invested */}
            <motion.div
              className="glass-card p-5 sm:p-6 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/60 text-sm font-semibold">Total Invested</p>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FaWallet className="text-white" />
                  </div>
                </div>
                <p className="text-4xl font-display font-bold mb-2">
                  ${stats?.totalInvested || '0.00'}
                                    
                </p>
                <p className="text-white/50 text-sm">
                  {stats?.activeInvestments || 0} active investments
                </p>
              </div>
            </motion.div>

            {/* Current Balance */}
            <motion.div
              className="glass-card p-5 sm:p-6 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/60 text-sm font-semibold">Current Balance</p>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-white" />
                  </div>
                </div>
                <p className="text-4xl font-display font-bold mb-2">
                  ${stats?.currentBalance|| '0.00'}
                </p>
                <div className="flex items-center text-green-400 text-sm">
                  <FaArrowUp className="mr-1" />
                  <span>Growing daily</span>
                </div>
              </div>
            </motion.div>

            {/* Total Returns */}
            <motion.div
              className="glass-card p-5 sm:p-6 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/60 text-sm font-semibold">Total Returns</p>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <FaTrophy className="text-white" />
                  </div>
                </div>
                <p className="text-4xl font-display font-bold mb-2">
                  ${stats?.totalReturns || '0.00'}
                </p>
                <p className="text-white/50 text-sm">
                  +{((stats?.totalReturns / stats?.totalInvested * 100) || 0).toFixed(2)}% ROI
                </p>
              </div>
            </motion.div>
          </div>

                {pendingInvestments.length > 0 && (
            <motion.div
              className="glass-card p-5 sm:p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-display font-bold">Pending Payments</h2>
                <Link to="/investments" className="text-neon-blue hover:text-neon-purple transition-colors text-sm font-semibold">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {pendingInvestments.map((investment) => (
                  <div
                    key={investment._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">{investment.assetType}</p>
                      <p className="text-sm text-white/60 capitalize">
                        {investment.plan} plan · {investment.paymentMethod}
                      </p>
                      <p className="text-xs text-white/50">
                        Status: {investment.status === 'awaiting_payment' ? 'Awaiting payment' : 'Pending details'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link to={`/payment/pending/${investment._id}`} className="btn-neon text-sm px-4 py-2 text-center">
                        {investment.adminDetails ? 'Complete Payment' : 'View Status'}
                      </Link>
                      <Link to={`/investments/${investment._id}`} className="btn-secondary text-sm px-4 py-2 text-center">
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Investments */}
          <motion.div
            className="glass-card p-5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Recent Investments</h2>
              <Link to="/investments" className="text-neon-blue hover:text-neon-purple transition-colors text-sm font-semibold">
                View All →
              </Link>
            </div>

            {stats?.recentInvestments?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentInvestments.map((investment) => {
                  const Icon = getCompanyIcon(investment.assetType);
                  const gradient = getCompanyGradient(investment.assetType);
                  const profit = investment.currentValue - investment.amount;
                  const profitPercentage = (profit / investment.amount * 100).toFixed(2);

                  return (
                    <motion.div
                      key={investment._id}
                      className="glass-dark p-5 sm:p-6 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => navigate(`/investments/${investment._id}`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className="text-white text-xl" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg capitalize">
                              {investment.assetType}
                            </h3>
                            <p className="text-white/60 text-sm">
                              {investment.plan.charAt(0).toUpperCase() + investment.plan.slice(1)} Plan
                            </p>
                            <p className="text-white/40 text-xs">
                              Started {format(new Date(investment.startDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${investment.currentValue?.toFixed(2)}
                          </p>
                          <p className={`text-sm font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPercentage}%)
                          </p>
                          <p className="text-white/40 text-xs">
                            Initial: ${investment.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/60 mb-2">
                          <span>Progress</span>
                          <span>
                            {Math.min(100, ((new Date() - new Date(investment.startDate)) / (new Date(investment.endDate) - new Date(investment.startDate)) * 100)).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${gradient}`}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(100, ((new Date() - new Date(investment.startDate)) / (new Date(investment.endDate) - new Date(investment.startDate)) * 100))}%` 
                            }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaRocket className="text-6xl text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-4">No investments yet</p>
                <Link to="/invest/new" className="btn-primary inline-flex items-center">
                  <FaPlus className="mr-2" />
                  Create Your First Investment
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/invest/new" className="glass-card p-5 sm:p-6 group hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaPlus className="text-white text-xl" />
              </div>
              <h3 className="font-bold mb-2">New Investment</h3>
              <p className="text-white/60 text-sm">Start investing in the future</p>
            </Link>

            <Link to="/withdrawals" className="glass-card p-5 sm:p-6 group hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaWallet className="text-white text-xl" />
              </div>
              <h3 className="font-bold mb-2">Withdraw Funds</h3>
              <p className="text-white/60 text-sm">Access your earnings</p>
            </Link>

            <Link to="/transactions" className="glass-card p-5 sm:p-6 group hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaHistory className="text-white text-xl" />
              </div>
              <h3 className="font-bold mb-2">View History</h3>
              <p className="text-white/60 text-sm">Track all transactions</p>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
