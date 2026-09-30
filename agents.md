# Brief — AI agent guide

## Project purpose

Brief is a financial-news intelligence application. It collects approved RSS feeds, stores articles in MongoDB, enriches them with Groq structured analysis, and presents a React dashboard with sentiment, confidence, summaries, actionable insights, topics, entities, source filters, and rating explanations.

Google OAuth is the only authentication method. OAuth creates a signed HttpOnly session cookie containing the user ID. There are no JWTs, bearer tokens, passwords, refresh tokens, settings/preferences, search, trending, feedback, search history, RAG, embeddings, ChromaDB, or vector search features.

## Stack

- Frontend: React 19, JavaScript/JSX, Vite, Tailwind CSS, React Router, date-fns.
- Backend: Python, FastAPI, Motor, Pydantic, Authlib, Redis, APScheduler, feedparser, httpx, Groq.
- Databases/services: MongoDB Atlas, Redis Cloud, Google OAuth, Groq.
- Local orchestration: root Node script or Docker Compose. MongoDB Atlas and Redis Cloud are configured through `backend/.env`.

## Repository map

```text
backend/
  app/main.py              FastAPI app, middleware, scheduler, lifecycle
  app/api/auth.py          Google OAuth, session login/logout, current user
  app/api/articles.py      Authenticated feed, source filtering, article detail
  app/api/admin.py         Authenticated metrics endpoint
  app/api/health.py        MongoDB, Redis, Groq, and scheduler health checks
  app/auth.py              Session-cookie authentication dependency
  app/cache.py             Redis JSON cache and pattern invalidation
  app/db.py                MongoDB client/database lifecycle
  app/models.py            Article model and MongoDB document conversion
  app/repositories.py      Article persistence, queries, cleanup
  app/services/rss.py      RSS fetching and per-source status
  app/services/ai.py       Groq structured article analysis
  app/workers.py           Scheduled ingestion, enrichment, and cleanup jobs
  app/observability.py     Request logging and persisted API call counts
  app/sources.py           Single approved RSS source configuration
  app/schemas/             Pydantic analysis schemas
  tests/                   Backend pytest tests
frontend/
  src/App.jsx              Browser routes
  src/context/             Session-based auth provider
  src/pages/               Landing, login, dashboard, article, admin pages
  src/components/          Header, filters, cards, sentiment badge, route guard
  src/lib/mockData.js      Public landing-page preview data only
  src/test/                Vitest and Testing Library tests
  vite.config.mjs          Vite config and local API proxy
scripts/dev.mjs            Starts backend and frontend together on Windows/macOS/Linux
Dockerfile.backend         Production FastAPI image
Dockerfile.frontend        Production React/Nginx image
docker-compose.yml         Optional backend/frontend container orchestration
\.dockerignore             Docker build exclusions
docs/                      Supplemental project notes only
```

## Runtime behavior

The backend does not fetch or process articles during startup. Once the server is running, APScheduler runs:

- RSS ingestion every hour, capped at 10 new articles per run.
- Groq enrichment every two hours, capped at 10 pending articles per run.
- Article deletion every hour for records older than 24 hours.

The frontend runs on port `5173`; FastAPI runs on port `8000`. Vite proxies `/api` to FastAPI during local development. Browser requests use `credentials: 'include'`.

## Authentication flow

1. The user opens `/login` and chooses Google sign-in.
2. `/api/auth/google` redirects to Google.
3. `/api/auth/google/callback` creates or updates the MongoDB user.
4. FastAPI stores `user_id` in the signed session cookie.
5. `/api/auth/me` loads the current user from that session.
6. `/api/auth/logout` clears the session.

The session secret is configured with `SESSION_SECRET`. Never reintroduce local-storage auth or Authorization bearer headers.

## API routes

- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/articles/feed?sentiment=Bullish&sources=CNBC&sources=Reuters`
- `GET /api/articles/last-enriched`
- `GET /api/articles/{article_id}`
- `GET /api/admin/metrics`
- `GET /api/healthz`

All routes except OAuth start/callback and health require the session cookie.

## Article analysis contract

Groq returns structured fields validated by `AnalysisResult`:

- `key_points`: 3–5 summary points.
- `actionable_insight`: practical market implication.
- `rating_explanation`: why the sentiment and confidence were assigned.
- `sentiment.label`: Very Bullish, Bullish, Neutral, Bearish, or Very Bearish.
- `sentiment.confidence`: number from 0 to 1.
- `topics` and `entities`: structured context.

The dashboard normalizes Very Bullish/Very Bearish into Bullish/Bearish for display.

## Environment

Configure `backend/.env`:

```text
ENVIRONMENT=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=...
MONGODB_DATABASE=brief
REDIS_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-120b
SESSION_SECRET=...
```

The frontend optionally uses `VITE_API_URL`. Do not commit `.env` files or credentials.

## Commands

```bash
# From repository root
npm install
npm run dev

# Backend checks
cd backend
pytest
python -m compileall -q app tests

# Frontend checks
cd frontend
npm test -- --run
npm run build
npm run lint
```

## Agent rules

- Read this file before changing the project.
- Preserve JavaScript/JSX and Tailwind-only frontend conventions; do not add TypeScript.
- Use the shared `app/sources.py` configuration for RSS source names and URLs.
- Keep API response shapes compatible with `{ success: boolean, data: ... }`.
- Keep authentication session-based and use `credentials: 'include'` in browser calls.
- Keep scheduled work in `workers.py` and scheduler registration in `main.py`.
- Add or update tests when behavior changes.
- Do not restore removed Express, JWT, refresh-token, preference, search, trending, RAG, embedding, or ChromaDB functionality.
- Check `git diff` and preserve unrelated user changes before handoff.
