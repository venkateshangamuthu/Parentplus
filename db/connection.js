import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parentplus';
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
    console.log(`Connected to: ${mongoURI}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
