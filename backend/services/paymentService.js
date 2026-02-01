/**
 * Payment Service
 * Handles all payment processing logic for different payment methods
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const emailService = require('./emailService');

/**
 * Create Stripe Payment Intent
 * @param {Object} paymentData - Payment details
 * @returns {Object} - Payment intent
 */
exports.createStripePayment = async (paymentData) => {
  const { amount, userId, assetType, plan, timeframeWeeks } = paymentData;

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      metadata: {
        userId,
        assetType,
        plan,
        timeframeWeeks: timeframeWeeks.toString(),
        type: 'investment',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment creation error:', error);
    throw new Error('Failed to create payment intent');
  }
};

/**
 * Create PayPal Order
 * @param {Object} paymentData - Payment details
 * @returns {Object} - PayPal order
 */
exports.createPayPalOrder = async (paymentData) => {
  const { amount, userId, assetType, plan, timeframeWeeks } = paymentData;

  // PayPal API configuration
  const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  try {
    // Create order
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: `InvestHub - ${assetType} Investment (${plan})`,
            custom_id: JSON.stringify({
              userId,
              assetType,
              plan,
              timeframeWeeks,
            }),
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
          brand_name: 'InvestHub',
          user_action: 'PAY_NOW',
        },
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.message || 'PayPal order creation failed');
    }

    return {
      orderId: order.id,
      approvalUrl: order.links.find(link => link.rel === 'approve')?.href,
    };
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw new Error('Failed to create PayPal order');
  }
};

/**
 * Capture PayPal Payment
 * @param {String} orderId - PayPal order ID
 * @returns {Object} - Capture result
 */
exports.capturePayPalPayment = async (orderId) => {
  const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    const capture = await response.json();

    if (!response.ok) {
      throw new Error(capture.message || 'PayPal capture failed');
    }

    return capture;
  } catch (error) {
    console.error('PayPal capture error:', error);
    throw new Error('Failed to capture PayPal payment');
  }
};

/**
 * Get cryptocurrency payment details with QR codes
 * @param {String} currency - BTC, ETH, USDT_ERC20, USDT_TRC20
 * @param {Number} amount - Amount in USD
 * @returns {Object} - Payment details with QR code
 */
exports.getCryptoPaymentDetails = async (currency, amount) => {
  const addresses = {
    BTC: process.env.CRYPTO_BTC_ADDRESS,
    ETH: process.env.CRYPTO_ETH_ADDRESS,
    USDT_ERC20: process.env.CRYPTO_USDT_ERC20_ADDRESS,
    USDT_TRC20: process.env.CRYPTO_USDT_TRC20_ADDRESS,
  };

  const networks = {
    BTC: 'Bitcoin Network',
    ETH: 'Ethereum Network (ERC-20)',
    USDT_ERC20: 'Ethereum Network (ERC-20)',
    USDT_TRC20: 'Tron Network (TRC-20)',
  };

  const address = addresses[currency];

  if (!address) {
    throw new Error('Invalid cryptocurrency');
  }

  try {
    // Generate QR code
    const qrCode = await QRCode.toDataURL(address);

    return {
      currency,
      address,
      network: networks[currency],
      amount,
      qrCode,
      instructions: [
        `1. Send exactly $${amount} worth of ${currency} to the address below`,
        `2. Network: ${networks[currency]}`,
        `3. After sending, submit your transaction hash`,
        `4. Wait 10-30 minutes for confirmation`,
        `5. Your investment will be activated after verification`,
      ],
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate payment details');
  }
};

/**
 * Submit cryptocurrency payment
 * @param {Object} cryptoData - Crypto payment data
 * @returns {Object} - Pending investment
 */
exports.submitCryptoPayment = async (cryptoData) => {
  const {
    userId,
    assetType,
    plan,
    amount,
    timeframeWeeks,
    currency,
    transactionHash,
  } = cryptoData;

  const annualReturnRate = Investment.getReturnRate(cryptoData.plan);
    const expectedROI = (cryptoData.amount * annualReturnRate *cryptoData.timeframeWeeks) / 52;
    const totalDays = cryptoData.timeframeWeeks * 7;
    const dailyGrowth = expectedROI / totalDays;
    const currentValue = amount;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (timeframeWeeks * 7 * 24 * 60 * 60 * 1000));

  try {
    // Create pending investment
    const investment = await Investment.create({
      user: userId,
      assetType,
      plan,
      amount,
      timeframeWeeks,
      paymentMethod: 'crypto',
      paymentStatus: 'pending',
      transactionId: transactionHash,
      startDate,
      endDate,
      dailyGrowth,
      currentValue,
      expectedROI,
      status: 'pending',
    });

    // Create pending transaction
    await Transaction.create({
      user: userId,
      investment: investment._id,
      type: 'deposit',
      amount,
      status: 'pending',
      paymentMethod: 'crypto',
      externalTransactionId: transactionHash,
      description: `Crypto payment (${currency}) for ${assetType} investment`,
      metadata: {
        currency,
        network: currency.includes('USDT') ? currency.split('_')[1] : currency,
      },
    });

    // Send confirmation email
    const user = await User.findById(userId);
    await emailService.sendCryptoPaymentSubmittedEmail(user, {
      currency,
      amount,
      transactionHash,
      assetType,
      plan,
    });

    return {
      investment,
      message: 'Crypto payment submitted. Awaiting verification.',
    };
  } catch (error) {
    console.error('Crypto payment submission error:', error);
    throw new Error('Failed to submit crypto payment');
  }
};

