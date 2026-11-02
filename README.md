# IMovies — MERN Movie Ticket Booking App

A beginner-friendly full-stack movie ticket booking project built with **MongoDB, Express, React and Node.js**. It includes registration/login, movie search, showtime selection, seat selection, booking confirmation, and booking history.

## Features
- Responsive movie catalogue with search
- User registration and login (hashed passwords + JWT)
- Upcoming showtimes and ticket prices
- 72-seat layout per show (6 rows × 12 seats)
- Prevents duplicate seat bookings with an atomic MongoDB update
- Booking reference code and booking history
- Sample movie/show data through a seed script

> This is a learning/demo project. It does not process real payments. Do not use it for real customer data without a security review, HTTPS, rate limiting, stronger validation, monitoring, and a proper payment provider.

## Requirements
- Node.js 18 or later
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code (recommended)

## 1. Configure the backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and set your MongoDB connection string and a long random JWT secret. For local MongoDB, the example URI works if MongoDB is running on your computer.

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. Test `http://localhost:5000/api/health` in your browser.

## 2. Start the frontend
Open a second terminal in `frontend`:

```bash
npm install
```

Copy `.env.example` to `.env` (the default API address is correct for local development), then run:

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 3. Test the app
1. Open the app and browse the sample movies.
2. Choose **Book now**, then select a showtime.
3. Register an account or sign in.
4. Select up to 10 available seats and confirm the booking.
5. Open **My bookings** to view the booking reference and ticket details.
6. Open the same show from another browser/account to verify booked seats are disabled.

## Project structure
```text
imovies-project/
├── backend/
│   ├── src/config/       # MongoDB connection
│   ├── src/middleware/   # JWT authentication
│   ├── src/models/       # User, Movie, Show, Booking schemas
│   ├── src/routes/       # Auth, movie, booking APIs
│   ├── src/server.js
│   └── src/seed.js
└── frontend/
    └── src/              # React app and responsive CSS
```

## Main API routes
| Method | Route | Purpose | Login required |
|---|---|---|---|
| GET | `/api/health` | API health check | No |
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Sign in | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/movies` | List/search movies | No |
| GET | `/api/movies/:id/shows` | List upcoming shows | No |
| POST | `/api/bookings` | Reserve seats | Yes |
| GET | `/api/bookings/mine` | Current user's bookings | Yes |

## Suggested improvements for a stronger portfolio
- Add an admin-only dashboard to create movies and shows.
- Add email confirmation and password reset.
- Integrate a payment gateway only in a properly secured production environment.
- Add automated API tests and screenshots to the README.
- Deploy the API and frontend, then add the real demo and GitHub repository URLs to Skillwallet.

## Deployment overview
- Database: create a MongoDB Atlas cluster and set `MONGO_URI` in the backend host.
- Backend: deploy the `backend` folder to a Node-compatible host; configure `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `PORT`.
- Frontend: deploy the `frontend` folder to a static hosting service; set `VITE_API_URL` to the deployed backend URL plus `/api`.
- Update backend `CLIENT_URL` to the deployed frontend origin and redeploy.

Never commit `.env` files or publish your JWT secret.
