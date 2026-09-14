# Ivy Homes Assignment Frontend

🚀 **Live Deployment:** [https://ivy-homes-phi-two.vercel.app](https://ivy-homes-phi-two.vercel.app)

This is a modern, lightweight Single Page Application (SPA) built using React (via Babel Standalone). It is designed to be highly responsive, featuring a premium glassmorphism-inspired UI while intentionally avoiding complex build steps for ease of evaluation.

## How to Run Locally

If you prefer to run the project locally instead of using the live deployment, you can serve the directory with a standard HTTP server:

```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000/index.html`.

## Features Implemented
- **Authentication**: Authentic login flow (`demo1@ivy.homes` / `796caa03cd`) with session survival.
- **Dynamic Property Browser**: Paginated listings with a custom robust filtering hybrid that seamlessly handles parameters ignored by the backend.
- **Routing**: URL-routable listing detail pages with full property information.
- **Favorites Management**: LocalStorage-powered "Add to Favourites" functionality with smooth toast notifications.
- **Dedicated Dashboards**: Separate views for Rentals and Projects.
- **Insights Analytics**: A dedicated dashboard visualizing data anomalies (corrupt listings, fake listings, sync errors) computed during the data engineering phase.

## Handling API Discrepancies
During development, several discrepancies between the provided API Reference and the live backend were discovered (e.g. broken `page` param, missing `/analytics/summary`, missing favorites endpoint). These issues were cleanly mitigated in this frontend implementation to ensure a flawless user experience. 

All required analytical findings, data engineering results, and discrepancy reports are formally documented in the `submission.json` file located at the repository root.
