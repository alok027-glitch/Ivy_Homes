const { useState, useEffect } = React;
const API_KEY = "IVY26-951527CC9D1C";
const BASE_URL = "https://solve.ivy.homes";
const ToastContext = React.createContext();

const cleanDescription = (desc) => {
  if (!desc) return '';
  return desc.replace(/Note from the Ivy Homes data team.*/gi, '').trim();
};

function MainApp() {
  const [token, setToken] = useState(localStorage.getItem('ivy_token') || null);
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!token && route !== '#/login') {
      window.location.hash = '#/login';
    }
  }, [token, route]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('ivy_token');
    window.location.hash = '#/login';
  };

  return (
    <div>
      <div className="navbar">
        <div className="brand">Ivy Homes</div>
        {token ? (
          <>
            <a href="#/listings" className={route.startsWith('#/listings') ? 'active' : ''}>Listings</a>
            <a href="#/rentals" className={route.startsWith('#/rentals') ? 'active' : ''}>Rentals</a>
            <a href="#/projects" className={route.startsWith('#/projects') ? 'active' : ''}>Projects</a>
            <a href="#/favourites" className={route.startsWith('#/favourites') ? 'active' : ''}>Favourites</a>
            <a href="#/insights" className={route.startsWith('#/insights') ? 'active' : ''}>Insights</a>
            <a onClick={logout} style={{marginLeft: 'auto'}}>Logout</a>
          </>
        ) : (
          <a href="#/login" style={{marginLeft: 'auto'}} className="active">Login</a>
        )}
      </div>
      <div className="container">
        {route === '#/login' && <Login setToken={setToken} />}
        {route === '#/listings' && <Listings token={token} />}
        {route === '#/rentals' && <Rentals token={token} />}
        {route === '#/projects' && <Projects token={token} />}
        {route === '#/favourites' && <Favourites token={token} />}
        {route === '#/insights' && <Insights token={token} />}
        {route.startsWith('#/listings/') && <ListingDetail token={token} id={route.split('/')[2]} />}
        {route === '#/' && token && (
          <div className="card">
            <h2>Welcome to Ivy Homes!</h2>
            <p>Select an option from the navigation bar above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Login({ setToken }) {
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('796caa03cd');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        const t = data.token || data.access_token;
        setToken(t);
        localStorage.setItem('ivy_token', t);
        window.location.hash = '#/listings';
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2>Login</h2>
      <form className="flex-col" onSubmit={handleLogin}>
        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// Placeholders for now, will implement in next commits
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MainApp />);