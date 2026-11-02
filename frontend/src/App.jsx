import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Ticket, Search, UserRound, LogOut, X, CalendarDays, Clock3, MapPin, Armchair, Film, CheckCircle2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SEATS = Array.from({ length: 6 }, (_, row) => Array.from({ length: 12 }, (_, col) => `${String.fromCharCode(65 + row)}${String(col + 1).padStart(2, '0')}`));
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const dateTime = value => new Date(value).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function App() {
  const [movies, setMovies] = useState([]), [search, setSearch] = useState(''), [user, setUser] = useState(() => JSON.parse(localStorage.getItem('imovies_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('imovies_token') || ''), [authOpen, setAuthOpen] = useState(false), [authMode, setAuthMode] = useState('login');
  const [selected, setSelected] = useState(null), [shows, setShows] = useState([]), [show, setShow] = useState(null), [bookedSeats, setBookedSeats] = useState([]), [chosen, setChosen] = useState([]);
  const [myBookings, setMyBookings] = useState([]), [showBookings, setShowBookings] = useState(false), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);

  async function api(path, options = {}) {
    const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Something went wrong.');
    return data;
  }
  async function loadMovies() { try { setMovies(await api('/movies')); } catch (e) { setMessage(e.message); } }
  useEffect(() => { loadMovies(); }, []);
  useEffect(() => { if (token) localStorage.setItem('imovies_token', token); else localStorage.removeItem('imovies_token'); if (user) localStorage.setItem('imovies_user', JSON.stringify(user)); else localStorage.removeItem('imovies_user'); }, [token, user]);
  const filtered = useMemo(() => movies.filter(m => `${m.title} ${m.genre} ${m.language}`.toLowerCase().includes(search.toLowerCase())), [movies, search]);

  async function openMovie(movie) {
    setSelected(movie); setShow(null); setChosen([]); setBookedSeats([]); setMessage('');
    try { setShows(await api(`/movies/${movie._id}/shows`)); } catch (e) { setMessage(e.message); }
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }
  function logout() { setToken(''); setUser(null); setShowBookings(false); setMessage('You have been logged out.'); }
  async function submitAuth(e) {
    e.preventDefault(); setBusy(true); setMessage(''); const form = new FormData(e.currentTarget);
    try {
      const data = await api(`/auth/${authMode}`, { method: 'POST', body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password') }) });
      setToken(data.token); setUser(data.user); setAuthOpen(false); setMessage(`Welcome${data.user.name ? `, ${data.user.name}` : ''}!`);
    } catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }
  async function chooseShow(s) { setShow(s); setChosen([]); try { const fresh = await api(`/movies/${selected._id}/shows`); const current = fresh.find(x => x._id === s._id); setBookedSeats(current?.bookedSeats || []); setShows(fresh); } catch (e) { setMessage(e.message); } }
  function toggleSeat(seat) { if (bookedSeats.includes(seat)) return; setChosen(old => old.includes(seat) ? old.filter(x => x !== seat) : old.length >= 10 ? old : [...old, seat]); }
  async function bookSeats() {
    if (!token) { setAuthMode('login'); setAuthOpen(true); return; }
    if (!show || !chosen.length) return;
    setBusy(true); setMessage('');
    try { const booking = await api('/bookings', { method: 'POST', body: JSON.stringify({ showId: show._id, seats: chosen }) }); setMessage(`Booking confirmed! Your booking code is ${booking.bookingCode}.`); setBookedSeats(old => [...old, ...chosen]); setChosen([]); }
    catch (e) { setMessage(e.message); if (e.message.includes('booked')) chooseShow(show); } finally { setBusy(false); }
  }
  async function openBookings() { if (!token) { setAuthOpen(true); return; } try { setMyBookings(await api('/bookings/mine')); setShowBookings(true); } catch (e) { setMessage(e.message); } }

  return <div className="app-shell">
    <nav className="navbar navbar-expand-lg navbar-dark topbar"><div className="container"><a className="navbar-brand brand" href="#home"><span className="brand-icon"><Ticket size={20}/></span> IMOVIES<span className="brand-dot">.</span></a><div className="d-flex align-items-center gap-2 ms-auto"><button className="btn nav-link-btn" onClick={openBookings}>My bookings</button>{user ? <><span className="user-label d-none d-sm-inline">Hi, {user.name}</span><button className="btn icon-btn" title="Log out" onClick={logout}><LogOut size={17}/></button></> : <button className="btn btn-outline-light login-btn" onClick={() => {setAuthMode('login');setAuthOpen(true)}}><UserRound size={16}/> Sign in</button>}</div></div></nav>
    <main id="home"><section className="hero"><div className="container hero-inner"><div className="hero-copy"><span className="eyebrow">YOUR SEAT. YOUR SHOW. YOUR MOMENT.</span><h1>Movies are better<br/><span>on the big screen.</span></h1><p>Find your next favourite film and book your seats in just a few clicks.</p><a href="#movies" className="btn primary-btn">Explore movies <span>→</span></a></div><div className="hero-art"><div className="ticket-art"><Film size={70}/><span>NOW SHOWING</span><strong>IMOVIES</strong><small>GOOD STORIES. GREAT SEATS.</small></div><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div></div></div></section>
    <section id="movies" className="container movie-section"><div className="section-heading"><div><span className="eyebrow">PICK YOUR ENTERTAINMENT</span><h2>Now showing</h2><p>Handpicked stories, ready for the big screen.</p></div><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies or genres..."/></div></div>
      <div className="row g-4">{filtered.map(movie => <div className="col-6 col-md-4 col-lg-3" key={movie._id}><article className="movie-card"><div className="poster-wrap"><img src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700'} alt={`${movie.title} poster`} onError={e => e.currentTarget.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700'}/><span className="rating">★ {movie.rating || 'N/A'}</span></div><div className="movie-info"><h3>{movie.title}</h3><p>{movie.genre} <span>•</span> {movie.duration} min</p><div className="movie-bottom"><span>{movie.language}</span><button onClick={() => openMovie(movie)}>Book now <span>→</span></button></div></div></article></div>)}{!filtered.length && <div className="empty-state">No movies found. Try another search.</div>}</div>
    </section>
    {selected && <section id="booking" className="booking-section"><div className="container"><div className="booking-header"><div><span className="eyebrow">MAKE IT A MOVIE NIGHT</span><h2>Book your tickets</h2><p>Select a showtime, then choose your favourite seats.</p></div><button className="close-booking" onClick={() => {setSelected(null);setShow(null)}}><X size={18}/> Close</button></div><div className="booking-panel"><div className="selected-movie"><img src={selected.poster} alt=""/><div><h3>{selected.title}</h3><p>{selected.genre} · {selected.duration} min · {selected.language}</p><span>★ {selected.rating || 'N/A'} / 10</span></div></div><div className="booking-content"><h4><CalendarDays size={18}/> Select a showtime</h4><div className="show-list">{shows.map(s => <button key={s._id} className={`show-chip ${show?._id===s._id?'active':''}`} onClick={() => chooseShow(s)}><strong>{new Date(s.startTime).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})}</strong><small>{new Date(s.startTime).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</small><small>{money(s.price)}</small></button>)}{!shows.length && <p className="muted">No upcoming shows are available. Run the seed command in the backend.</p>}</div>
      {show && <div className="seat-area"><div className="seat-title"><h4><Armchair size={18}/> Choose your seats</h4><span>Maximum 10 seats</span></div><div className="screen"><span>SCREEN THIS WAY</span></div><div className="seat-grid">{SEATS.map((row, ri) => <div className="seat-row" key={ri}><span className="row-label">{String.fromCharCode(65+ri)}</span>{row.map(seat => <button key={seat} aria-label={`Seat ${seat}`} title={seat} disabled={bookedSeats.includes(seat)} className={`seat ${bookedSeats.includes(seat)?'booked':chosen.includes(seat)?'chosen':''}`} onClick={() => toggleSeat(seat)}>{seat.slice(1)}</button>)}<span className="row-label">{String.fromCharCode(65+ri)}</span></div>)}</div><div className="seat-legend"><span><i className="legend-free"/> Available</span><span><i className="legend-chosen"/> Selected</span><span><i className="legend-booked"/> Booked</span></div><div className="booking-summary"><div><small>{chosen.length} seat(s) selected</small><strong>{money(chosen.length * show.price)}</strong></div><button className="btn primary-btn" disabled={!chosen.length || busy} onClick={bookSeats}>{busy?'Please wait...':token?'Confirm booking':'Sign in to book'} <span>→</span></button></div></div>}
      <div className="cinema-details"><span><MapPin size={15}/> {show?.cinema || 'IMovies Central Mall'}</span><span><Clock3 size={15}/> {show ? dateTime(show.startTime) : 'Choose a showtime'}</span></div></div></div></div></section>}
    </main>
    <footer><div className="container d-flex flex-wrap justify-content-between gap-2"><span className="brand">IMOVIES<span className="brand-dot">.</span></span><span>Made for movie lovers · Demo project</span><span>© {new Date().getFullYear()} IMovies</span></div></footer>

    {authOpen && <div className="modal-backdrop-custom" onMouseDown={e => e.target===e.currentTarget && setAuthOpen(false)}><div className="auth-modal"><button className="modal-close" onClick={() => setAuthOpen(false)}><X/></button><span className="eyebrow">WELCOME TO IMOVIES</span><h2>{authMode==='login'?'Welcome back':'Create your account'}</h2><p>{authMode==='login'?'Sign in to manage your movie bookings.':'Join us and book your next movie night.'}</p><form onSubmit={submitAuth}>{authMode==='register' && <label>Full name<input name="name" required placeholder="Your name"/></label>}<label>Email address<input type="email" name="email" required placeholder="you@example.com"/></label><label>Password<input type="password" name="password" minLength="6" required placeholder="At least 6 characters"/></label><button className="btn primary-btn w-100" disabled={busy}>{busy?'Please wait...':authMode==='login'?'Sign in':'Create account'}</button></form><div className="auth-switch">{authMode==='login'?"Don't have an account?":"Already have an account?"} <button onClick={() => setAuthMode(authMode==='login'?'register':'login')}>{authMode==='login'?'Register':'Sign in'}</button></div></div></div>}
    {showBookings && <div className="modal-backdrop-custom" onMouseDown={e => e.target===e.currentTarget && setShowBookings(false)}><div className="auth-modal bookings-modal"><button className="modal-close" onClick={() => setShowBookings(false)}><X/></button><span className="eyebrow">YOUR MOVIE PLANS</span><h2>My bookings</h2>{myBookings.length ? myBookings.map(b => <div className="booking-history" key={b._id}><div><strong>{b.show?.movie?.title || 'Movie'}</strong><small>{b.show ? dateTime(b.show.startTime) : ''}</small><small>Seats: {b.seats.join(', ')}</small></div><div className="history-price"><strong>{money(b.totalAmount)}</strong><small>{b.bookingCode}</small></div></div>) : <p className="muted mt-4">You have no bookings yet. Pick a movie and book your seats!</p>}</div></div>}
    {message && <div className="toast-message"><CheckCircle2 size={17}/><span>{message}</span><button onClick={() => setMessage('')}><X size={16}/></button></div>}
  </div>;
}
