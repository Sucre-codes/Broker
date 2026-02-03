/**
 * emailService.js
 * 
 * All outgoing emails dispatched through the Brevo (Sendinblue)
 * Transactional Email API — no SMTP / nodemailer required.
 * 
 * .env vars required:
 *   BREVO_API_KEY
 *   EMAIL_FROM          (sender address)
 *   EMAIL_FROM_NAME     (sender display name)
 *   FRONTEND_URL        (used to build links in emails)
 *   ADMIN_EMAIL         (target for admin-notification emails)
 */

const axios = require('axios');

// ---------------------------------------------------------------------------
// Core sender
// ---------------------------------------------------------------------------
// LINE ~23 — FIX
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

async function _send({ to, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set in .env');

  const payload = {
    sender: {
      name:  process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,  
    },
    to: Array.isArray(to) ? to : [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    const res = await axios.post(BREVO_URL, payload, {
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept:'application/json' },
    });
    console.log(`✅ Email sent — subject: "${subject}"  messageId: ${res.data.messageId}`);
    return res.data;
  } catch (err) {
    console.error('❌ Brevo send error:', err.response?.data || err.message);
    throw new Error('Email could not be sent');
  }
}

// ---------------------------------------------------------------------------
// Shared CSS snippet (keeps every template consistent)
// ---------------------------------------------------------------------------
const CSS = `
  body            { font-family: Arial, sans-serif; line-height:1.6; color:#333; background:#f3f4f6; margin:0; padding:28px; }
  .wrap           { max-width:580px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,.07); }
  .hdr            { background:linear-gradient(135deg,#0ea5e9,#a21caf); color:#fff; padding:30px; text-align:center; }
  .hdr h1         { margin:0; font-size:22px; }
  .body           { padding:30px; }
  .info-box       { background:#f0f9ff; border:1px solid #bae6fd; border-left:4px solid #0ea5e9; border-radius:8px; padding:18px 22px; margin:20px 0; }
  .info-box p     { margin:7px 0; font-size:14px; }
  .info-box .lbl  { font-weight:700; color:#0369a1; display:inline-block; min-width:130px; }
  .btn            { display:inline-block; padding:12px 32px; background:linear-gradient(135deg,#0ea5e9,#a21caf); color:#fff; text-decoration:none; border-radius:8px; margin:18px 0; font-weight:600; }
  .warn           { background:#fef3c7; border-left:4px solid #f59e0b; padding:14px 18px; border-radius:6px; margin:18px 0; font-size:13px; color:#92400e; }
  .code           { background:#e5e7eb; padding:10px 14px; border-radius:6px; word-break:break-all; font-family:'Courier New',monospace; font-size:13px; margin:8px 0; }
  .footer         { text-align:center; padding:18px 30px; color:#9ca3af; font-size:12px; border-top:1px solid #e5e7eb; }
  ul              { padding-left:20px; }
  ul li           { margin:6px 0; font-size:14px; }
`;

function wrap(hdrTitle, bodyHtml) {
  return `<!DOCTYPE html><html><head><style>${CSS}</style></head><body>
    <div class="wrap">
      <div class="hdr"><h1>${hdrTitle}</h1></div>
      <div class="body">${bodyHtml}</div>
      <div class="footer">&copy; ${new Date().getFullYear()} ${process.env.BREVO_SENDER_NAME}. All rights reserved.</div>
    </div>
  </body></html>`;
}

// ===========================================================================
// 1. Verification email
// ===========================================================================
exports.sendVerificationEmail = async (user, verificationToken) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  await _send({
    to:      user.email,
    subject: `Verify Your ${process.env.BREVO_SENDER_NAME} Account`,
    htmlContent: wrap('Welcome — Verify Your Email', `
      <h2>Hello ${user.firstName},</h2>
      <p>Thank you for registering! Click the button below to verify your email and unlock your account.</p>
      <div style="text-align:center"><a href="${url}" class="btn">Verify Email Address</a></div>
      <p>Or paste this link into your browser:</p>
      <div class="code">${url}</div>
      <p><strong>This link expires in 24 hours.</strong></p>
      <p>Didn't create an account? You can safely ignore this email.</p>
    `),
  });
};

