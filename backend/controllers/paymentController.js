/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */

const paymentService = require('../services/paymentService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

/**
 * @desc    Create Stripe payment intent
 * @route   POST /api/payments/stripe/create-intent
 * @access  Private
 */
exports.createStripeIntent = async (req, res) => {
  try {
    const { amount, assetType, plan, timeframeWeeks } = req.body;

    // Validate input
    if (!amount || !assetType || !plan || !timeframeWeeks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment amount is $10',
      });
    }

    const result = await paymentService.createStripePayment({
      amount,
      userId: req.user._id.toString(),
      assetType,
      plan,
      timeframeWeeks,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Stripe intent creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
    });
  }
};

/**
 * @desc    Stripe webhook handler
 * @route   POST /api/payments/webhook/stripe
 * @access  Public (but verified)
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata;

        // Process successful payment
        await paymentService.processSuccessfulPayment({
          userId: metadata.userId,
          assetType: metadata.assetType,
          plan: metadata.plan,
          amount: paymentIntent.amount / 100, // Convert from cents
          timeframeWeeks: parseInt(metadata.timeframeWeeks),
          paymentMethod: 'stripe',
          transactionId: paymentIntent.id,
        });

        console.log('✅ Payment processed:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

/**
 * @desc    Create PayPal order
 * @route   POST /api/payments/paypal/create-order
 * @access  Private
 */
exports.createPayPalOrder = async (req, res) => {
  try {
    const { amount, assetType, plan, timeframeWeeks } = req.body;

    // Validate input
    if (!amount || !assetType || !plan || !timeframeWeeks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment amount is $10',
      });
    }

    const result = await paymentService.createPayPalOrder({
      amount,
      userId: req.user._id.toString(),
      assetType,
      plan,
      timeframeWeeks,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create PayPal order',
    });
  }
};

/**
 * @desc    Capture PayPal payment
 * @route   POST /api/payments/paypal/capture/:orderId
 * @access  Private
 */
exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const capture = await paymentService.capturePayPalPayment(orderId);

    // Extract custom data
    const customData = JSON.parse(
      capture.purchase_units[0].payments.captures[0].custom_id || '{}'
    );

    // Process successful payment
    await paymentService.processSuccessfulPayment({
      userId: customData.userId,
      assetType: customData.assetType,
      plan: customData.plan,
      amount: parseFloat(capture.purchase_units[0].amount.value),
      timeframeWeeks: parseInt(customData.timeframeWeeks),
      paymentMethod: 'paypal',
      transactionId: capture.id,
    });

    res.status(200).json({
      success: true,
      message: 'Payment captured successfully',
      data: capture,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to capture payment',
    });
  }
};

/**
 * @desc    Get cryptocurrency payment details
 * @route   GET /api/payments/crypto/:currency
 * @access  Private
 */
exports.getCryptoDetails = async (req, res) => {
  try {
    const { currency } = req.params;
    const { amount } = req.query;

    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    const details = await paymentService.getCryptoPaymentDetails(
      currency,
      parseFloat(amount)
    );

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Crypto details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get crypto details',
    });
  }
};

/**
 * @desc    Submit cryptocurrency payment
 * @route   POST /api/payments/crypto/submit
 * @access  Private
 */
exports.submitCryptoPayment = async (req, res) => {
  try {
    const {
      assetType,
      plan,
      amount,
      timeframeWeeks,
      currency,
      transactionHash,
    } = req.body;

    // Validate input
    if (!assetType || !plan || !amount || !timeframeWeeks || !currency || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment amount is $10',
      });
    }

    const result = await paymentService.submitCryptoPayment({
      userId: req.user._id.toString(),
      assetType,
      plan,
      amount,
      timeframeWeeks,
      currency,
      transactionHash,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.investment,
    });
  } catch (error) {
    console.error('Crypto submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit crypto payment',
    });
  }
};

/**
 * @desc    Get wire transfer details
 * @route   GET /api/payments/wire/details
 * @access  Private
 */
exports.getWireDetails = async (req, res) => {
  try {
    const details = paymentService.getWireTransferDetails();

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Wire details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wire transfer details',
    });
  }
};

/**
 * @desc    Submit wire transfer payment
 * @route   POST /api/payments/wire/submit
 * @access  Private
 */
exports.submitWireTransfer = async (req, res) => {
  try {
    const {
      assetType,
      plan,
      amount,
      timeframeWeeks,
      referenceNumber,
      senderBank,
      senderName,
    } = req.body;

    // Validate input
    if (!assetType || !plan || !amount || !timeframeWeeks || !referenceNumber || !senderBank || !senderName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment amount is $10',
      });
    }

    const result = await paymentService.submitWireTransfer({
      userId: req.user._id.toString(),
      assetType,
      plan,
      amount,
      timeframeWeeks,
      referenceNumber,
      senderBank,
      senderName,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.investment,
    });
  } catch (error) {
    console.error('Wire transfer submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit wire transfer',
    });
  }
};
