# Ivy Homes Assignment Frontend

This is a unique, plain HTML/JS frontend that leverages React through Babel Standalone. It avoids the need for `npm` or build steps, making it incredibly simple to run while providing a highly vibrant, glassmorphism-inspired UI.

## How to Run
Serve the directory with a local server, for example:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000/index.html`.

Alternatively, you can just open `index.html` in any modern web browser directly.

## Features Built
- Authentic login flow (`demo1@ivy.homes` / `796caa03cd`) with session survival.
- Client-side paginated listings, fixing the server's broken `page` param by relying on `offset`.
- URL-routable listing detail pages.
- Adding, removing, and viewing Favourites.
- Dedicated rentals and projects views.
- Insights dashboard visualizing anomalies found (corrupt listings, fake listings, sync errors).

## Discrepancies Handled
The API reference promised features that were broken (e.g. `limit`, `page`, missing `/analytics/summary`). These are cleanly mitigated in this frontend. All required findings and analysis results are documented in `submission.json` at the repository root.