// ===========================================================================
// 2. Welcome email (after verification)
// ===========================================================================
exports.sendWelcomeEmail = async (user) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  await _send({
    to:      user.email,
    subject: `🎉 Welcome to ${process.env.BREVO_SENDER_NAME}!`,
    htmlContent: wrap('🎉 Email Verified Successfully!', `
      <h2>Congratulations, ${user.firstName}!</h2>
      <p>Your email is verified. You now have full access to the platform.</p>
      <p>Here's a quick look at the asset classes available:</p>
      <ul>
        <li>🏢 <strong>Tesla</strong> — 8–12 % annual returns</li>
        <li>🚀 <strong>SpaceX</strong> — 15–20 % annual returns</li>
        <li>📈 <strong>The Boring Company</strong> — 25–35 % annual returns</li>
        <li>🤖 <strong>Deepmind Technology</strong> — 40–50 % annual returns</li>
        <li>🧠 <strong>Neuralink</strong> — Traditional assets</li>
      </ul>
      <div style="text-align:center"><a href="${loginUrl}" class="btn">Login Now</a></div>
    `),
  });
};

// ===========================================================================
// 3. Password-reset email
// ===========================================================================
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await _send({
    to:      user.email,
    subject: `Password Reset Request — ${process.env.BREVO_SENDER_NAME}`,
    htmlContent: wrap('Password Reset Request', `
      <h2>Hello ${user.firstName},</h2>
      <p>We received a request to reset your password. Click below:</p>
      <div style="text-align:center"><a href="${url}" class="btn">Reset Password</a></div>
      <p>Or paste this link:</p>
      <div class="code">${url}</div>
      <p><strong>This link expires in 1 hour.</strong></p>
      <p>Didn't request a reset? Ignore this email or contact support.</p>
    `),
  });
};

// ===========================================================================
// 4. Investment confirmed (PayPal / admin approval)
// ===========================================================================
exports.sendInvestmentConfirmationEmail = async (user, investment) => {
  const dashUrl = `${process.env.FRONTEND_URL}/dashboard`;

  await _send({
    to:      user.email,
    subject: `🎉 Investment Confirmed — ${process.env.BREVO_SENDER_NAME}`,
    htmlContent: wrap('🎉 Investment Confirmed!', `
      <h2>Great news, ${user.firstName}!</h2>
      <p>Your investment is live and growing.</p>
      <div class="info-box">
        <p><span class="lbl">Asset</span>${investment.assetType}</p>
        <p><span class="lbl">Plan</span>${investment.plan.charAt(0).toUpperCase() + investment.plan.slice(1)}</p>
        <p><span class="lbl">Amount</span>$${investment.amount.toFixed(2)}</p>
        <p><span class="lbl">Duration</span>${investment.timeframeWeeks} weeks</p>
        <p><span class="lbl">Expected ROI</span>$${investment.expectedROI.toFixed(2)}</p>
        <p><span class="lbl">Total Return</span>$${(investment.amount + investment.expectedROI).toFixed(2)}</p>
        <p><span class="lbl">Daily Growth</span>$${investment.dailyGrowth.toFixed(2)}</p>
      </div>
      <div class="warn">⚠️ <strong>Minimum holding period:</strong> 2 weeks before any withdrawal.</div>
      <div style="text-align:center"><a href="${dashUrl}" class="btn">View Dashboard</a></div>
    `),
  });
};

// ===========================================================================
// 5. Crypto payment submitted receipt
// ===========================================================================
exports.sendCryptoPaymentSubmittedEmail = async (user, paymentData) => {
  const { currency, amount, transactionHash, assetType, plan } = paymentData;

  await _send({
    to:      user.email,
    subject: `Crypto Payment Received — ${process.env.BREVO_SENDER_NAME}`,
    htmlContent: wrap('Crypto Payment Received', `
      <h2>Hello ${user.firstName},</h2>
      <p>We have your crypto submission on file:</p>
      <div class="info-box">
        <p><span class="lbl">Currency</span>${currency}</p>
        <p><span class="lbl">USD Amount</span>$${Number(amount).toFixed(2)}</p>
        <p><span class="lbl">Tx Hash</span></p>
        <div class="code">${transactionHash}</div>
        <p><span class="lbl">Asset</span>${assetType}</p>
        <p><span class="lbl">Plan</span>${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
      </div>
      <h3>What happens next?</h3>
      <ul>
        <li>Our team verifies the transaction on-chain.</li>
        <li>Verification usually takes 10–30 minutes.</li>
        <li>You'll get a confirmation email once approved.</li>
      </ul>
    `),
  });
};

