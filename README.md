# Microbial Evolution Simulator under Antibiotic Stress

A biomedical research-style web platform simulating bacterial reproduction,
mutation, and selection under antibiotic pressure, with a machine-learning
layer that forecasts resistance trends. Built for a Final Year Engineering
Major Project.

```
Landing Page  →  How To Use  →  Simulation Dashboard
```

## Stack

- **Frontend:** React, Tailwind CSS, Three.js/WebGL, Framer Motion, Recharts, React Router
- **Backend:** Python, Flask
- **Science:** NumPy, Pandas, Scikit-learn
- **Database:** MongoDB Atlas (experiment-level storage only)

## Project Structure

```
microbial-evolution-simulator/
├── frontend/                  React app (Vite)
│   └── src/
│       ├── api/               Axios client for the Flask API
│       ├── context/           Global simulation state (polling, controls)
│       ├── components/        Navbar, Footer, PetriDish3D, panels, charts
│       └── pages/              Landing, HowToUse, Dashboard
└── backend/                    Flask app
    ├── app.py                  API routes
    ├── config.py                Env-based configuration
    ├── simulation/engine.py    Core evolution engine (grid, cells, antibiotic field)
    ├── ml/predictor.py          Resistance forecasting (scikit-learn)
    └── db/mongo.py              MongoDB Atlas connector + in-memory fallback
```

## Getting Started

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env with your MongoDB Atlas URI (optional — see below)

python app.py
```

The API runs at `http://localhost:5000`.

**MongoDB is optional for local development.** If `MONGO_URI` is left as the
placeholder or Atlas is unreachable, the backend automatically falls back to
in-memory storage for the current process (`MONGO_OPTIONAL=1` in `.env`).
For a persistent research log across restarts, create a free MongoDB Atlas
cluster and paste its connection string into `.env`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. Vite proxies `/api/*` to the Flask backend
automatically (see `vite.config.js`), so no CORS configuration is needed in
development beyond what's already in `backend/config.py`.

### 3. Build for production

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host, and deploy `backend/` behind a
WSGI server (gunicorn/uwsgi) with `FLASK_DEBUG=0` and a real `SECRET_KEY`.

## API Reference

| Method | Endpoint                        | Description                                |
|--------|----------------------------------|---------------------------------------------|
| POST   | `/api/start`                    | Create a new experiment with given config  |
| POST   | `/api/step`                     | Advance one or more generations            |
| GET    | `/api/state?experiment_id=`     | Current cells, antibiotic field, stats     |
| GET    | `/api/prediction?experiment_id=`| ML forecast for the experiment             |
| GET    | `/api/history?experiment_id=`   | Full generation-by-generation history      |
| GET    | `/api/report?experiment_id=&format=json\|csv` | Download a full experiment report |
| POST   | `/api/reset`                    | Clear an experiment from memory            |

## How the science is separated from the ML

`simulation/engine.py` has no knowledge of machine learning — it only
produces per-generation snapshots (population, average resistance,
mutation/death counts, hotspot counts). `ml/predictor.py` reads that history
after the fact and fits a polynomial regression to forecast where average
resistance is heading, estimate the generation at which a resistant colony
dominates, and score antibiotic effectiveness. This mirrors the spec:
*simulation generates data → ML analyzes it → ML predicts*, with the engine
never being steered by the model.

## Design System

| Token          | Value                          |
|----------------|---------------------------------|
| Deep Navy      | `#0B1220`                       |
| Dark Charcoal  | `#171B21`                       |
| Medical White  | `#F4F6F9`                       |
| Royal Gold     | `#D4AF37` / `#C89B3C` / `#B8860B` |
| Soft Cyan      | `#6FD8E8`                       |
| Emerald Accent | `#2ECC91`                       |
| Display font   | Cinzel                          |
| Body font      | Inter                           |
| Data/UI font   | Manrope                         |

## Notes for your milestones

This scaffold implements every page and API route from the spec end-to-end
with working (not mocked) simulation logic and ML predictions. Suggested
next steps, in order:

1. Replace the hero video and lab carousel image placeholders with your own footage/photos.
2. Add authentication if multiple users/experiments need to be isolated.
3. Swap the linear/polynomial ML model for a more sophisticated time-series model if your report requires it.
4. Add PDF report generation (a `reportlab` dependency is already included in `requirements.txt` for this).
5. Deploy: frontend to Vercel/Netlify, backend to Render/Railway, database to MongoDB Atlas free tier.
