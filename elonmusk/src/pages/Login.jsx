import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import authBg from "../assets/authbg.jpg";
import logo from "../assets/logoofcompany.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('Welcome back to the future! 🚀');
      navigate('/dashboard');
    } catch (error) {
      // Error handling done in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-space"></div>
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-20"></div>
        
        {/* Animated Orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}

<motion.div
  className="hidden lg:flex relative flex-col justify-center p-16 overflow-hidden"
  style={{
    backgroundImage: `url(${authBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/75" />

  {/* Content */}
  <div className="relative z-10">
    <Link to="/" className="flex items-center space-x-3 mb-10 group">
      <img
        src={logo}
        alt="The Musk Foundation"
        className="w-14 h-14 object-contain"
      />
      <span className="text-3xl font-display font-bold gradient-text">
        The Musk Foundation
      </span>
    </Link>

    <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
      Welcome Back,
      <span className="gradient-text block">Future Pioneer</span>
    </h1>

    <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-lg">
      Continue your journey in shaping humanity's future. Access your portfolio
      and track your investments in revolutionary technologies.
    </p>

    <div className="space-y-5">
      {[
        { icon: "🚀", text: "Real-time portfolio tracking" },
        { icon: "💎", text: "Secure and encrypted" },
        { icon: "⚡", text: "Instant access to funds" },
      ].map((item, index) => (
        <motion.div
          key={index}
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center text-2xl">
            {item.icon}
          </div>
          <span className="text-white/80 text-base">{item.text}</span>
        </motion.div>
      ))}
    </div>
  </div>
</motion.div>


          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card p-10">
              {/* Mobile Logo */}
              <Link to="/" className="lg:hidden flex items-center justify-center space-x-2 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <span className="text-2xl font-display font-bold gradient-text">
                  The Musk Foundation
                </span>
              </Link>

              <h2 className="text-3xl font-display font-bold mb-2 text-center lg:text-left">
                Access Your Account
              </h2>
              <p className="text-white/70 mb-8 text-center lg:text-left">
                Login to continue your investment journey
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/90">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/90">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading mr-3"></div>
                      Logging in...
                    </div>
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 glass-dark text-white/60">
                    New to the foundation?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <Link 
                to="/register" 
                className="block text-center btn-neon w-full"
              >
                Create Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
