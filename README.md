# Brief

![CI](https://github.com/parthsh17/brief/actions/workflows/ci.yml/badge.svg)

Brief is a financial-news dashboard that turns RSS headlines into concise, explainable market intelligence.

## What it does

- Collects articles from approved financial RSS sources.
- Uses Groq to generate summaries, sentiment, confidence, topics, entities, actionable insights, and rating explanations.
- Shows a protected React dashboard with sentiment and multi-source filters.
- Provides original article links and detailed article views.
- Tracks ingestion, processing, API-call, source, token, and cleanup metrics.
- Deletes articles after 24 hours.

Google OAuth is the only sign-in method. Authentication uses a signed HttpOnly session cookie.

## Technology

- React 19 + JSX + Vite
- Tailwind CSS
- FastAPI
- MongoDB Atlas
- Redis Cloud
- Google OAuth
- Groq structured analysis
- APScheduler
- Docker

## Repository contents

```text
backend/       FastAPI API, OAuth, workers, persistence, and tests
frontend/      React/Vite/Tailwind client
scripts/       Cross-platform local development launcher
agents.md      Instructions and architecture reference for coding agents
```

## Docker setup

Docker is optional. The Compose setup runs the FastAPI backend and the production-built React frontend. MongoDB Atlas and Redis Cloud remain external services configured through `backend/.env`.

Before starting, create `backend/.env` and fill in the real MongoDB, Redis, Google OAuth, Groq, and session values. For Google OAuth, use this callback URL:

```text
http://localhost:8000/api/auth/google/callback
```

Build and start the containers from the repository root:

```bash
docker compose up --build
```

Open the application at `http://localhost:5173`. The frontend Nginx container proxies `/api` requests to the backend container. The backend is also available directly at `http://localhost:8000`.

Useful Docker commands:

```bash
# Start in the background
docker compose up --build -d

# Follow application logs
docker compose logs -f backend frontend

# Check running containers
docker compose ps

# Stop and remove the containers
docker compose down
```

Do not put credentials in `docker-compose.yml` or commit `backend/.env`.

## Local setup

Install Node.js and Python, then configure `backend/.env`:

```env
ENVIRONMENT=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_uri
MONGODB_DATABASE=brief
REDIS_URL=your_redis_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
SESSION_SECRET=use_a_long_random_secret
```

Add the exact callback URL to the Google OAuth client configuration.

Never commit `backend/.env`, OAuth credentials, database URLs, Redis credentials, or Groq keys.

## Run the application

From the repository root:

```bash
npm install
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Health check: `http://localhost:8000/api/healthz`

The backend does not fetch or process articles during startup. While it is running, it fetches RSS articles hourly and processes pending articles every two hours.

## Main pages

- `/` — public landing page.
- `/login` — Google sign-in.
- `/dashboard` — filtered article feed with explainability.
- `/articles/:id` — article details.
- `/admin` — authenticated metrics dashboard.

## Verification

```bash
cd backend
python -m compileall -q app tests
pytest

cd ../frontend
npm test -- --run
npm run build
npm run lint
```

## Publishing to GitHub

Create an empty repository on GitHub, then run from the project root:

```bash
git init
git add .
git commit -m "Initial Brief application"
git branch -M main
git remote add origin https://github.com/<username>/<repository>.git
git push -u origin main
```

Before pushing, verify that no credentials or local environment files are staged:

```bash
git status
git diff --cached
```

The root `.gitignore` excludes environment files, dependencies, virtual environments, build output, logs.

## GitHub Actions

The workflow at `.github/workflows/ci.yml` runs on pushes to `main` and pull requests targeting `main`.

It performs backend compilation and tests, frontend tests/lint/build checks, Docker Compose validation, and backend/frontend Docker image builds. Successful pushes to `main` publish images to GitHub Container Registry:

```text
ghcr.io/parthsh17/brief-backend:latest
ghcr.io/parthsh17/brief-frontend:latest
```

The workflow uses the automatically provided `GITHUB_TOKEN`; application credentials are not required for CI. Keep MongoDB, Redis, Google OAuth, Groq, and session secrets out of GitHub unless a future integration-test job explicitly needs them.

## Project documentation

- [agents.md](./agents.md) — full guide for coding agents.

Never commit secrets, `.env` files, generated build output, or database service data.