/**
 * Get wire transfer details
 * @returns {Object} - Bank details
 */
exports.getWireTransferDetails = () => {
  return {
    bankName: process.env.BANK_NAME,
    accountName: process.env.BANK_ACCOUNT_NAME,
    accountNumber: process.env.BANK_ACCOUNT_NUMBER,
    routingNumber: process.env.BANK_ROUTING_NUMBER,
    swiftCode: process.env.BANK_SWIFT_CODE,
    bankAddress: process.env.BANK_ADDRESS,
    instructions: [
      '1. Initiate a wire transfer from your bank',
      '2. Use the bank details provided below',
      '3. Include your User ID in the transfer reference',
      '4. After transfer, submit the reference number here',
      '5. Processing time: 1-3 business days',
      '6. Your investment will be activated after verification',
    ],
    important: [
      '⚠️ Ensure all details are correct',
      '⚠️ Include your User ID in the reference',
      '⚠️ Wire transfer fees may apply from your bank',
      '⚠️ International transfers may take longer',
    ],
  };
};

/**
 * Submit wire transfer payment
 * @param {Object} wireData - Wire transfer data
 * @returns {Object} - Pending investment
 */
exports.submitWireTransfer = async (wireData) => {
  const {
    userId,
    assetType,
    plan,
    amount,
    timeframeWeeks,
    referenceNumber,
    senderBank,
    senderName,
  } = wireData;
    const annualReturnRate = Investment.getReturnRate(wireData.plan);
    const expectedROI = (wireData.amount * annualReturnRate * wireData.timeframeWeeks) / 52;
    const totalDays = wireData.timeframeWeeks * 7;
    const dailyGrowth = expectedROI / totalDays;
    const currentValue = amount;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (timeframeWeeks * 7 * 24 * 60 * 60 * 1000));

  try {
    // Create pending investment
    const investment = await Investment.create({
      user: userId,
      assetType,
      plan,
      amount,
      timeframeWeeks,
      paymentMethod: 'wire',
      paymentStatus: 'pending',
      transactionId: referenceNumber,
      annualReturnRate,
      expectedROI,
      dailyGrowth,
      currentValue,
      startDate,
      endDate,
      status: 'pending',

    });

    // Create pending transaction
    await Transaction.create({
      user: userId,
      investment: investment._id,
      type: 'deposit',
      amount,
      status: 'pending',
      paymentMethod: 'wire',
      externalTransactionId: referenceNumber,
      description: `Wire transfer for ${assetType} investment`,
      metadata: {
        senderBank,
        senderName,
      },
    });

    // Send confirmation email
    const user = await User.findById(userId);
    await emailService.sendWireTransferSubmittedEmail(user, {
      amount,
      referenceNumber,
      assetType,
      plan,
      senderBank,
    });

    return {
      investment,
      message: 'Wire transfer submitted. Awaiting verification.',
    };
  } catch (error) {
    console.error('Wire transfer submission error:', error);
    throw new Error('Failed to submit wire transfer');
  }
};

/**
 * Process successful payment (called by webhooks)
 * @param {Object} paymentData - Payment data from webhook
 * @returns {Object} - Created investment
 */
exports.processSuccessfulPayment = async (paymentData) => {
  const {
    userId,
    assetType,
    plan,
    amount,
    timeframeWeeks,
    paymentMethod,
    transactionId,
  } = paymentData;

  try {
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate ROI fields (same logic as Investment model pre-save hook)
    const annualReturnRate = Investment.getReturnRate(plan);
    const expectedROI = (amount * annualReturnRate * timeframeWeeks) / 52;
    const totalDays = timeframeWeeks * 7;
    const dailyGrowth = expectedROI / totalDays;
    const currentValue = amount;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (timeframeWeeks * 7 * 24 * 60 * 60 * 1000));

    // Create investment with all required fields
    const investment = await Investment.create({
      user: userId,
      assetType,
      plan,
      amount,
      timeframeWeeks,
      paymentMethod,
      paymentStatus: 'completed',
      transactionId,
      autoCompound: user.autoCompound,
      // ROI calculation fields
      annualReturnRate,
      expectedROI,
      dailyGrowth,
      currentValue,
      startDate,
      endDate,
      status: 'active',
    });

    // Update user totals
    user.totalInvested += amount;
    user.currentBalance += amount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      user: userId,
      investment: investment._id,
      type: 'deposit',
      amount,
      status: 'completed',
      paymentMethod,
      externalTransactionId: transactionId,
      description: `Investment in ${assetType} - ${plan} plan`,
    });

    // Send confirmation email
    await emailService.sendInvestmentConfirmationEmail(user, investment);

    console.log(`✅ Investment created successfully: ${investment._id}`);
    return investment;
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    throw error;
  }
};
