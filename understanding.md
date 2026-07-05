# AlphaCRM — Understanding the Codebase

## What is it?
A full-stack CRM (Customer Relationship Management) app. Sales teams use it to track contacts (people they sell to) and deals (sales in progress). Built as a portfolio and learning project covering backend, database, frontend, and full DevOps deployment to AWS.

---

## The Big Picture

```
Browser (React frontend)          ← what the user sees, runs on port 5173
       ↕ HTTP requests
Express backend (Node.js)         ← business logic, security, port 3000
       ↕ Prisma (JS → SQL translator)
PostgreSQL database               ← permanent storage, port 5432 (in Docker)
```

The browser can't be trusted with sensitive work — anyone can tamper with it. So password checking, data saving, and permission rules all live on the backend. The database stores data permanently (unlike the server's RAM which wipes on restart).

---

## What We've Built

### Phase 1 — Setup ✅
Installed VS Code, Git, Node.js, Docker Desktop. Created the GitHub repo with `frontend/` and `backend/` folders. Learned the git `add → commit → push` loop and why `.gitignore` exists (to keep `node_modules/` and `.env` out of GitHub).

---

### Phase 2 — Backend (Express server) ✅

**What it does:** A running Node.js + Express server with one working endpoint: `GET /api/health → {"status":"ok"}`. This health endpoint exists so Docker and Kubernetes can automatically ping it later to check if the app is alive.

**Key files:**

`backend/src/index.js` — the entry point. Node runs this first. It:
- Loads `.env` with `import 'dotenv/config'` (must be first line)
- Creates the Express app with `const app = express()`
- Registers middleware with `app.use()`
- Mounts the health router under `/api`
- Starts the server with `app.listen(PORT, callback)`

`backend/src/routes/health.routes.js` — the receptionist. Maps `GET /health` to the `getHealth` function. Keeps URL definitions separate from logic.

`backend/src/controllers/health.controller.js` — the worker. Receives `req` (everything the client sent — read from it) and `res` (tools to send a response — write to it). Calls `res.json({ status: 'ok' })` which converts the object to JSON and sends it with HTTP 200.

`backend/.env` — secret config values. **Never committed.** Contains `PORT` and `DATABASE_URL` (which has the database password).

`backend/.env.example` — safe template with placeholder values. **Is committed.** Tells teammates what variables they need to set up.

`backend/package.json` — project passport. Lists dependencies, devDependencies, and scripts (`npm start` for production, `npm run dev` for development with auto-restart via nodemon). `"type":"module"` enables modern `import` syntax.

**Key concepts:**

**Middleware** — code that runs on every request before it reaches the endpoint, in order. Like airport checkpoints.
- `cors()` — tells browsers to allow requests from the frontend (a different port). Without it, the browser blocks the request.
- `express.json()` — parses the request body from raw text into `req.body` as a JavaScript object.

**Routes vs Controllers** — routes answer "what URLs exist and who handles them." Controllers answer "what do we actually do." Kept separate so each file has one job.

**Environment variables** — config values stored outside code. Read via `process.env.KEY`. Never hardcode secrets in code — if pushed to GitHub, bots harvest them within seconds.

---

### Phase 3 — Database (PostgreSQL + Prisma) ✅

**What it does:** A PostgreSQL database running in a Docker container, with three tables (User, Contact, Deal) created via Prisma migrations and populated with sample seed data.

**Key files:**

`backend/prisma/schema.prisma` — the blueprint. Defines all tables as Prisma `model` blocks, enums (fixed value lists), and relationships. This is the source of truth for the database structure.

`backend/prisma/migrations/` — SQL history. Every time you change the schema and run `npx prisma migrate dev`, Prisma generates the SQL and saves it here as a timestamped file. **Always committed** — this is what makes the database reproducible on any machine.

`backend/prisma/seed.js` — inserts sample data for development (3 users, 3 contacts, 3 deals). Run with `npx prisma db seed`. Not used in production.

`backend/prisma.config.ts` — Prisma settings file. Tells Prisma where the schema is, where migrations live, and reads `DATABASE_URL` from `.env` to connect to the database.

**The three tables and their relationships:**

```
User
  id, name, email (unique), passwordHash, role (ADMIN/MANAGER/SALES_REP)
  createdAt, updatedAt

Contact
  id, name, email?, phone?, company?   ← ? means optional (can be empty)
  ownerId → User.id                    ← foreign key: belongs to one User
  createdAt, updatedAt

Deal
  id, title, value?, stage (LEAD/QUALIFIED/PROPOSAL/WON/LOST)
  contactId → Contact.id               ← foreign key: belongs to one Contact
  ownerId → User.id                    ← foreign key: belongs to one User
  createdAt, updatedAt
```

