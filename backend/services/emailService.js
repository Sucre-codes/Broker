/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * Configures based on environment variables
 */
const createTransporter = () => {
  // Check if using SendGrid
  if (process.env.EMAIL_SERVICE === 'SendGrid') {
    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Default to SMTP (Gmail or custom)
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.html - HTML email content
 * @returns {Promise}
 */
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

/**
 * Send verification email
 * @param {Object} user - User object
 * @param {String} verificationToken - Verification token
 */
exports.sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #a21caf 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9 0%, #a21caf 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to The Musk Foundation!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.firstName},</h2>
          <p>Thank you for registering with the musk foundation and Jired Birchall. We're excited to have you on board!</p>
          <p>To complete your registration and start investing, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account with InvestHub, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 InvestHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    email: user.email,
    subject: 'Verify Your Musk Account',
    html,
  });
};

/**
 * Send welcome email after verification
 * @param {Object} user - User object
 */
exports.sendWelcomeEmail = async (user) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #a21caf 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9 0%, #a21caf 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Email Verified Successfully!</h1>
        </div>
        <div class="content">
          <h2>Congratulations ${user.firstName}!</h2>
          <p>Your email has been verified successfully. You can now access all features of The Musk Foundation.</p>
          <p>Start your investment journey today with our diverse range of assets:</p>
          <ul>
            <li>🏢 tesla(8-12% annual returns)</li>
            <li>💼 Spacex (15-20% annual returns)</li>
            <li>📈 The boring company (25-35% annual returns)</li>
            <li>₿ Deepmind Technology (40-50% annual returns)</li>
            <li>🐚 Neuralink (Traditional assets)</li>
          </ul>
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to Your Account</a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    email: user.email,
    subject: 'Welcome to Musk Foundation - Email Verified!',
    html,
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {String} resetToken - Reset token
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #a21caf 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9 0%, #a21caf 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.firstName},</h2>
          <p>We received a request to reset your password for your Musk account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    email: user.email,
    subject: 'Password Reset Request - The Musk Foundation',
    html,
  });
};

/**
 * Send investment confirmation email
 * @param {Object} user - User object
 * @param {Object} investment - Investment object
 */
exports.sendInvestmentConfirmationEmail = async (user, investment) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #0ea5e9 0%, #a21caf 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Investment Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Congratulations ${user.firstName}!</h2>
          <p>Your investment has been successfully confirmed and activated.</p>
          
          <div class="info-box">
            <h3>Investment Details:</h3>
            <p><strong>Asset Type:</strong> ${investment.assetType}</p>
            <p><strong>Plan:</strong> ${investment.plan.charAt(0).toUpperCase() + investment.plan.slice(1)}</p>
            <p><strong>Amount:</strong> $${investment.amount.toFixed(2)}</p>
            <p><strong>Duration:</strong> ${investment.timeframeWeeks} weeks</p>
            <p><strong>Expected ROI:</strong> $${investment.expectedROI.toFixed(2)}</p>
            <p><strong>Total Return:</strong> $${(investment.amount + investment.expectedROI).toFixed(2)}</p>
            <p><strong>Daily Growth:</strong> $${investment.dailyGrowth.toFixed(2)}</p>
          </div>
          
          <p>Your investment is now active and growing! Track your progress in real-time on your dashboard.</p>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">View Dashboard</a>
          </div>
          
          <p><strong>Important:</strong> Minimum holding period is 2 weeks before withdrawal.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    email: user.email,
    subject: '🎉 Investment Confirmed - The Musk Foundation',
    html,
  });
};

/**
 * Send crypto payment submitted email
 * @param {Object} user - User object
 * @param {Object} paymentData - Payment data
 */
exports.sendCryptoPaymentSubmittedEmail = async (user, paymentData) => {
  const { currency, amount, transactionHash, assetType, plan } = paymentData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Crypto Payment Received</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.firstName},</h2>
          <p>We have received your cryptocurrency payment submission.</p>
          
          <div class="info-box">
            <h3>Payment Details:</h3>
            <p><strong>Currency:</strong> ${currency}</p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Transaction Hash:</strong></p>
            <p style="word-break: break-all; font-family: monospace; font-size: 12px;">${transactionHash}</p>
            <p><strong>Asset Type:</strong> ${assetType}</p>
            <p><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Your payment is being verified on the blockchain</li>
            <li>Verification typically takes 10-30 minutes</li>
            <li>You'll receive a confirmation email once verified</li>
            <li>Your investment will be activated automatically</li>
          </ul>
          
          <p>Thank you for your patience!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    email: user.email,
    subject: 'Crypto Payment Received - The Musk Foundation',
    html,
  });
};

/**
 * Send wire transfer submitted email
 * @param {Object} user - User object
 * @param {Object} transferData - Transfer data
 */
exports.sendWireTransferSubmittedEmail = async (user, transferData) => {
  const { amount, referenceNumber, assetType, plan, senderBank } = transferData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Wire Transfer Received</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.firstName},</h2>
          <p>We have received your wire transfer submission.</p>
          
          <div class="info-box">
            <h3>Transfer Details:</h3>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Reference Number:</strong> ${referenceNumber}</p>
            <p><strong>Sender Bank:</strong> ${senderBank}</p>
            <p><strong>Asset Type:</strong> ${assetType}</p>
            <p><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Our team will verify the transfer details</li>
            <li>Processing time: 1-3 business days</li>
            <li>You'll receive a confirmation email once verified</li>
            <li>Your investment will be activated after verification</li>
          </ul>
          
          <p>Thank you for your patience!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    email: user.email,
    subject: 'Wire Transfer Received - The Musk Foundation',
    html,
  });
};
