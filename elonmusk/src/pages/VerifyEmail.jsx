import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaEnvelope, FaRocket } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';
import authBg from '../assets/authbg.jpg';
import logo from '../assets/brandmark.svg';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message || 'Your email has been verified.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await authAPI.resendVerification({ email: email.trim() });
      toast.success(response.data.message || 'Verification email sent.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to resend verification email');
    } finally {
      setResending(false);
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
                Secure your
                <span className="gradient-text block">mission access</span>
              </h1>
              <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-lg">
                Verify your email to unlock your investment dashboard and launch your next mission.
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

              {status === 'loading' && (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="loading"></div>
                  <p className="text-white/80">Verifying your email...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <FaCheckCircle className="text-neon-blue text-5xl mx-auto mb-4" />
                  <h2 className="text-3xl font-display font-bold mb-2">Email Verified!</h2>
                  <p className="text-white/70 mb-6">{message}</p>
                  <Link to="/login" className="btn-neon w-full inline-flex justify-center">
                    Continue to Login
                  </Link>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-display font-bold mb-2">Verification Failed</h2>
                    <p className="text-white/70">{message}</p>
                  </div>

                  <form onSubmit={handleResend} className="space-y-4">
                    <label className="block text-sm font-semibold text-white/90">Resend verification email</label>
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
                    <button
                      type="submit"
                      className="w-full btn-primary"
                      disabled={resending}
                    >
                      {resending ? 'Sending...' : 'Resend Verification'}
                    </button>
                  </form>

                  <div className="text-center">
                    <Link to="/login" className="text-neon-blue hover:text-neon-purple transition-colors">
                      Back to login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;