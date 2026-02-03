import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCheckCircle,
  FaClipboardList,
  FaCoins,
  FaExclamationTriangle,
  FaSyncAlt,
  FaUsers
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingInvestments, setPendingInvestments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState(null);
  const [formValues, setFormValues] = useState({
    cryptoAddress: '',
    cryptoNetwork: '',
    cryptoCurrency: '',
    cryptoAmount: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    bankAddress: '',
    referenceNote: '',
    instructions: '',
    ibanNumber:''
  });
  const [rejectionNotes, setRejectionNotes] = useState({});

  const selectedInvestment = useMemo(
    () => pendingInvestments.find((inv) => inv._id === selectedInvestmentId),
    [pendingInvestments, selectedInvestmentId]
  );

  const loadDashboard = async (showSpinner = false) => {
    if (showSpinner) {
      setRefreshing(true);
    }
    try {
      const [statsResponse, pendingResponse, usersResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingInvestments(),
        adminAPI.getUsers()
      ]);
      setStats(statsResponse.data.data);
      setPendingInvestments(pendingResponse.data.data || []);
      setUsers(usersResponse.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSelectInvestment = (investment) => {
    setSelectedInvestmentId(investment._id);
    setFormValues({
      cryptoAddress: investment.adminDetails?.cryptoAddress || '',
      cryptoNetwork: investment.adminDetails?.cryptoNetwork || '',
      cryptoCurrency: investment.adminDetails?.cryptoCurrency || '',
      cryptoAmount: investment.adminDetails?.cryptoAmount || '',
      bankName: investment.adminDetails?.bankName || '',
      accountName: investment.adminDetails?.accountName || '',
      accountNumber: investment.adminDetails?.accountNumber || '',
      routingNumber: investment.adminDetails?.routingNumber || '',
      swiftCode: investment.adminDetails?.swiftCode || '',
      bankAddress: investment.adminDetails?.bankAddress || '',
      referenceNote: investment.adminDetails?.referenceNote || '',
      instructions: investment.adminDetails?.instructions?.join('\n') || ''
    });
  };

  const handleSendDetails = async () => {
    if (!selectedInvestment) {
      toast.error('Select an investment to send details');
      return;
    }

    const instructions = formValues.instructions
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      paymentMethod: selectedInvestment.paymentMethod,
      instructions
    };

    if (selectedInvestment.paymentMethod === 'crypto') {
      if (!formValues.cryptoAddress || !formValues.cryptoNetwork || !formValues.cryptoCurrency || !formValues.cryptoAmount) {
        toast.error('Provide crypto address, network, currency, and amount');
        return;
      }
      Object.assign(payload, {
        cryptoAddress: formValues.cryptoAddress,
        cryptoNetwork: formValues.cryptoNetwork,
        cryptoCurrency: formValues.cryptoCurrency,
        cryptoAmount: formValues.cryptoAmount
      });
    } else {
      if (!formValues.bankName || !formValues.accountName || !formValues.accountNumber) {
        toast.error('Provide bank name, account name, and account number');
        return;
      }
      Object.assign(payload, {
        bankName: formValues.bankName,
        accountName: formValues.accountName,
        accountNumber: formValues.accountNumber,
        routingNumber: formValues.routingNumber,
        swiftCode: formValues.swiftCode,
        bankAddress: formValues.bankAddress,
        referenceNote: formValues.referenceNote
      });
    }

    try {
      await adminAPI.sendPaymentDetails(selectedInvestment._id, payload);
      toast.success('Payment details sent successfully');
      await loadDashboard(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send payment details');
    }
  };

  const handleApprove = async (investment) => {
    try {
      if (investment.paymentMethod === 'crypto') {
        await adminAPI.approveCryptoPayment(investment._id);
      } else {
        await adminAPI.approveWirePayment(investment._id);
      }
      toast.success('Payment approved');
      await loadDashboard(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async (investment) => {
    const reason = rejectionNotes[investment._id] || '';
    try {
      if (investment.paymentMethod === 'crypto') {
        await adminAPI.rejectCryptoPayment(investment._id, { reason });
      } else {
        await adminAPI.rejectWirePayment(investment._id, { reason });
      }
      toast.success('Payment rejected');
      await loadDashboard(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-space">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space py-8">
      <div className="fixed inset-0 z-0">
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Admin Mission Control</h1>
            <p className="text-white/70">Monitor platform activity and send payment details.</p>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="btn-secondary inline-flex items-center gap-2"
            disabled={refreshing}
          >
            {refreshing ? <span className="loading w-5 h-5 border-2"></span> : <FaSyncAlt />}
            Refresh Data
          </button>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard icon={<FaUsers />} label="Total Users" value={stats?.totalUsers || 0} />
          <StatCard icon={<FaCheckCircle />} label="Verified Users" value={stats?.verifiedUsers || 0} />
          <StatCard icon={<FaClipboardList />} label="Pending Investments" value={stats?.pendingInvestments || 0} />
          <StatCard icon={<FaCoins />} label="Total Invested" value={`$${stats?.totalInvested || 0}`} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-semibold">Pending Investments</h2>
              <span className="text-white/60 text-sm">{pendingInvestments.length} items</span>
            </div>
            <div className="space-y-4">
              {pendingInvestments.length === 0 && (
                <p className="text-white/60">No pending investments right now.</p>
              )}
              {pendingInvestments.map((investment) => (
                <div
                  key={investment._id}
                  className={`rounded-xl border p-4 transition ${
                    selectedInvestmentId === investment._id
                      ? 'border-neon-blue bg-white/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {investment.user?.firstName} {investment.user?.lastName}
                      </p>
                      <p className="text-sm text-white/60">{investment.user?.email}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-semibold text-white">${investment.amount}</p>
                      <p className="text-sm text-white/60 capitalize">{investment.paymentMethod}</p>
                      <p className="text-sm text-white/60">Status: {investment.status}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => handleSelectInvestment(investment)}
                      className="btn-neon"
                    >
                      {selectedInvestmentId === investment._id ? 'Selected' : 'Send Details'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(investment)}
                      className="btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(investment)}
                      className="btn-secondary text-red-400 border border-red-500/30"
                    >
                      Reject
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-white/60 mb-2">Rejection reason (optional)</label>
                    <textarea rows="3" className="w-full"
                      value={rejectionNotes[investment._id] || ''}
                      onChange={(event) =>
                        setRejectionNotes((prev) => ({ ...prev, [investment._id]: event.target.value }))
                      }
                      placeholder="Provide a short reason for rejection"
                    />
                  </div>

                  {investment.pendingDetails && (
                    <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-sm text-white/60 mb-2">User submitted proof</p>
                      {investment.pendingDetails.transactionHash && (
                        <p className="text-white break-all">Tx Hash: {investment.pendingDetails.transactionHash}</p>
                      )}
                      {investment.pendingDetails.referenceNumber && (
                        <p className="text-white">Reference: {investment.pendingDetails.referenceNumber}</p>
                      )}
                      {investment.pendingDetails.senderBank && (
                        <p className="text-white">Bank: {investment.pendingDetails.senderBank}</p>
                      )}
                      {investment.pendingDetails.senderName && (
                        <p className="text-white">Sender: {investment.pendingDetails.senderName}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h2 className="text-2xl font-display font-semibold mb-4">Payment Details Composer</h2>
            {selectedInvestment ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 p-4 bg-white/5">
                  <p className="text-sm text-white/60">Investment</p>
                  <p className="text-white font-semibold">{selectedInvestment._id}</p>
                  <p className="text-white/70 text-sm capitalize">
                    {selectedInvestment.assetType} • {selectedInvestment.plan} • {selectedInvestment.paymentMethod}
                  </p>
                </div>

                {selectedInvestment.paymentMethod === 'crypto' ? (
                  <div className="space-y-3">
                    <InputField
                      label="Wallet Address"
                      value={formValues.cryptoAddress}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, cryptoAddress: value }))}
                    />
                    <InputField
                      label="Network"
                      value={formValues.cryptoNetwork}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, cryptoNetwork: value }))}
                    />
                    <InputField
                      label="Currency"
                      value={formValues.cryptoCurrency}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, cryptoCurrency: value }))}
                    />
                    <InputField
                      label="Crypto Amount"
                      value={formValues.cryptoAmount}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, cryptoAmount: value }))}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <InputField
                      label="Bank Name"
                      value={formValues.bankName}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, bankName: value }))}
                    />
                    <InputField
                      label="Account Name"
                      value={formValues.accountName}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, accountName: value }))}
                    />
                    <InputField
                      label="Account Number"
                      value={formValues.accountNumber}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, accountNumber: value }))}
                    />
                    <InputField
                      label="Routing Number"
                      value={formValues.routingNumber}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, routingNumber: value }))}
                    />
                    <InputField
                      label="SWIFT Code"
                      value={formValues.swiftCode}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, swiftCode: value }))}
                    />
                    <InputField
                      label="Iban Number"
                      value={formValues.ibanNumber}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, ibanNumber: value }))}
                    />
                    <InputField
                      label="Bank Address"
                      value={formValues.bankAddress}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, bankAddress: value }))}
                    />
                    <InputField
                      label="Reference Note"
                      value={formValues.referenceNote}
                      onChange={(value) => setFormValues((prev) => ({ ...prev, referenceNote: value }))}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-white/70 mb-2">Instructions (one per line)</label>
                  <textarea className="w-full px-3 py-2 rounded-lg"
                    rows="4"
                    value={formValues.instructions}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, instructions: event.target.value }))}
                    placeholder="Add payment instructions"
                  />
                </div>

                <button type="button" onClick={handleSendDetails} className="btn-primary w-full">
                  Send Payment Details
                </button>
              </div>
            ) : (
              <div className="text-white/60 space-y-3">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-neon-blue" />
                  <span>Select a pending investment to compose payment details.</span>
                </div>
                <p className="text-sm">Tip: click "Send Details" on a pending investment to load it here.</p>
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card mt-8"
        >
          <h2 className="text-2xl font-display font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {users.slice(0, 6).map((user) => (
              <div key={user._id} className="flex items-center justify-between text-white/80">
                <div>
                  <p className="font-semibold text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-white/60">{user.email}</p>
                </div>
                <span className={`text-sm ${user.isVerified ? 'text-neon-blue' : 'text-white/50'}`}>
                  {user.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="glass-card flex items-center gap-3">
    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-neon-blue text-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm text-white/60">{label}</p>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm text-white/70 mb-2">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
    />
  </div>
);


export default AdminDashboard;