const nodemailer = require('nodemailer');

/**
 * Email Utility
 * Handles all email sending functionality
 */

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send verification email
 */
exports.sendVerificationEmail = async (email, firstName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your InvestHub Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to InvestHub!</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Thank you for signing up with InvestHub. We're excited to have you on board!</p>
            <p>To complete your registration and start investing, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with InvestHub, please ignore this email.</p>
            <p>Best regards,<br>The InvestHub Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} InvestHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

/**
 * Send withdrawal request confirmation email
 */
exports.sendWithdrawalRequestEmail = async (email, firstName, amount, profit, withdrawalDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Withdrawal Request Received - InvestHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .amount { font-size: 24px; font-weight: bold; color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Withdrawal Request Received</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>We have received your withdrawal request. Here are the details:</p>
            
            <div class="info-box">
              <p><strong>Withdrawal Amount:</strong> <span class="amount">$${amount.toFixed(2)}</span></p>
              <p><strong>Profit Earned:</strong> $${profit.toFixed(2)}</p>
              <p><strong>Total Amount:</strong> <span class="amount">$${(amount + profit).toFixed(2)}</span></p>
              <p><strong>Withdrawal Details:</strong> ${withdrawalDetails}</p>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
              <li>Your withdrawal request is now being processed</li>
              <li>Our team will review and verify the details</li>
              <li>Processing typically takes 2-5 business days</li>
              <li>You will receive a confirmation email once the withdrawal is completed</li>
            </ul>
            
            <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The InvestHub Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} InvestHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request - InvestHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>We received a request to reset your password for your InvestHub account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
            
            <p>Best regards,<br>The InvestHub Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} InvestHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

/**
 * Send investment confirmation email
 */
exports.sendInvestmentConfirmationEmail = async (email, firstName, investment) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Investment Confirmed - InvestHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Investment Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Congratulations! Your investment has been successfully confirmed and is now active.</p>
            
            <div class="info-box">
              <h3>Investment Details:</h3>
              <p><strong>Asset Type:</strong> ${investment.assetType.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Plan:</strong> ${investment.plan.charAt(0).toUpperCase() + investment.plan.slice(1)}</p>
              <p><strong>Investment Amount:</strong> $${investment.amount.toFixed(2)}</p>
              <p><strong>Duration:</strong> ${investment.timeframeWeeks} weeks</p>
              <p><strong>Expected ROI:</strong> $${investment.expectedROI.toFixed(2)}</p>
              <p><strong>Expected Total Return:</strong> $${(investment.amount + investment.expectedROI).toFixed(2)}</p>
              <p><strong>Start Date:</strong> ${new Date(investment.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> ${new Date(investment.endDate).toLocaleDateString()}</p>
            </div>
            
            <p>You can track your investment progress in real-time through your dashboard.</p>
            <p>Remember: Minimum withdrawal period is 2 weeks from the start date.</p>
            
            <p>Happy investing!<br>The InvestHub Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} InvestHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
