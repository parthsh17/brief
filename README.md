# Brief

Brief is a financial-news dashboard that turns RSS headlines into concise, explainable market intelligence.

## What it does

- Collects articles from approved financial RSS sources.
- Uses Groq to generate summaries, sentiment, confidence, topics, entities, actionable insights, and rating explanations.
- Shows a protected React dashboard with sentiment and multi-source filters.
- Provides original article links and detailed article views.
- Tracks ingestion, processing, API-call, source, token, and cleanup metrics.
- Deletes articles after 24 hours.

Google OAuth is the only sign-in method. Authentication uses a signed HttpOnly session cookie. There are no passwords, JWTs, refresh tokens, settings pages, search, trending, chat, RAG, embeddings, or ChromaDB.

## Technology

- React 19 + JSX + Vite
- Tailwind CSS
- FastAPI
- MongoDB Atlas
- Redis Cloud
- Google OAuth
- Groq structured analysis
- APScheduler

## Repository contents

```text
backend/       FastAPI API, OAuth, workers, persistence, and tests
frontend/      React/Vite/Tailwind client
scripts/       Cross-platform local development launcher
agents.md      Instructions and architecture reference for coding agents
```

This project uses local development commands only. Docker configuration and GitHub Actions workflows are not included.

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

## Project documentation

- [agents.md](./agents.md) — full guide for coding agents.

Never commit secrets, `.env` files, generated build output, or database service data.