// ===========================================================================
// 6. Wire transfer submitted receipt
// ===========================================================================
exports.sendWireTransferSubmittedEmail = async (user, transferData) => {
  const { amount, referenceNumber, assetType, plan, senderBank } = transferData;

  await _send({
    to:      user.email,
    subject: `Wire Transfer Received — ${process.env.BREVO_SENDER_NAME}`,
    htmlContent: wrap('Wire Transfer Received', `
      <h2>Hello ${user.firstName},</h2>
      <p>Your wire transfer has been logged:</p>
      <div class="info-box">
        <p><span class="lbl">Amount</span>$${Number(amount).toFixed(2)}</p>
        <p><span class="lbl">Reference</span>${referenceNumber}</p>
        <p><span class="lbl">Sender Bank</span>${senderBank}</p>
        <p><span class="lbl">Asset</span>${assetType}</p>
        <p><span class="lbl">Plan</span>${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
      </div>
      <h3>What happens next?</h3>
      <ul>
        <li>Our team verifies the wire (1–3 business days).</li>
        <li>You'll receive a confirmation email once approved.</li>
      </ul>
    `),
  });
};

// ===========================================================================
// 7. Admin notification — new pending investment
// ===========================================================================
exports.sendAdminPendingInvestmentEmail = async (investment, user) => {
  const adminDashboard = `${process.env.FRONTEND_URL}/admin/pending`;
  const adminEmail     = process.env.ADMIN_EMAIL;

  await _send({
    to:      adminEmail,
    subject: `⏳ New Pending Investment — ${user.firstName} ${user.lastName}`,
    htmlContent: wrap('⏳ Pending Investment Needs Attention', `
      <h2>New investment request</h2>
      <p>A user has initiated an investment. Please log in, input the payment details, and forward them.</p>
      <div class="info-box">
        <p><span class="lbl">Investment ID</span>${investment._id}</p>
        <p><span class="lbl">User</span>${user.firstName} ${user.lastName} (${user.email})</p>
        <p><span class="lbl">Asset</span>${investment.assetType}</p>
        <p><span class="lbl">Plan</span>${investment.plan.charAt(0).toUpperCase() + investment.plan.slice(1)}</p>
        <p><span class="lbl">Amount</span>$${investment.amount.toFixed(2)}</p>
        <p><span class="lbl">Method</span>${investment.paymentMethod}</p>
        <p><span class="lbl">Duration</span>${investment.timeframeWeeks} weeks</p>
      </div>
      <div style="text-align:center"><a href="${adminDashboard}" class="btn">Open Admin Panel</a></div>
      <p style="font-size:13px; color:#6b7280; margin-top:24px;">
        The user is waiting on-screen. Once you input details and click <strong>Send</strong>, they receive them in real-time via Socket.io.
      </p>
    `),
  });
};

