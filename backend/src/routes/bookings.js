import express from 'express';
import crypto from 'node:crypto';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);

router.post('/', async (req, res, next) => {
  try {
    const { showId, seats } = req.body;
    if (!showId || !Array.isArray(seats) || seats.length < 1 || seats.length > 10) return res.status(400).json({ message: 'Choose between 1 and 10 seats.' });
    const cleanSeats = [...new Set(seats.map(s => String(s).trim().toUpperCase()))];
    if (cleanSeats.length !== seats.length || cleanSeats.some(s => !/^[A-F](0[1-9]|1[0-2])$/.test(s))) return res.status(400).json({ message: 'One or more seat numbers are invalid.' });
    const show = await Show.findById(showId);
    if (!show || show.startTime <= new Date()) return res.status(404).json({ message: 'Show not found or has already started.' });
    // Atomic update prevents two users from booking the same seat at the same time.
    const updated = await Show.findOneAndUpdate(
      { _id: showId, bookedSeats: { $nin: cleanSeats } },
      { $addToSet: { bookedSeats: { $each: cleanSeats } } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: 'One or more selected seats have just been booked. Please choose again.' });
    try {
      const booking = await Booking.create({ user: req.user._id, show: showId, seats: cleanSeats, totalAmount: show.price * cleanSeats.length, bookingCode: `IM-${crypto.randomBytes(4).toString('hex').toUpperCase()}` });
      res.status(201).json(await Booking.findById(booking._id).populate({ path: 'show', populate: { path: 'movie' } }));
    } catch (error) {
      await Show.updateOne({ _id: showId }, { $pull: { bookedSeats: { $in: cleanSeats } } });
      throw error;
    }
  } catch (e) { next(e); }
});
router.get('/mine', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate({ path: 'show', populate: { path: 'movie' } }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) { next(e); }
});
export default router;
