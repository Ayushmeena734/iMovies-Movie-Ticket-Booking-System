import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
const makeToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    if (await User.findOne({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: makeToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: makeToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});
router.get('/me', protect, (req, res) => res.json({ user: req.user }));
export default router;
