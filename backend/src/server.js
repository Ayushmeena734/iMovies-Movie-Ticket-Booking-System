import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import bookingRoutes from './routes/bookings.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'IMovies API' }));
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'This record already exists.' });
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Server error.' : err.message });
});
const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`IMovies API running on port ${PORT}`))).catch(err => { console.error('Database connection failed:', err.message); process.exit(1); });
