import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChartLine, FaShieldAlt, FaClock, FaGlobe, FaArrowRight, FaBitcoin, FaBuilding, FaChartPie, FaHome } from 'react-icons/fa';

/**
 * Landing Page Component
 * Professional, modern design with animations
 */
const LandingPage = () => {
  const assets = [
    { icon: FaHome, name: 'Real Estate', color: 'from-blue-500 to-blue-600' },
    { icon: FaBuilding, name: 'Business', color: 'from-green-500 to-green-600' },
    { icon: FaChartPie, name: 'Stocks', color: 'from-purple-500 to-purple-600' },
    { icon: FaBitcoin, name: 'Crypto', color: 'from-orange-500 to-orange-600' }
  ];

  const features = [
    {
      icon: FaChartLine,
      title: 'Real-Time Growth',
      description: 'Watch your investments grow day by day with live tracking and updates'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Trusted',
      description: 'Bank-level security with verified assets and transparent operations'
    },
    {
      icon: FaClock,
      title: 'Flexible Terms',
      description: 'Choose your own investment amount and timeframe from 2 weeks onwards'
    },
    {
      icon: FaGlobe,
      title: 'Global Access',
      description: 'Invest from anywhere with multiple payment methods accepted worldwide'
    }
  ];

  const plans = [
    { name: 'Starter', rate: '8-12%', color: 'bg-gray-100 border-gray-300' },
    { name: 'Silver', rate: '15-20%', color: 'bg-gradient-to-br from-gray-200 to-gray-300' },
    { name: 'Gold', rate: '25-35%', color: 'bg-gradient-to-br from-yellow-300 to-yellow-500' },
    { name: 'Platinum', rate: '40-50%', color: 'bg-gradient-to-br from-purple-400 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-white text-xl" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                InvestHub
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition transform"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-300 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6">
              Invest in Real Assets,{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Earn Real Returns
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Start building your wealth with flexible investment options in real estate, businesses, stocks, and crypto. 
              Watch your money grow in real-time with returns up to 50% annually.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform inline-flex items-center justify-center"
              >
                Start Investing Now
                <FaArrowRight className="ml-2" />
              </Link>
              <button className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-2xl font-semibold text-lg hover:bg-primary-50 transition">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Asset Types */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {assets.map((asset, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${asset.color} rounded-xl flex items-center justify-center mb-4`}>
                  <asset.icon className="text-white text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{asset.name}</h3>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
              Why Choose InvestHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the tools and platform you need to grow your wealth confidently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
              Flexible Investment Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that matches your goals. Higher tiers, higher returns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${plan.color} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 border-2`}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-display font-bold text-gray-900 mb-4">{plan.rate}</div>
                <p className="text-gray-700 font-medium">Annual Return</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6 text-lg">Set your own amount and timeframe (minimum 2 weeks)</p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform"
            >
              Start Your Journey
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            Ready to Start Growing Your Wealth?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of investors who are already earning returns on their investments.
            Get started in minutes with as little as $10.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-10 py-5 bg-white text-primary-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition transform"
          >
            Create Free Account
            <FaArrowRight className="ml-3" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
            <span className="text-2xl font-display font-bold">InvestHub</span>
          </div>
          <p className="text-gray-400 mb-4">Smart investing made simple</p>
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} InvestHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
