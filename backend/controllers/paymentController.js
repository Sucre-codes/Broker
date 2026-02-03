/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */

const paymentService = require('../services/paymentService');
const crypto = require('crypto');

// ===========================================================================
// NEW — Step 1 of the crypto/wire flow
// User hits this first.  Server creates a pending investment, notifies admin.
// User stays on a "waiting" screen until Socket.io delivers the details.
//
// @route   POST /api/payments/initiate
// @access  Private
// @body    { amount, assetType, plan, timeframeWeeks, paymentMethod }
//          paymentMethod: 'crypto' | 'wire'
// ===========================================================================
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, assetType, plan, timeframeWeeks, paymentMethod } = req.body;

    // --- validation --------------------------------------------------------
    if (!amount || !assetType || !plan || !timeframeWeeks || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, assetType, plan, timeframeWeeks, paymentMethod',
      });
    }

    if (!['crypto', 'wire'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'paymentMethod must be "crypto" or "wire"',
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment amount is $10',
      });
    }

    // --- service call -------------------------------------------------------
    const investment = await paymentService.initiatePayment({
      userId:         req.user._id.toString(),
      amount,
      assetType,
      plan,
      timeframeWeeks,
      paymentMethod,
    });

    // Return the investment ID so the frontend can poll / attach a listener
    res.status(201).json({
      success: true,
      message: 'Investment initiated. Waiting for admin to provide payment details…',
      data: {
        investmentId: investment._id.toString(),
        status:       investment.status,
        paymentMethod,
      },
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
};

// ===========================================================================
// Crypto — get wallet details + QR (legacy helper, still useful)
// @route   GET  /api/payments/crypto/:currency
// @access  Private
// ===========================================================================
exports.getCryptoDetails = async (req, res) => {
  try {
    const { currency } = req.params;
    const { amount }   = req.query;

    if (!amount || amount < 10) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const details = await paymentService.getCryptoPaymentDetails(currency, parseFloat(amount));
    res.status(200).json({ success: true, data: details });
  } catch (error) {
    console.error('Crypto details error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get crypto details' });
  }
};

// ===========================================================================
// Crypto — submit tx hash after paying (Step 3 of new flow)
// @route   POST /api/payments/crypto/submit
// @access  Private
// ===========================================================================
exports.submitCryptoPayment = async (req, res) => {
  try {
    const { assetType, plan, amount, timeframeWeeks, currency, transactionHash, investmentId } = req.body;

    if (!transactionHash || !currency) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // If investmentId is provided we're in the NEW flow — update the existing
    // pending investment instead of creating a fresh one.
    const result = investmentId
      ? await paymentService.submitCryptoProof({
          investmentId,
          userId:         req.user._id.toString(),
          currency,
          transactionHash,
        })
      : await paymentService.submitCryptoPayment({
          userId: req.user._id.toString(),
          assetType, plan, amount, timeframeWeeks, currency, transactionHash,
        });

    res.status(201).json({ success: true, message: result.message, data: result.investment });
  } catch (error) {
    console.error('Crypto submission error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit crypto payment' });
  }
};

// ===========================================================================
// Wire — get bank details (legacy helper)
// @route   GET  /api/payments/wire/details
// @access  Private
// ===========================================================================
exports.getWireDetails = async (req, res) => {
  try {
    const details = paymentService.getWireTransferDetails();
    res.status(200).json({ success: true, data: details });
  } catch (error) {
    console.error('Wire details error:', error);
    res.status(500).json({ success: false, message: 'Failed to get wire transfer details' });
  }
};

// ===========================================================================
// Wire — submit reference number after paying (Step 3 of new flow)
// @route   POST /api/payments/wire/submit
// @access  Private
// ===========================================================================
exports.submitWireTransfer = async (req, res) => {
  try {
    const { assetType, plan, amount, timeframeWeeks, referenceNumber, senderBank, senderName, investmentId } = req.body;

    if (!referenceNumber || !senderBank || !senderName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = investmentId
      ? await paymentService.submitWireProof({
          investmentId,
          userId:         req.user._id.toString(),
          referenceNumber,
          senderBank,
          senderName,
        })
      : await paymentService.submitWireTransfer({
          userId: req.user._id.toString(),
          assetType, plan, amount, timeframeWeeks, referenceNumber, senderBank, senderName,
        });

    res.status(201).json({ success: true, message: result.message, data: result.investment });
  } catch (error) {
    console.error('Wire transfer submission error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit wire transfer' });
  }
};