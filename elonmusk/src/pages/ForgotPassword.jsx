import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaRocket } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';
import authBg from '../assets/authbg.jpg';
import logo from '../assets/brandmark.svg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email: email.trim() });
      toast.success(response.data.message || 'Reset instructions sent to your inbox.');
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-space"></div>
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="hidden lg:flex relative flex-col justify-center p-16 overflow-hidden"
            style={{
              backgroundImage: `url(${authBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative z-10">
              <Link to="/" className="flex items-center space-x-3 mb-10 group">
                <img src={logo} alt="The Musk Foundation" className="w-14 h-14 object-contain" />
                <span className="text-3xl font-display font-bold gradient-text">The Musk Foundation</span>
              </Link>
              <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
                Reset your
                <span className="gradient-text block">access credentials</span>
              </h1>
              <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-lg">
                Enter the email linked to your portfolio and we&apos;ll send you the steps to create a new password.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card p-10">
              <Link to="/" className="lg:hidden flex items-center justify-center space-x-2 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <span className="text-2xl font-display font-bold gradient-text">The Musk Foundation</span>
              </Link>

              <h2 className="text-3xl font-display font-bold mb-2 text-center lg:text-left">Forgot Password</h2>
              <p className="text-white/70 mb-8 text-center lg:text-left">
                We&apos;ll email you reset instructions in minutes.
              </p>

              {submitted ? (
                <div className="glass-dark p-6 rounded-xl">
                  <p className="text-white/80">
                    If an account exists for <span className="font-semibold text-white">{email}</span>, you&apos;ll receive a
                    reset link shortly.
                  </p>
                  <Link to="/login" className="btn-neon w-full mt-6 inline-flex justify-center">
                    Return to Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white/90">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full pl-12 pr-4 py-4"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              {!submitted && (
                <div className="mt-6 text-center">
                  <Link to="/login" className="text-neon-blue hover:text-neon-purple transition-colors">
                    Back to login
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;