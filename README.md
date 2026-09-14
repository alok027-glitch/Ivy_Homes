# Ivy Homes Assignment Frontend

🚀 **Live Deployment:** [https://ivy-homes-phi-two.vercel.app](https://ivy-homes-phi-two.vercel.app)

## How to run it

The easiest way to run the project is to simply visit the live Vercel deployment linked above. 

If you prefer to evaluate the project locally, it requires absolutely no build tools (`npm` is not required). Serve the directory with a standard HTTP server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000/index.html`. 

## How I worked out which parts of the documentation to distrust, and what I did about it

1. **Broken Pagination Parameter:** The documentation implied standard pagination, but the backend API either ignored the `page` parameter or it didn't behave as expected. After testing the API via cURL, I distrusted the standard page index and discovered `offset` worked correctly. I built the client-side pagination strictly around `offset`.
2. **Missing Endpoints:** The API reference indicated features like `/v1/analytics/summary` and `/v1/favourites`. After probing the live API and receiving `404 Not Found` errors for both, I distrusted the backend's completeness. To fix this without breaking the UI, I pre-computed the analytical aggregates during the data engineering phase to serve statically in the Insights dashboard, and completely rebuilt the Favorites functionality using `localStorage` on the frontend.
3. **Flawed Partial Filtering:** I noticed the `locality` filter returned 0 results on the backend when provided with a partial string (e.g. searching for "Andhe"). I distrusted the API's search capabilities and removed the `locality` query from the backend request entirely, opting instead for a highly robust client-side filter using JavaScript's `.includes()`.

## What I checked that turned out to be fine (Hypotheses that did not pan out)

1. **The "All API Filters are Broken" Hypothesis:** After discovering the backend failed to handle partial `locality` searches, I initially hypothesized that the entire API filtering system was ignored or broken, leading me to believe I would need to fetch the entire 4,750-item dataset to the client for filtering. However, upon testing, I discovered that `price_min`, `price_max`, `bedroom`, and `furnishing` filters worked perfectly fine on the server. My hypothesis didn't pan out, and I successfully leveraged a hybrid approach: delegating exact matches (like price/BHK) to the API, while handling partial matches (locality) on the client.
2. **The "Denomination Mismatch" Hypothesis:** When testing the min/max price filters dynamically, they appeared broken (returning 0 properties). I hypothesized that the database stored prices in "Lakhs" (e.g. `50`) while I was comparing against raw integers. Upon dumping the JSON, my hypothesis didn't pan out—prices *were* correctly stored in their full numerical denomination (e.g., `41740000`). The issue was purely UX-related (users entering "100" into the box), which I easily fixed by adding clear `(₹)` placeholder denominations instead of over-engineering backend data conversions.
3. **The "Babel Environment Variable" Hypothesis:** I hypothesized that utilizing modern `import.meta.env` syntax in a zero-build Babel Standalone environment would result in an uncatchable parser crash, forcing me to build a custom runtime `.env` fetcher. This hypothesis didn't pan out completely—by safely wrapping the variable assignments in a defensive try/catch architecture, I was able to cleanly support Vite-standard environment variables without breaking the raw browser parser.

## What I would do with another two days

1. **Migrate to Next.js / Vite:** The current zero-build Babel Standalone setup is great for quick evaluation, but migrating to a modern bundler would enable Server-Side Rendering (SSR), better SEO, and optimized asset chunking.
2. **Build a BFF (Backend-For-Frontend):** Currently, the API key is exposed to the browser. I would build a lightweight Node.js/Express proxy server to securely route API requests and keep the `API_KEY` entirely hidden from the client.
3. **Advanced Data Visualizations:** The Insights dashboard uses clean metric cards. Given more time, I would integrate a charting library like Chart.js or Recharts to graphically visualize property price distributions across different localities and project completion statuses.
4. **Persistent State Management:** I would replace `localStorage` with a robust global state manager (like Redux or Zustand) or use React Query for sophisticated caching, optimistic UI updates, and background data fetching for the listings.