// ===========================================================================
// 8. Payment details forwarded to user (backup email — primary is Socket.io)
// ===========================================================================
exports.sendPaymentDetailsEmail = async (user, details) => {
  const { investmentId, paymentMethod } = details;
  let detailsHtml = '';

  if (paymentMethod === 'crypto') {
    detailsHtml = `
      <p><span class="lbl">Cryptocurrency</span>${details.cryptoCurrency}</p>
      <p><span class="lbl">Network</span>${details.cryptoNetwork}</p>
      <p><span class="lbl">Wallet Address</span></p>
      <div class="code">${details.cryptoAddress}</div>
      <p><span class="lbl">Send Amount</span>${details.cryptoAmount} ${details.cryptoCurrency} (≈ $${Number(details.usdAmount).toFixed(2)})</p>
    `;
  } else {
    detailsHtml = `
      <p><span class="lbl">Bank</span>${details.bankName}</p>
      <p><span class="lbl">Account Name</span>${details.accountName}</p>
      <p><span class="lbl">Account No.</span>${details.accountNumber}</p>
      <p><span class="lbl">Routing No.</span>${details.routingNumber}</p>
      <p><span class="lbl">SWIFT</span>${details.swiftCode}</p>
      <p><span class="lbl">Bank Address</span>${details.bankAddress}</p>
      <p><span class="lbl">Reference</span>${details.referenceNote || 'Include your User ID'}</p>
    `;
  }

  await _send({
    to:      user.email,
    subject: `💳 Payment Details Ready — Investment ${investmentId}`,
    htmlContent: wrap('💳 Your Payment Details Are Ready', `
      <h2>Hello ${user.firstName},</h2>
      <p>Here are your <strong>${paymentMethod}</strong> payment details:</p>
      <div class="info-box">
        <p><span class="lbl">Investment ID</span>${investmentId}</p>
        <p><span class="lbl">Method</span>${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
        ${detailsHtml}
      </div>
      ${details.instructions?.length ? `<h3>Instructions</h3><ul>${details.instructions.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
      <div class="warn">⚠️ After sending, go back to the app and submit your <strong>transaction hash</strong> (crypto) or <strong>reference number</strong> (wire) for verification.</div>
    `),
  });
};

// ===========================================================================
// 9. Payment rejected notification
// ===========================================================================
exports.sendPaymentRejectedEmail = async (user, { investmentId, reason, paymentMethod }) => {
  await _send({
    to:      user.email,
    subject: `❌ Payment Verification Failed — ${process.env.BREVO_SENDER_NAME }`,
    htmlContent: wrap('❌ Payment Verification Failed', `
      <h2>Hello ${user.firstName},</h2>
      <p>We were unable to verify your <strong>${paymentMethod}</strong> payment for investment <code>${investmentId}</code>.</p>
      <div class="warn">
        <strong>Reason:</strong> ${reason || 'The payment could not be verified. Please double-check and try again.'}
      </div>
      <p>You're welcome to submit a new payment or contact support for help.</p>
    `),
  });
};

// ===========================================================================
// 11. Withdrawal initiation (user requested withdrawal)
// ===========================================================================
exports.sendWithdrawalInitiatedEmail = async (user, withdrawal) => {
  const dashUrl = `${process.env.FRONTEND_URL}/dashboard`;

  await _send({
    to: user.email,
    subject: `⏳ Withdrawal Request Received — ${process.env.BREVO_SENDER_NAME}`,
    htmlContent: wrap('⏳ Withdrawal Request Submitted', `
      <h2>Hello ${user.firstName},</h2>

      <p>We’ve received your withdrawal request. It is currently under review.</p>

      <div class="info-box">
        <p><span class="lbl">Withdrawal ID</span>${withdrawal._id}</p>
        <p><span class="lbl">Amount</span>$${Number(withdrawal.amount).toFixed(2)}</p>
        <p><span class="lbl">Method</span>${withdrawal.method.charAt(0).toUpperCase() + withdrawal.method.slice(1)}</p>
        <p><span class="lbl">Investment</span>${withdrawal.investmentId}</p>
        <p><span class="lbl">Requested On</span>${new Date(withdrawal.createdAt).toLocaleString()}</p>
        ${withdrawal.destination ? `<p><span class="lbl">Destination</span>${withdrawal.destination}</p>` : ''}
      </div>

      <div class="warn">
        ⚠️ <strong>Processing time:</strong> Withdrawals are reviewed within
        <strong>24–72 hours</strong>. You’ll receive another email once approved
        or if additional information is required.
      </div>

      <div style="text-align:center">
        <a href="${dashUrl}" class="btn">View Dashboard</a>
      </div>

      <p style="font-size:13px;color:#6b7280;margin-top:24px;">
        If you did not initiate this request, please contact support immediately.
      </p>
    `),
  });
};


// ===========================================================================
// 10. Generic raw send (used for inline one-off emails)
// ===========================================================================
exports.sendEmail = async ({ email, subject, html }) => {
  await _send({ to: email, subject, htmlContent: html });
};