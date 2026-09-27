import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/koorakotta_cbs';

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB Local', service: 'Koora Kotta CBS Backend API' });
});

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);

// Connect MongoDB Local & Start Server
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Local Database: koorakotta_cbs');
    await seedDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Koora Kotta CBS Backend API running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} is in use. Trying port ${Number(PORT) + 1}...`);
        app.listen(Number(PORT) + 1, () => {
          console.log(`🚀 Koora Kotta CBS Backend API running on http://localhost:${Number(PORT) + 1}`);
        });
      } else {
        console.error('❌ Server error:', err);
      }
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Local Connection Error:', err.message);
  });

