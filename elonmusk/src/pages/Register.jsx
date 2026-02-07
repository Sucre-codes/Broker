import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import authBg from "../assets/authbg.jpg";
import logo from "../assets/brandmark.svg";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Registration successful! Check your email to verify your account. 🚀');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-space"></div>
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-20"></div>
        
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 11,
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
      Join the
      <span className="gradient-text block">Mission to Mars</span>
    </h1>

    <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-lg">
      Become a part of the future. Invest in revolutionary technologies that
      will define the next era of human civilization.
    </p>

    <div className="space-y-5">
      {[
        { icon: "🌟", text: "Join 5,000+ future-focused investors" },
        { icon: "💰", text: "Start investing with just $500" },
        { icon: "📈", text: "Up to 400% annual returns" },
        { icon: "🔒", text: "Bank-level security guaranteed" },
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


          {/* Right Side - Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card p-10">
              {/* Mobile Logo */}
              <Link to="/" className="lg:hidden flex items-center justify-center space-x-2 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-pink rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <span className="text-2xl font-display font-bold gradient-text">
                  The Musk Foundation
                </span>
              </Link>

              <h2 className="text-3xl font-display font-bold mb-2 text-center lg:text-left">
                Create Your Account
              </h2>
              <p className="text-white/70 mb-8 text-center lg:text-left">
                Begin your journey to the future
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white/90">
                      First Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 ${errors.firstName ? 'border-2 border-red-500' : ''}`}
                        placeholder="Elon"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white/90">
                      Last Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 ${errors.lastName ? 'border-2 border-red-500' : ''}`}
                        placeholder="Musk"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>

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
                      className={`w-full pl-12 pr-4 py-3 ${errors.email ? 'border-2 border-red-500' : ''}`}
                      placeholder="elon@spacex.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
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
                      className={`w-full pl-12 pr-12 py-3 ${errors.password ? 'border-2 border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white/90">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 ${errors.confirmPassword ? 'border-2 border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="text-sm text-white/60">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-neon-blue hover:text-neon-purple transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-neon-blue hover:text-neon-purple transition-colors">
                    Privacy Policy
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
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
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
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link 
                to="/login" 
                className="block text-center btn-secondary w-full"
              >
                Login Instead
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
