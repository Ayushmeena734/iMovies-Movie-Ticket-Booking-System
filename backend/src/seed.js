import 'dotenv/config';
import { connectDB } from './config/db.js';
import Movie from './models/Movie.js';
import Show from './models/Show.js';

await connectDB();
await Show.deleteMany({});
await Movie.deleteMany({});
const movies = await Movie.insertMany([
  { title: 'The Last Horizon', description: 'A thrilling journey across unknown worlds where courage is the only way home.', genre: 'Adventure / Sci-Fi', duration: 132, language: 'English', rating: 8.2, poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=700' },
  { title: 'City of Dreams', description: 'An aspiring musician discovers friendship, ambition and the meaning of success.', genre: 'Drama', duration: 118, language: 'Hindi', rating: 7.8, poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700' },
  { title: 'The Hidden Case', description: 'A detective follows a trail of clues in a mystery that changes everything.', genre: 'Mystery / Thriller', duration: 126, language: 'Hindi', rating: 8.5, poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700' },
  { title: 'Laugh Out Loud', description: 'A family comedy full of unexpected situations and unforgettable characters.', genre: 'Comedy', duration: 105, language: 'Hindi', rating: 7.4, poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=700' }
]);
const now = new Date();
const shows = [];
for (const movie of movies) {
  for (let day = 0; day < 3; day++) {
    for (const hour of [14, 18, 21]) {
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + day);
      startTime.setHours(hour, 0, 0, 0);
      if (startTime > now) shows.push({ movie: movie._id, cinema: 'IMovies Central Mall', screen: 'Screen 1', startTime, price: hour === 21 ? 250 : 200 });
    }
  }
}
await Show.insertMany(shows);
console.log(`Seeded ${movies.length} movies and ${shows.length} shows.`);
await (await import('mongoose')).default.disconnect();
