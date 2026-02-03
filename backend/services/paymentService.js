/**
 * Payment Service
 * Handles all payment processing logic for different payment methods
 */

  
const QRCode       = require('qrcode');
const Investment   = require('../models/Investment');
const Transaction  = require('../models/Transaction');
const User         = require('../models/User');
const emailService = require('./emailService');

// ===========================================================================
// NEW — initiatePayment
// Creates a "pending" investment + Transaction, then emails admin.
// The user's frontend will sit on a loading/waiting screen until Socket.io
// delivers the payment details.
// ===========================================================================
exports.initiatePayment = async ({ userId, amount, assetType, plan, timeframeWeeks, paymentMethod }) => {
  // Pre-calculate ROI fields (same formula used everywhere)
  const annualReturnRate = Investment.getReturnRate(plan);
  const expectedROI      = (amount * annualReturnRate * timeframeWeeks) / 52;
  const totalDays        = timeframeWeeks * 7;
  const dailyGrowth      = expectedROI / totalDays;
  const startDate        = new Date();
  const endDate          = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

  // Create the investment record — status & paymentStatus both "pending"
  const investment = await Investment.create({
    user:             userId,
    assetType,
    plan,
    amount,
    timeframeWeeks,
    paymentMethod,
    paymentStatus:    'pending',
    status:           'pending',
    annualReturnRate,
    expectedROI,
    dailyGrowth,
    currentValue:     amount,
    startDate,
    endDate,
  });

  // Create a matching transaction record
  await Transaction.create({
    user:        userId,
    investment:  investment._id,
    type:        'deposit',
    amount,
    status:      'pending',
    paymentMethod,
    description: `Initiated ${paymentMethod} investment — awaiting admin details`,
  });

  // Email the admin so they know to go input details
  const user = await User.findById(userId);
  await emailService.sendAdminPendingInvestmentEmail(investment, user);

  console.log(`✅ Payment initiated — investmentId: ${investment._id}  method: ${paymentMethod}`);
  return investment;
};

// ===========================================================================
// NEW — submitCryptoProof
// Called AFTER the user has actually sent crypto (step 3).
// Updates the existing pending investment with the tx hash and flips
// paymentStatus to "pending_verification" so admin can approve/reject.
// ===========================================================================
exports.submitCryptoProof = async ({ investmentId, userId, currency, transactionHash }) => {
  const investment = await Investment.findById(investmentId);
  if (!investment) throw new Error('Investment not found');
  if (investment.user.toString() !== userId) throw new Error('Unauthorised');

  // Attach the proof
  investment.transactionId       = transactionHash;
  investment.paymentStatus       = 'pending';          // stays pending until admin approves
  investment.status              = 'pending';
  investment.pendingDetails      = { currency, transactionHash, submittedAt: new Date() };
  await investment.save();

  // Update transaction record
  await Transaction.updateOne(
    { investment: investmentId },
    {
      externalTransactionId: transactionHash,
      status: 'pending',
      $set: { 'metadata.currency': currency },
    }
  );

  // Receipt email
  const user = await User.findById(userId);
  await emailService.sendCryptoPaymentSubmittedEmail(user, {
    currency,
    amount:          investment.amount,
    transactionHash,
    assetType:       investment.assetType,
    plan:            investment.plan,
  });

  return { investment, message: 'Crypto proof submitted. Awaiting admin verification.' };
};

