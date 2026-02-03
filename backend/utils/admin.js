#!/usr/bin/env node
/**
 * createAdmin.js
 *
 * Run:
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js --force
 */

const mongoose = require('mongoose');
const crypto   = require('crypto');
const axios    = require('axios');
const dotenv   = require('dotenv');
dotenv.config();

// ---------------------------------------------------------------------------
// Load real User model (DO NOT redefine schema)
// ---------------------------------------------------------------------------
const User = require('../models/User');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generatePassword(length = 18) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGO_URI is not set');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

// ---------------------------------------------------------------------------
// Brevo Email
// ---------------------------------------------------------------------------
async function sendAdminCredentialEmail(email, password) {
  const {
    BREVO_API_KEY,
    BREVO_SENDER_EMAIL,
    BREVO_SENDER_NAME,
  } = process.env;

  if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY missing');
  if (!BREVO_SENDER_EMAIL)   throw new Error('EMAIL_FROM missing');
  if (!BREVO_SENDER_NAME) throw new Error('EMAIL_FROM_NAME missing');

  const payload = {
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: [{ email }],
    subject: `🔐 Admin Account Credentials — ${BREVO_SENDER_NAME}`,
    htmlContent: `
      <h2>Admin Account Created</h2>
      <p>Use the credentials below to log in:</p>
      <pre>
Email: ${email}
Password: ${password}
Role: Admin
      </pre>
      <p><strong>Change your password immediately after login.</strong></p>
    `,
  };

  const res = await axios.post(
  'https://api.sendinblue.com/v3/smtp/email',
  payload,
  {
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
  }
);


  return res.data;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const force = process.argv.includes('--force');
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('❌ ADMIN_EMAIL not set');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: adminEmail, isAdmin: true });

  if (existing && !force) {
    console.log('ℹ️ Admin already exists.');
    console.log('Use --force to recreate.');
    await disconnectDB();
    return;
  }

  if (existing && force) {
    await User.deleteOne({ _id: existing._id });
    console.log('🗑️ Existing admin removed (--force)');
  }

  const password = generatePassword();

  const admin = new User({
    firstName: 'Admin',
    lastName: 'MacBee',
    email: adminEmail,
    password,          // hashed by model hook
    isAdmin: true,
    isVerified: true,
    isActive: true,
  });

  await admin.save();
  console.log(`✅ Admin created: ${admin._id}`);

  try {
    console.log('📧 Sending credentials email...');
    const mail = await sendAdminCredentialEmail(adminEmail, password);
    console.log(`✅ Email sent (messageId: ${mail.messageId})`);
  } catch (err) {
    console.error('⚠️ Admin created BUT email failed');
    console.error(err.response?.data || err.message);
  }

  await disconnectDB();
}

main().catch(async (err) => {
  console.error('❌ Fatal error:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
