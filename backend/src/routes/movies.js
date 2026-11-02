import express from 'express';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
const router = express.Router();
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.search ? { title: { $regex: req.query.search, $options: 'i' } } : {};
    res.json(await Movie.find(filter).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});
router.get('/:id/shows', async (req, res, next) => {
  try {
    const shows = await Show.find({ movie: req.params.id, startTime: { $gte: new Date() } }).sort({ startTime: 1 });
    res.json(shows);
  } catch (e) { next(e); }
});
export default router;
