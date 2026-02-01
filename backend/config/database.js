const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI,{
      tls:true,
      serverSelectionTimeoutMS: 5000,
      family:4
    }); 
    
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
      
module.exports = connectDB;             