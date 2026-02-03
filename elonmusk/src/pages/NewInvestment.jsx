import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCar, 
  FaRocket, 
  FaBrain, 
  FaNetworkWired,
  FaCheck,
  FaCreditCard,
  FaBitcoin,
  FaUniversity
} from 'react-icons/fa';
import { SiPaypal } from 'react-icons/si';
import { investmentAPI, paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';

const NewInvestment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    assetType: '',
    plan: '',
    amount: '',
    timeframeWeeks: '',
    paymentMethod: ''
  });

  // Companies
  const companies = [
    {
      value: 'Tesla',
      name: 'Tesla',
      icon: FaCar,
      gradient: 'from-red-500 to-orange-600',
      description: 'Accelerating sustainable energy'
    },
    {
      value: 'SpaceX',
      name: 'SpaceX',
      icon: FaRocket,
      gradient: 'from-blue-600 to-purple-700',
      description: 'Making life multiplanetary'
    },
    {
      value: 'Deepmind Technology',
      name: 'Deepmind Technology',
      icon: FaBrain,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Advancing artificial intelligence'
    },
    {
      value: 'The Boring Company',
      name: 'The Boring Company',
      icon: FaNetworkWired,
      gradient: 'from-gray-600 to-cyan-600',
      description: 'Revolutionizing transportation'
    },
    {
      value: 'Neuralink',
      name: 'Neuralink',
      icon: FaBrain,
      gradient: 'from-pink-500 to-orange-500',
      description: 'Connecting minds to machines'
    }
  ];

  // Plans
  const plans = [
    { 
      value: 'starter', 
      name: 'Starter', 
      rate: '8-12%',
      features: ['Perfect for beginners', 'Low risk', 'Stable returns'],
      color: 'from-gray-400 to-gray-600'
    },
    { 
      value: 'silver', 
      name: 'Silver', 
      rate: '15-20%',
      features: ['Growing portfolio', 'Medium risk', 'Balanced growth'],
      color: 'from-gray-300 to-gray-500'
    },
    { 
      value: 'gold', 
      name: 'Gold', 
      rate: '25-35%',
      features: ['High performance', 'Higher returns', 'Premium access'],
      color: 'from-yellow-400 to-yellow-600',
      popular: true
    },
    { 
      value: 'platinum', 
      name: 'Platinum', 
      rate: '40-50%',
      features: ['Maximum returns', 'Exclusive benefits', 'VIP treatment'],
      color: 'from-purple-400 to-pink-600'
    }
  ];

  // Payment Methods
  const paymentMethods = [
    {
      value: 'stripe',
      name: 'Credit/Debit Card',
      icon: FaCreditCard,
      description: 'Instant payment via Stripe',
      instant: true
    },
    {
      value: 'paypal',
      name: 'PayPal',
      icon: SiPaypal,
      description: 'Pay with your PayPal account',
      instant: true
    },
    {
      value: 'crypto',
      name: 'Cryptocurrency',
      icon: FaBitcoin,
      description: 'BTC, ETH, USDT (Pending verification)',
      instant: false
    },
    {
      value: 'wire',
      name: 'Wire Transfer',
      icon: FaUniversity,
      description: 'Bank transfer (1-3 business days)',
      instant: false
    }
  ];

  const calculatePreview = async () => {
    if (!formData.plan || !formData.amount || !formData.timeframeWeeks) {
      return;
    }

    try {
      const response = await investmentAPI.calculate({
        plan: formData.plan,
        amount: parseFloat(formData.amount),
        timeframeWeeks: parseInt(formData.timeframeWeeks)
      });
      setPreview(response.data.data);
    } catch (error) {
      toast.error('Error calculating preview');
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.assetType) {
      toast.error('Please select a company');
      return;
    }
    if (step === 2 && !formData.plan) {
      toast.error('Please select a plan');
      return;
    }
    if (step === 3) {
      if (!formData.amount || parseFloat(formData.amount) < 10) {
        toast.error('Minimum investment is $10');
        return;
      }
      if (!formData.timeframeWeeks || parseInt(formData.timeframeWeeks) < 1) {
        toast.error('Minimum timeframe is 1 week');
        return;
      }
      calculatePreview();
    }
    if (step === 4 && !formData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create payment based on method
      if (formData.paymentMethod === 'stripe') {
        const response = await paymentAPI.createStripeIntent({
          amount: parseFloat(formData.amount),
          assetType: formData.assetType,
          plan: formData.plan,
          timeframeWeeks: parseInt(formData.timeframeWeeks)
        });
        
        // In real app, redirect to Stripe checkout
        toast.success('Redirecting to payment...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (formData.paymentMethod === 'paypal') {
        const response = await paymentAPI.createPayPalOrder({
          amount: parseFloat(formData.amount),
          assetType: formData.assetType,
          plan: formData.plan,
          timeframeWeeks: parseInt(formData.timeframeWeeks)
        });
        
        toast.success('Redirecting to PayPal...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (formData.paymentMethod === 'crypto') {
        navigate('/payment/crypto', { state: formData });
      } else if (formData.paymentMethod === 'wire') {
        navigate('/payment/wire', { state: formData });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-space py-6 sm:py-12">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">
            <span className="gradient-text">Create New Investment</span>
          </h1>
          <p className="text-white/70">Invest in revolutionary technologies shaping the future</p>
        </div>

        {/* Progress Steps */}
        <div className="glass-card mb-8 p-4 sm:p-6">
  <div className="flex items-center justify-between overflow-x-auto gap-6">
            {[
              { num: 1, label: 'Company' },
              { num: 2, label: 'Plan' },
              { num: 3, label: 'Amount' },
              { num: 4, label: 'Payment' },
              { num: 5, label: 'Confirm' }
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                      : 'glass text-white/50'
                  }`}>
                    {step > s.num ? <FaCheck /> : s.num}
                  </div>
                  <span className="text-[10px] sm:text-xs text-white/60 mt-2 whitespace-nowrap">
                  {s.label}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step > s.num ? 'bg-gradient-to-r from-neon-blue to-neon-purple' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-4 sm:p-8"
          >
            {/* Step 1: Choose Company */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Choose Company</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {companies.map((company) => (
                    <motion.button
                      key={company.value}
                      onClick={() => setFormData({...formData, assetType: company.value})}
                      className={`glass-dark p-6 rounded-xl text-left hover:scale-105 transition-all ${
                        formData.assetType === company.value ? 'ring-2 ring-neon-blue' : ''
                      }`}
                      whileHover={{ y: -5 }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${company.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                        <company.icon className="text-3xl text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{company.name}</h3>
                      <p className="text-white/60 text-sm">{company.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Plan */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Select Investment Plan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {plans.map((plan) => (
                    <motion.button
                      key={plan.value}
                      onClick={() => setFormData({...formData, plan: plan.value})}
                      className={`glass-dark p-6 rounded-xl text-left hover:scale-105 transition-all relative ${
                        formData.plan === plan.value ? 'ring-2 ring-neon-purple' : ''
                      }`}
                      whileHover={{ y: -5 }}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 right-4 bg-gradient-to-r from-neon-purple to-neon-pink px-3 py-1 rounded-full text-xs font-bold">
                          POPULAR
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-3xl font-display font-black mb-4">
                        <span className="gradient-text">{plan.rate}</span>
                      </div>
                      <p className="text-white/50 text-xs mb-4">Annual Returns</p>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-neon-blue mr-2">✓</span>
                            <span className="text-white/70">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Enter Amount & Timeframe */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Investment Details</h2>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Investment Amount (USD)
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      onBlur={calculatePreview}
                      className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg"
                      placeholder="Minimum $10"
                    />
                    <p className="text-white/50 text-sm mt-2">Minimum investment: $10 USD</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Investment Duration (Weeks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.timeframeWeeks}
                      onChange={(e) => setFormData({...formData, timeframeWeeks: e.target.value})}
                      onBlur={calculatePreview}
                      className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg"
                      placeholder="Minimum 1 week"
                    />
                    <p className="text-white/50 text-sm mt-2">Minimum duration: 1 week</p>
                  </div>

                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-dark p-6 rounded-xl border border-neon-blue/30"
                    >
                      <h3 className="font-bold mb-4 text-lg">Investment Preview</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm">Investment Amount</p>
                          <p className="text-2xl font-bold">${preview.amount}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Expected ROI</p>
                          <p className="text-2xl font-bold text-green-400">${preview.expectedROI}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Total Return</p>
                          <p className="text-2xl font-bold">${preview.totalReturn}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Daily Growth</p>
                          <p className="text-2xl font-bold">${preview.dailyGrowth}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-white/60 text-sm">End Date</p>
                        <p className="font-semibold">{new Date(preview.endDate).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Choose Payment Method */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Select Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.value}
                      onClick={() => setFormData({...formData, paymentMethod: method.value})}
                      className={`glass-dark p-6 rounded-xl text-left hover:scale-105 transition-all ${
                        formData.paymentMethod === method.value ? 'ring-2 ring-neon-blue' : ''
                      }`}
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                          <method.icon className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{method.name}</h3>
                          {method.instant && (
                            <span className="text-xs text-green-400">✓ Instant</span>
                          )}
                        </div>
                      </div>
                      <p className="text-white/60 text-sm">{method.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Confirm Investment</h2>
                <div className="space-y-6 max-w-2xl">
                  <div className="glass-dark p-6 rounded-xl">
                    <h3 className="font-bold mb-4">Investment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-white/60">Company</span>
                        <span className="font-semibold">{formData.assetType}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-white/60">Plan</span>
                        <span className="font-semibold capitalize">{formData.plan}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-white/60">Amount</span>
                        <span className="font-semibold">${formData.amount}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-white/60">Duration</span>
                        <span className="font-semibold">{formData.timeframeWeeks} weeks</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-white/60">Payment Method</span>
                        <span className="font-semibold capitalize">{formData.paymentMethod}</span>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-white/60">Expected Returns</span>
                          <span className="font-bold text-green-400 text-lg">${preview?.expectedROI}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-dark p-4 rounded-xl border border-yellow-500/30">
                    <p className="text-sm text-white/70">
                      <strong className="text-yellow-400">Note:</strong> By proceeding, you agree to our terms and conditions. 
                      Investments are subject to market risks. Minimum withdrawal period is 1 week from start date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-between mt-8 pt-6 border-t border-white/10">
              {step > 1 ? (
                <button onClick={handleBack} className="btn-secondary inline-flex items-center">
                  <FaArrowLeft className="mr-2" />
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 5 ? (
                <button onClick={handleNext} className="btn-primary inline-flex items-center">
                  Next
                  <FaArrowRight className="ml-2" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="btn-primary inline-flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="loading mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <FaArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewInvestment;
