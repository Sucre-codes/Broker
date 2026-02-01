const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    
    await mongoose.connect('mongodb://newagedelliveryofficiall_db_user:ALKEBULAN@ac-xv14qd5-shard-00-00.o0kigul.mongodb.net:27017,ac-xv14qd5-shard-00-01.o0kigul.mongodb.net:27017,ac-xv14qd5-shard-00-02.o0kigul.mongodb.net:27017/elon?replicaSet=atlas-2l0pky-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority',{
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