import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaBitcoin,
  FaClipboard,
  FaClock,
  FaSyncAlt,
  FaUniversity
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { investmentAPI, paymentAPI } from '../utils/api';

const PaymentPending = () => {
  const { investmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(location.state?.investment || null);
  const [adminDetails, setAdminDetails] = useState(location.state?.adminDetails || null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cryptoForm, setCryptoForm] = useState({ transactionHash: '' });
  const [wireForm, setWireForm] = useState({
    referenceNumber: '',
    senderBank: '',
    senderName: ''
  });

  const summary = location.state?.summary;

  const fetchInvestment = useCallback(
    async (showSpinner = false) => {
      if (!investmentId) return;
      if (showSpinner) {
        setRefreshing(true);
      }

      try {
        const response = await investmentAPI.getOne(investmentId);
        const data = response.data.data;
        setInvestment(data);
        setAdminDetails(data.adminDetails || null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load investment details');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [investmentId]
  );

  useEffect(() => {
    fetchInvestment();
    const interval = setInterval(() => {
      fetchInvestment();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchInvestment]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !investmentId) {
      return undefined;
    }

    const socketClient = window.io;
    if (!socketClient) {
      return undefined;
    }

    const apiBaseUrl = 'https://elonfather.onrender.com/api';
    const socketBaseUrl = apiBaseUrl;
    const socketOptions = {
      auth: { token },
      transports: ['websocket', 'polling']
    };
    const socket = socketBaseUrl ? socketClient(socketBaseUrl, socketOptions) : socketClient(socketOptions);

    socket.on('payment_details_ready', (payload) => {
      if (payload?.investmentId !== investmentId) {
        return;
      }

      setAdminDetails(payload);
      toast.success('Payment details received from admin.');
    });

    socket.on('investment_update', (payload) => {
      if (payload?.investmentId !== investmentId) {
        return;
      }

      toast.info(payload.message || 'Investment status updated.');
    });

    return () => {
      socket.disconnect();
    };
  }, [investmentId]);

  const handleCopy = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Unable to copy');
    }
  };

  const cryptoCurrency = useMemo(() => {
    if (!adminDetails) return '';
    return adminDetails.cryptoCurrency || adminDetails.currency || '';
  }, [adminDetails]);

  const handleCryptoSubmit = async (event) => {
    event.preventDefault();

    if (!cryptoForm.transactionHash.trim()) {
      toast.error('Please enter your transaction hash');
      return;
    }

    if (!cryptoCurrency) {
      toast.error('Missing crypto currency details');
      return;
    }

    setSubmitting(true);
    try {
      await paymentAPI.submitCryptoPayment({
        investmentId,
        currency: cryptoCurrency,
        transactionHash: cryptoForm.transactionHash.trim()
      });
      toast.success('Crypto proof submitted. Awaiting verification.');
      navigate('/investments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit crypto proof');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWireSubmit = async (event) => {
    event.preventDefault();

    if (!wireForm.referenceNumber || !wireForm.senderBank || !wireForm.senderName) {
      toast.error('Please provide all wire transfer details');
      return;
    }

    setSubmitting(true);
    try {
      await paymentAPI.submitWireTransfer({
        investmentId,
        referenceNumber: wireForm.referenceNumber.trim(),
        senderBank: wireForm.senderBank.trim(),
        senderName: wireForm.senderName.trim()
      });
      toast.success('Wire proof submitted. Awaiting verification.');
      navigate('/investments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit wire proof');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="loading"></div>
      </div>
    );
  }

  const paymentMethod = investment?.paymentMethod || summary?.paymentMethod;
  const showWaiting = !adminDetails;

  return (
    <div className="min-h-screen bg-gradient-space py-10">
      <div className="fixed inset-0 z-0">
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link to="/dashboard" className="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Awaiting Payment Details</h1>
              <p className="text-white/70">
                Investment ID: <span className="text-white font-semibold">{investmentId}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchInvestment(true)}
              className="btn-secondary inline-flex items-center justify-center"
              disabled={refreshing}
            >
              {refreshing ? (
                <span className="flex items-center gap-2">
                  <span className="loading w-5 h-5 border-2"></span>
                  Refreshing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaSyncAlt />
                  Refresh
                </span>
              )}
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 mt-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card">
            <h2 className="text-2xl font-display font-semibold mb-4">Investment Summary</h2>
            <div className="space-y-3 text-white/80">
              <div className="flex justify-between">
                <span>Asset</span>
                <span className="font-semibold text-white">{investment?.assetType || summary?.assetType}</span>
              </div>
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-semibold text-white capitalize">{investment?.plan || summary?.plan}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount</span>
                <span className="font-semibold text-white">${investment?.amount || summary?.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeframe</span>
                <span className="font-semibold text-white">{investment?.timeframeWeeks || summary?.timeframeWeeks} weeks</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-semibold text-white capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold text-neon-blue capitalize">{investment?.status || 'pending'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <FaClock className="text-neon-blue text-xl" />
              <h2 className="text-2xl font-display font-semibold">Next Steps</h2>
            </div>
            <ul className="space-y-3 text-white/70">
              <li>1. Our team will send payment details for your selected method.</li>
              <li>2. Submit your payment proof once completed.</li>
              <li>3. We will verify and activate your investment.</li>
            </ul>
            {showWaiting && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/80">
                  We&apos;re preparing your payment details. This usually takes a few minutes. You can safely refresh or
                  return later.
                </p>
              </div>
            )}
          </div>
        </div>

        {showWaiting ? null : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card mt-8"
          >
            <div className="flex items-center gap-3 mb-6">
              {paymentMethod === 'wire' ? (
                <FaUniversity className="text-neon-blue text-2xl" />
              ) : (
                <FaBitcoin className="text-neon-blue text-2xl" />
              )}
              <div>
                <h2 className="text-2xl font-display font-semibold">Payment Details</h2>
                <p className="text-white/70">Use the details below to complete your transfer.</p>
              </div>
            </div>

            {paymentMethod === 'crypto' ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60">Wallet Address</p>
                    <p className="text-white font-semibold break-all mt-1">{adminDetails?.cryptoAddress}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(adminDetails?.cryptoAddress)}
                      className="text-neon-blue text-sm mt-2 inline-flex items-center gap-2"
                    >
                      <FaClipboard /> Copy address
                    </button>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60">Network</p>
                    <p className="text-white font-semibold mt-1">{adminDetails?.cryptoNetwork}</p>
                    <p className="text-sm text-white/60 mt-3">Currency</p>
                    <p className="text-white font-semibold mt-1">{cryptoCurrency}</p>
                  </div>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-white/60">Crypto Amount</p>
                  <p className="text-white font-semibold mt-1">{adminDetails?.cryptoAmount}</p>
                  <p className="text-sm text-white/60 mt-3">USD Amount</p>
                  <p className="text-white font-semibold mt-1">${adminDetails?.usdAmount}</p>
                </div>

                {adminDetails?.instructions?.length ? (
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60 mb-2">Instructions</p>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      {adminDetails.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <form onSubmit={handleCryptoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white/90">Transaction Hash</label>
                    <input
                      type="text"
                      value={cryptoForm.transactionHash}
                      onChange={(event) => setCryptoForm({ transactionHash: event.target.value })}
                      placeholder="Enter your crypto transaction hash"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Crypto Proof'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60">Bank Name</p>
                    <p className="text-white font-semibold mt-1">{adminDetails?.bankName}</p>
                    <p className="text-sm text-white/60 mt-3">Account Name</p>
                    <p className="text-white font-semibold mt-1">{adminDetails?.accountName}</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60">Account Number</p>
                    <p className="text-white font-semibold mt-1">{adminDetails?.accountNumber}</p>
                    <p className="text-sm text-white/60 mt-3">Routing Number</p>
                    <p className="text-white font-semibold mt-1">{adminDetails?.routingNumber}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60">SWIFT Code</p>
                    <p className="text-white font-semibold mt-1">{adminDetails?.swiftCode}</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60">Bank Address</p>
                    <p className="text-white font-semibold mt-1">{adminDetails?.bankAddress}</p>
                  </div>
                </div>
                {adminDetails?.referenceNote ? (
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60">Reference Note</p>
                    <p className="text-white font-semibold mt-1">{adminDetails.referenceNote}</p>
                  </div>
                ) : null}

                {adminDetails?.instructions?.length ? (
                  <div className="glass p-4 rounded-xl">
                    <p className="text-sm text-white/60 mb-2">Instructions</p>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      {adminDetails.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <form onSubmit={handleWireSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white/90">Reference Number</label>
                    <input
                      type="text"
                      value={wireForm.referenceNumber}
                      onChange={(event) => setWireForm({ ...wireForm, referenceNumber: event.target.value })}
                      placeholder="Enter the reference number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white/90">Sender Bank</label>
                    <input
                      type="text"
                      value={wireForm.senderBank}
                      onChange={(event) => setWireForm({ ...wireForm, senderBank: event.target.value })}
                      placeholder="Bank you sent the transfer from"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white/90">Sender Name</label>
                    <input
                      type="text"
                      value={wireForm.senderName}
                      onChange={(event) => setWireForm({ ...wireForm, senderName: event.target.value })}
                      placeholder="Name on the bank account"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Wire Proof'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentPending;