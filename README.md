# NoteApp — Real-Time Team Collaboration Notes Platform

A full-stack collaborative notes application with JWT authentication, team RBAC, real-time editing via Socket.IO, Redis caching, and PostgreSQL.

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, React Router, Zustand, TanStack Query, TailwindCSS, Socket.IO Client |
| Backend | Node.js, Express, Sequelize, PostgreSQL, Redis, Socket.IO, JWT |
| Infrastructure | Docker, Docker Compose |

## Prerequisites

- **Node.js** 20+ (22+ recommended)
- **PostgreSQL** 14+ (local or Docker)
- **Redis** 7+ (optional in development — server starts without it)
- **npm**

## Quick Start

### 1. Clone and install

```bash
cd noteapp
npm run install:all
```

Or install separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment setup

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` for your database credentials.

**Local PostgreSQL (port 5432):**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=noteapp_db
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/noteapp_db
```

**Docker PostgreSQL (port 5433):**

```bash
docker compose up postgres redis -d
```

Use the credentials from `docker-compose.yml` and set `DB_PORT=5433`.

### 3. Database migrate & seed

From project root:

```bash
npm run migrate
npm run seed
```

Or from `backend/`:

```bash
cd backend
npm run migrate
npm run seed
```

### 4. Run development servers

**Terminal 1 — Backend:**

```bash
npm run dev:backend
# API: http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```

**Terminal 2 — Frontend:**

```bash
npm run dev:frontend
# App: http://localhost:5173
```

## NPM Scripts

### Root (`noteapp/`)

| Command | Description |
|---------|-------------|
| `npm run migrate` | Run Sequelize migrations |
| `npm run migrate:down` | Rollback last migration |
| `npm run seed` | Seed demo users, team, and notes |
| `npm run dev:backend` | Start API with hot reload |
| `npm run dev:frontend` | Start Vite dev server |
| `npm run start:backend` | Start API (production mode) |
| `npm run install:all` | Install backend + frontend deps |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with `--watch` |
| `npm run start` | Start API |
| `npm run migrate` | Apply migrations |
| `npm run migrate:down` | Rollback one migration |
| `npm run seed` | Seed database |
| `npm test` | Run Jest tests |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Demo Accounts

After seeding, log in with:

| Email | Password | Role |
|-------|----------|------|
| alice@noteapp.com | Password123! | Team owner |
| bob@noteapp.com | Password123! | Editor |
| carol@noteapp.com | Password123! | Viewer |

Re-run `npm run seed` anytime to reset demo passwords.

## Docker (full stack)

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6379 |

Run migrations inside the backend container after first start:

```bash
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

## Project Structure

```
noteapp/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, logger, env
│   │   ├── controllers/     # HTTP handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Sequelize data access
│   │   ├── models/          # Sequelize models
│   │   ├── database/migrations/  # Sequelize migrations
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── sockets/         # Socket.IO handlers
│   │   └── utils/
│   └── .env
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── stores/          # Zustand
│       └── services/        # API client
├── docker-compose.yml
└── package.json
```

## Environment Variables

See `backend/.env.example` for all options. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | `3001` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` or `5433` (Docker) |
| `DB_NAME` | Database name | `noteapp_db` |
| `DB_USER` | Database user | — |
| `DB_PASSWORD` | Database password | — |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | JWT signing key | change in production |
| `JWT_REFRESH_SECRET` | Refresh token key | change in production |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |

## Features

- **Auth** — Register, login, logout, forgot/reset password, profile, avatar
- **Notes** — CRUD, archive, pin, favorite, duplicate, version history, search
- **Teams** — Create teams, invite members, role-based access (owner/admin/editor/viewer)
- **Team notes** — Assign notes to a team on creation; all team members can access
- **Sharing** — Share notes by email with read/write/owner permission
- **Tags** — Create tags and assign them to notes
- **Real-time** — Socket.IO live editing, presence avatars, and typing indicators via Socket.IO
- **Notifications** — In-app notifications with Redis-backed unread count

## API Documentation

Swagger UI: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Troubleshooting

**Migration auth failed**

- Ensure PostgreSQL is running and `.env` credentials match your instance.
- If local Postgres uses port 5432, set `DB_PORT=5432` (not 5433).

**`relation "users" does not exist`**

- Run `npm run migrate` from `backend/` or project root.

**Login fails after seed**

- Run `npm run seed` again to refresh passwords, then restart the backend.

**Notes not appearing**

- Restart the backend after pulling latest code.
- Check browser network tab — `GET /api/notes` should return 200.

**Redis connection errors**

- In development the server continues without Redis; start Redis for caching and pub/sub: `docker compose up redis -d`

## License

MIT
# Noteapp