// ===========================================================================
// NEW — submitWireProof
// Same pattern as submitCryptoProof but for wire transfers.
// ===========================================================================
exports.submitWireProof = async ({ investmentId, userId, referenceNumber, senderBank, senderName }) => {
  const investment = await Investment.findById(investmentId);
  if (!investment) throw new Error('Investment not found');
  if (investment.user.toString() !== userId) throw new Error('Unauthorised');

  investment.transactionId  = referenceNumber;
  investment.paymentStatus  = 'pending';
  investment.status         = 'pending';
  investment.pendingDetails = { referenceNumber, senderBank, senderName, submittedAt: new Date() };
  await investment.save();

  await Transaction.updateOne(
    { investment: investmentId },
    {
      externalTransactionId: referenceNumber,
      status: 'pending',
      $set: { 'metadata.senderBank': senderBank, 'metadata.senderName': senderName },
    }
  );

  const user = await User.findById(userId);
  await emailService.sendWireTransferSubmittedEmail(user, {
    amount:          investment.amount,
    referenceNumber,
    assetType:       investment.assetType,
    plan:            investment.plan,
    senderBank,
  });

  return { investment, message: 'Wire proof submitted. Awaiting admin verification.' };
};


// ===========================================================================
// Crypto — get wallet details + QR (legacy, still available)
// ===========================================================================
exports.getCryptoPaymentDetails = async (currency, amount) => {
  const addresses = {
    BTC:        process.env.CRYPTO_BTC_ADDRESS,
    ETH:        process.env.CRYPTO_ETH_ADDRESS,
    USDT_ERC20: process.env.CRYPTO_USDT_ERC20_ADDRESS,
    USDT_TRC20: process.env.CRYPTO_USDT_TRC20_ADDRESS,
  };

  const networks = {
    BTC:        'Bitcoin Network',
    ETH:        'Ethereum Network (ERC-20)',
    USDT_ERC20: 'Ethereum Network (ERC-20)',
    USDT_TRC20: 'Tron Network (TRC-20)',
  };

  const address = addresses[currency];
  if (!address) throw new Error('Invalid cryptocurrency');

  try {
    const qrCode = await QRCode.toDataURL(address);
    return {
      currency, address,
      network: networks[currency],
      amount,
      qrCode,
      instructions: [
        `1. Send exactly $${amount} worth of ${currency} to the address below`,
        `2. Network: ${networks[currency]}`,
        `3. After sending, submit your transaction hash`,
        `4. Wait 10–30 minutes for confirmation`,
        `5. Your investment will be activated after verification`,
      ],
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate payment details');
  }
};

// ===========================================================================
// Crypto — legacy submit (creates a brand-new pending investment)
// ===========================================================================
exports.submitCryptoPayment = async (cryptoData) => {
  const { userId, assetType, plan, amount, timeframeWeeks, currency, transactionHash } = cryptoData;

  const annualReturnRate = Investment.getReturnRate(plan);
  const expectedROI      = (amount * annualReturnRate * timeframeWeeks) / 52;
  const totalDays        = timeframeWeeks * 7;
  const dailyGrowth      = expectedROI / totalDays;
  const startDate        = new Date();
  const endDate          = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

  try {
    const investment = await Investment.create({
      user: userId, assetType, plan, amount, timeframeWeeks,
      paymentMethod:   'crypto',
      paymentStatus:   'pending',
      transactionId:   transactionHash,
      startDate, endDate, dailyGrowth,
      currentValue:    amount,
      expectedROI,
      annualReturnRate,
      status:          'pending',
    });

    await Transaction.create({
      user: userId, investment: investment._id,
      type: 'deposit', amount, status: 'pending',
      paymentMethod: 'crypto',
      externalTransactionId: transactionHash,
      description: `Crypto payment (${currency}) for ${assetType} investment`,
      metadata: { currency, network: currency.includes('USDT') ? currency.split('_')[1] : currency },
    });

    const user = await User.findById(userId);
    await emailService.sendCryptoPaymentSubmittedEmail(user, { currency, amount, transactionHash, assetType, plan });

    return { investment, message: 'Crypto payment submitted. Awaiting verification.' };
  } catch (error) {
    console.error('Crypto payment submission error:', error);
    throw new Error('Failed to submit crypto payment');
  }
};

// ===========================================================================
// Wire — get bank details (legacy)
// ===========================================================================
exports.getWireTransferDetails = () => ({
  bankName:      process.env.BANK_NAME,
  accountName:   process.env.BANK_ACCOUNT_NAME,
  accountNumber: process.env.BANK_ACCOUNT_NUMBER,
  routingNumber: process.env.BANK_ROUTING_NUMBER,
  swiftCode:     process.env.BANK_SWIFT_CODE,
  bankAddress:   process.env.BANK_ADDRESS,
  instructions: [
    '1. Initiate a wire transfer from your bank',
    '2. Use the bank details provided below',
    '3. Include your User ID in the transfer reference',
    '4. After transfer, submit the reference number here',
    '5. Processing time: 1–3 business days',
    '6. Your investment will be activated after verification',
  ],
  important: [
    '⚠️ Ensure all details are correct',
    '⚠️ Include your User ID in the reference',
    '⚠️ Wire transfer fees may apply from your bank',
    '⚠️ International transfers may take longer',
  ],
});

// ===========================================================================
// Wire — legacy submit (creates a brand-new pending investment)
// ===========================================================================
exports.submitWireTransfer = async (wireData) => {
  const { userId, assetType, plan, amount, timeframeWeeks, referenceNumber, senderBank, senderName } = wireData;

  const annualReturnRate = Investment.getReturnRate(plan);
  const expectedROI      = (amount * annualReturnRate * timeframeWeeks) / 52;
  const totalDays        = timeframeWeeks * 7;
  const dailyGrowth      = expectedROI / totalDays;
  const startDate        = new Date();
  const endDate          = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

  try {
    const investment = await Investment.create({
      user: userId, assetType, plan, amount, timeframeWeeks,
      paymentMethod:   'wire',
      paymentStatus:   'pending',
      transactionId:   referenceNumber,
      annualReturnRate, expectedROI, dailyGrowth,
      currentValue:    amount,
      startDate, endDate,
      status:          'pending',
    });

    await Transaction.create({
      user: userId, investment: investment._id,
      type: 'deposit', amount, status: 'pending',
      paymentMethod: 'wire',
      externalTransactionId: referenceNumber,
      description: `Wire transfer for ${assetType} investment`,
      metadata: { senderBank, senderName },
    });

    const user = await User.findById(userId);
    await emailService.sendWireTransferSubmittedEmail(user, { amount, referenceNumber, assetType, plan, senderBank });

    return { investment, message: 'Wire transfer submitted. Awaiting verification.' };
  } catch (error) {
    console.error('Wire transfer submission error:', error);
    throw new Error('Failed to submit wire transfer');
  }
};

// ===========================================================================
// Process successful payment (called after PayPal capture)
// ===========================================================================
exports.processSuccessfulPayment = async (paymentData) => {
  const { userId, assetType, plan, amount, timeframeWeeks, paymentMethod, transactionId } = paymentData;

  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const annualReturnRate = Investment.getReturnRate(plan);
    const expectedROI      = (amount * annualReturnRate * timeframeWeeks) / 52;
    const totalDays        = timeframeWeeks * 7;
    const dailyGrowth      = expectedROI / totalDays;
    const startDate        = new Date();
    const endDate          = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);

    const investment = await Investment.create({
      user: userId, assetType, plan, amount, timeframeWeeks,
      paymentMethod, paymentStatus: 'completed', transactionId,
      autoCompound: user.autoCompound,
      annualReturnRate, expectedROI, dailyGrowth,
      currentValue: amount,
      startDate, endDate,
      status: 'active',
    });

    user.totalInvested  += amount;
    user.currentBalance += amount;
    await user.save();

    await Transaction.create({
      user: userId, investment: investment._id,
      type: 'deposit', amount, status: 'completed',
      paymentMethod,
      externalTransactionId: transactionId,
      description: `Investment in ${assetType} - ${plan} plan`,
    });

    await emailService.sendInvestmentConfirmationEmail(user, investment);

    console.log(`✅ Investment created successfully: ${investment._id}`);
    return investment;
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    throw error;
  }
};