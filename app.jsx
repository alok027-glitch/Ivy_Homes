const { useState, useEffect } = React;
let API_KEY = "";
let BASE_URL = "";
const ToastContext = React.createContext();

async function loadEnv() {
  try {
    const res = await fetch('.env');
    const text = await res.text();
    text.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim();
        if (key === 'API_KEY') API_KEY = val;
        if (key === 'BASE_URL') BASE_URL = val;
      }
    });
  } catch (e) {
    console.warn("Could not load .env file", e);
  }
}

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
function Listings({ token }) {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [furnishing, setFurnishing] = useState('');

  const fetchPage = async () => {
    setLoading(true);
    try {
      let query = `?offset=${offset}&limit=50`;
      if (locality) query += `&locality=${encodeURIComponent(locality)}`;
      if (bhk) query += `&bedroom=${bhk}`;
      if (minPrice) query += `&price_min=${minPrice}`;
      if (maxPrice) query += `&price_max=${maxPrice}`;
      if (furnishing) query += `&furnishing=${encodeURIComponent(furnishing)}`;

      const res = await fetch(`${BASE_URL}/v1/listings${query}`, {
        headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(data.results || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    setOffset(0);
  }, [locality, bhk, minPrice, maxPrice, furnishing]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPage();
    }, 300);
    return () => clearTimeout(delay);
  }, [offset, locality, bhk, minPrice, maxPrice, furnishing]);

  useEffect(() => {
    let res = items;
    if (locality) res = res.filter(i => i.locality && i.locality.toLowerCase().includes(locality.toLowerCase()));
    if (bhk) res = res.filter(i => String(i.bedroom) === String(bhk));
    
    const minVal = parseFloat(minPrice);
    const maxVal = parseFloat(maxPrice);
    
    if (!isNaN(minVal)) {
      res = res.filter(i => typeof i.price === 'number' && i.price >= minVal);
    }
    if (!isNaN(maxVal)) {
      res = res.filter(i => typeof i.price === 'number' && i.price <= maxVal);
    }
    
    if (furnishing) res = res.filter(i => i.furnishing === furnishing);
    setFiltered(res);
  }, [locality, bhk, minPrice, maxPrice, furnishing, items]);

  return (
    <div className="flex-col">
      <div className="card flex-row">
        <input className="input" placeholder="Locality" value={locality} onChange={e => setLocality(e.target.value)} />
        <input className="input" type="number" placeholder="BHK" value={bhk} onChange={e => setBhk(e.target.value)} />
        <input className="input" type="number" placeholder="Min Price (₹)" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <input className="input" type="number" placeholder="Max Price (₹)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        <select className="input" value={furnishing} onChange={e => setFurnishing(e.target.value)}>
          <option value="">Any Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully-furnished</option>
        </select>
      </div>
      {loading ? <div>Loading...</div> : (
        <>
          <div className="grid">
            {filtered.map(i => (
              <div className="card flex-col" key={i.listing_id}>
                <h3 style={{margin:0}}>{i.apartment_name}</h3>
                <div className="badge" style={{width: 'fit-content'}}>₹{i.price.toLocaleString()}</div>
                <div>{i.bedroom} BHK • {i.locality}</div>
                <a className="btn" href={`#/listings/${i.listing_id}`} style={{textAlign:'center', marginTop:'auto'}}>View Details</a>
              </div>
            ))}
          </div>
          <div className="flex-row" style={{justifyContent: 'center', marginTop: '2rem'}}>
            <button className="btn" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 50))}>Previous</button>
            <span>Showing {offset + 1} - {offset + items.length} of {total}</span>
            <button className="btn" disabled={offset + 50 >= total} onClick={() => setOffset(offset + 50)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
function Rentals({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await fetch(`${BASE_URL}/v1/rentals?offset=0&limit=50`, {
          headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setItems(data.results || []);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetchRentals();
  }, [token]);

  return (
    <div className="flex-col">
      <h2>Rentals</h2>
      {loading ? <div>Loading...</div> : (
        <div className="grid">
          {items.map(i => (
            <div className="card flex-col" key={i.listing_id}>
              <h3 style={{margin:0}}>{i.apartment_name || i.title}</h3>
              <div className="badge" style={{width: 'fit-content'}}>₹{i.price.toLocaleString()} / mo</div>
              <div>{i.bedroom} BHK • {i.locality}</div>
              <p style={{fontSize:'0.9rem', color:'#cbd5e1'}}>{cleanDescription(i.description)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Projects({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${BASE_URL}/v1/projects?offset=0&limit=50`, {
          headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setItems(data.results || []);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetchProjects();
  }, [token]);

  return (
    <div className="flex-col">
      <h2>Projects</h2>
      {loading ? <div>Loading...</div> : (
        <div className="grid">
          {items.map(i => (
            <div className="card flex-col" key={i.project_id}>
              <h3 style={{margin:0}}>{i.apartment_name}</h3>
              <div className="badge" style={{width: 'fit-content'}}>₹{(i.price_min*10000000).toLocaleString()} - ₹{(i.price_max*10000000).toLocaleString()}</div>
              <div>{i.locality} • {i.project_status}</div>
              <p style={{fontSize:'0.9rem'}}>Units: {i.total_units} • Available: {i.total_listings}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Favourites({ token }) {
  const [items, setItems] = useState([]);
  const showToast = React.useContext(ToastContext);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('ivy_favourites') || '[]');
    setItems(favs);
  }, [token]);

  const removeFav = (id) => {
    const favs = JSON.parse(localStorage.getItem('ivy_favourites') || '[]');
    const newFavs = favs.filter(f => f.listing_id !== id);
    localStorage.setItem('ivy_favourites', JSON.stringify(newFavs));
    setItems(newFavs);
    if(showToast) showToast('Removed from favourites');
  };

  return (
    <div className="flex-col">
      <h2>My Favourites</h2>
      <div className="grid">
        {items.map(i => (
          <div className="card flex-col" key={i.listing_id}>
            <h3 style={{margin:0}}>{i.apartment_name}</h3>
            <div className="badge" style={{width: 'fit-content'}}>₹{i.price?.toLocaleString()}</div>
            <div>{i.bedroom} BHK • {i.locality}</div>
            <div className="flex-row" style={{marginTop:'auto'}}>
              <a className="btn" href={`#/listings/${i.listing_id}`} style={{flex:1, textAlign:'center', textDecoration:'none'}}>View</a>
              <button className="btn btn-danger" onClick={() => removeFav(i.listing_id)}>Remove</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{color:'#cbd5e1'}}>No favourites saved yet.</div>}
      </div>
    </div>
  );
}
function Insights() {
  const anomalies = [
    { title: "Fake Listings", value: 11, desc: "Listings with impossible < 1L prices acting as lead gen." },
    { title: "Corrupt Records", value: 31, desc: "Listings with absurd data (e.g., negative price, area mismatches)." },
    { title: "API Discrepancies", value: 10, desc: "Critical discrepancies found against API Reference." },
    { title: "Projects out of sync", value: 419, desc: "Projects where total_listings differs from actual count." }
  ];

  const aggregates = {
    total_listings: 4750,
    active_listings: 3731,
    unique_properties: 4742,
    powai_rent_sum: "₹7,226,300",
    avg_price_sqft_2bhk: "₹62,985",
    costliest_project: "P50016 (₹124,400,000)",
    listings_last_7_days: 154
  };

  return (
    <div className="flex-col">
      <h2>Insights Dashboard</h2>
      
      <h3 style={{marginTop:'1.5rem', marginBottom:'0.5rem', color:'var(--primary)'}}>Data Anomalies Discovered</h3>
      <div className="grid">
        {anomalies.map((a, i) => (
          <div className="card" key={i} style={{borderColor: 'var(--danger)'}}>
            <h3 style={{margin:0, color:'var(--danger)'}}>{a.title}</h3>
            <div style={{fontSize:'2rem', fontWeight:'bold', margin:'1rem 0'}}>{a.value}</div>
            <p style={{fontSize:'0.9rem', color:'#cbd5e1', margin:0}}>{a.desc}</p>
          </div>
        ))}
      </div>

      <h3 style={{marginTop:'2rem', marginBottom:'0.5rem', color:'var(--primary)'}}>Pre-computed Aggregates</h3>
      <div className="grid">
        {Object.entries(aggregates).map(([k, v], i) => (
          <div className="card" key={i}>
            <div style={{fontSize:'0.9rem', color:'#94a3b8', textTransform:'capitalize'}}>{k.replace(/_/g, ' ')}</div>
            <div style={{fontSize:'1.25rem', fontWeight:'600', marginTop:'0.5rem'}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ListingDetail({ token, id }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = React.useContext(ToastContext);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${BASE_URL}/v1/listings/${id}`, {
          headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setListing(data);
      } catch(e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id, token]);

  const addFav = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('ivy_favourites') || '[]');
      if (!favs.some(f => f.listing_id === listing.listing_id)) {
        favs.push(listing);
        localStorage.setItem('ivy_favourites', JSON.stringify(favs));
        if(showToast) showToast('Added to favourites!');
      } else {
        if(showToast) showToast('Already in favourites!');
      }
    } catch(e) { console.error(e); }
  };

  if (loading) return <div>Loading...</div>;
  if (!listing) return <div>Listing not found</div>;

  return (
    <div className="card flex-col">
      <h2 style={{margin:0}}>{listing.apartment_name}</h2>
      <div className="badge" style={{width: 'fit-content'}}>₹{listing.price?.toLocaleString()}</div>
      <p>{cleanDescription(listing.description)}</p>
      <div className="grid" style={{gap: '0.5rem', marginBottom: '1rem'}}>
        <div><strong>Locality:</strong> {listing.locality}</div>
        <div><strong>BHK:</strong> {listing.bedroom}</div>
        <div><strong>Area:</strong> {listing.carpet_area} sqft</div>
        <div><strong>Furnishing:</strong> {listing.furnishing}</div>
        <div><strong>Contact:</strong> {listing.posted_by_name} ({listing.posted_by_contact})</div>
      </div>
      <div className="flex-row">
        <button className="btn" onClick={addFav}>Save to Favourites</button>
        <a className="btn" href="#/listings" style={{textDecoration:'none', background:'transparent', border:'1px solid var(--primary)', color:'var(--primary)'}}>Back to Listings</a>
      </div>
    </div>
  );
}

function App() {
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={showToast}>
      <MainApp />
      {toast && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px',
          background: 'var(--primary)', color: 'white',
          padding: '1rem 2rem', borderRadius: '8px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
          zIndex: 9999, animation: 'fadeIn 0.3s ease-out'
        }}>
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}

loadEnv().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
});