Relationship diagram:
```
User (1) ──── owns many ──── Contact (many)
  │                               │
  └──── owns many ──── Deal ──────┘ (each deal belongs to one contact)
```

**Key concepts:**

**Docker container** — a sealed box containing PostgreSQL and everything it needs. Starts with one command, identical on every machine, disposable. The `-v` volume flag means data survives container restarts (stored on disk, not inside the container).

**Prisma** — a translator between JavaScript and SQL. You write `prisma.user.findMany()` and Prisma writes the SQL for you. Three parts: Schema (blueprint) → Migrate (builds tables) → Client (queries the database in your code).

**Migration** — a recorded, versioned change to the database structure. Like a Git commit but for your schema. Run `npx prisma migrate dev --name <description>` every time you change `schema.prisma`.

**Foreign key** — a column that stores another table's primary key, creating a link. `ownerId` in Contact stores a User's `id`. PostgreSQL enforces this — you can't save a Contact with an `ownerId` that doesn't exist in User.

**Enum** — a fixed list of allowed values. `Role` can only be ADMIN, MANAGER, or SALES_REP. The database rejects anything else.

**Seed** — fake sample data for development so you have something to look at and test with.

---

## How a Request Flows (full journey)

```
Browser: GET http://localhost:3000/api/health

  index.js receives the request
    → cors() runs: adds "outside callers allowed" header
    → express.json() runs: checks for body data, parses it (none here)
    → app.use('/api'): URL starts with /api, hand to healthRouter

  health.routes.js
    → router.get('/health'): method=GET, path=/health → match!
    → calls getHealth

  health.controller.js
    → res.json({ status: 'ok' })
    → converts to JSON string, sends HTTP 200

Browser receives: {"status":"ok"}
```

---

## The DATABASE_URL Explained

```
postgresql://alphacrm:devpassword@localhost:5432/alphacrm_dev?schema=public
     ↑           ↑         ↑          ↑          ↑              ↑
  database     username  password   host        port         database name
   type                           (this machine)
```

Every piece matches what was set in the `docker run` command. Lives in `.env` because it contains the real password. `.env.example` has `USER:PASSWORD` placeholders instead.

---

## How to Check Things

| What | Command |
|------|---------|
| Run the backend | `npm run dev` (inside `backend/`) |
| Is Docker container running? | `docker ps` |
| Start/stop the database | `docker start alphacrm-postgres` / `docker stop alphacrm-postgres` |
| Browse database visually | `npx prisma studio` → http://localhost:5555 |
| Query database with SQL | `docker exec -it alphacrm-postgres psql -U alphacrm -d alphacrm_dev` |
| Regenerate Prisma client | `npx prisma generate` |
| Security scan | `npm audit` |
| Test health endpoint | `curl http://localhost:3000/api/health` |

---

## What's Next

| Phase | What |
|-------|------|
| 4 | Auth — `POST /api/auth/register`, `POST /api/auth/login`, JWT tokens, route protection, role-based access |
| 5 | Frontend — React + Vite + Tailwind, login page, contacts list, Kanban deal board |
| 6 | DevOps — Docker Compose, GitHub Actions CI/CD, Terraform, Kubernetes on AWS EKS, Prometheus + Grafana |

---

## Glossary

| Term | Plain English |
|------|--------------|
| API | The menu of things the backend can do |
| REST | Convention: GET=read, POST=create, PUT=update, DELETE=remove |
| Endpoint | One specific URL + HTTP method (e.g. GET /api/health) |
| Middleware | Code that runs on every request before the endpoint |
| Route | Maps a URL to a controller function |
| Controller | The function that handles a request and sends a response |
| `req` | Everything the client sent — you read from it |
| `res` | Tools to send a response — you write to it |
| `.env` | File holding secret config values, never committed |
| Port | A numbered "door" on a computer for network connections |
| Docker container | A sealed, portable box running a program |
| Docker volume | Persistent storage that survives container restarts |
| ORM | Library that translates JavaScript into SQL (Prisma is our ORM) |
| Schema | The design of your database tables |
| Migration | A recorded change to the database structure |
| Primary key | The unique ID for each row in a table |
| Foreign key | A column pointing to another table's primary key |
| Enum | A fixed list of allowed values for a column |
| Seed | Sample data inserted for development |
| JWT | A signed token that proves a user is logged in (Phase 4) |
| CORS | Browser security rule; cors() middleware lifts the restriction |
