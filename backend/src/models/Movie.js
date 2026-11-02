import mongoose from 'mongoose';
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  duration: { type: Number, required: true },
  language: { type: String, default: 'Hindi' },
  rating: { type: Number, default: 0 },
  poster: { type: String, default: '' },
  releaseDate: { type: Date, default: Date.now }
}, { timestamps: true });
export default mongoose.model('Movie', movieSchema);
