import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/connection.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ParentPlus API is running' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is healthy', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

