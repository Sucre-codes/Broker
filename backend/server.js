const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const cron = require('node-cron');
const Investment = require('./models/Investment');

// Load environment variables


// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/transactions', require('./routes/transactions'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to InvestHub API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      investments: '/api/investments',
      withdrawals: '/api/withdrawals',
      transactions: '/api/transactions'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/**
 * Cron job to update investment values daily at midnight
 * This ensures all active investments have their current values updated
 */
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily investment update...');
  try {
    const activeInvestments = await Investment.find({ status: 'active' });
    
    for (let investment of activeInvestments) {
      investment.updateCurrentValue();
      
      // Check if investment has ended
      if (investment.hasEnded()) {
        investment.status = 'completed';
      }
      
      await investment.save();
    }
    
    console.log(`Updated ${activeInvestments.length} active investments`);
  } catch (error) {
    console.error('Error updating investments:', error);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
