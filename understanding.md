# AlphaCRM — Understanding the Codebase

This document explains everything we have built so far: what it is, why it exists,
how each file works, and how everything connects together. Read this whenever you
feel lost or want to remind yourself of the big picture.

---

## What Is AlphaCRM?

AlphaCRM is a Customer Relationship Management web application. A CRM is a tool
that sales teams use to track their contacts (people they sell to), deals (sales
in progress), and pipeline (the stages each deal moves through).

We are building it from scratch as a portfolio and learning project. The finished
product will be a full-stack application with a React frontend, a Node.js backend,
a PostgreSQL database, and a deployment pipeline to AWS using Docker and Kubernetes.

---

## The Big Picture — Layers of the Application

Think of the application as three separate rooms in a building:

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER (the user's computer)                              │
│                                                             │
│  ┌─────────────────────┐                                    │
│  │   FRONTEND (React)  │  ← What the user sees and clicks  │
│  │   Port: 5173        │                                    │
│  └──────────┬──────────┘                                    │
│             │  HTTP requests (GET, POST, PUT, DELETE)       │
└─────────────┼───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVER (a computer running your backend code)              │
│                                                             │
│  ┌─────────────────────┐                                    │
│  │  BACKEND (Express)  │  ← Business logic, security rules │
│  │  Port: 3000         │                                    │
│  └──────────┬──────────┘                                    │
│             │  SQL queries                                  │
│  ┌──────────▼──────────┐                                    │
│  │  DATABASE (Postgres) │  ← Stores all data permanently   │
│  │  Port: 5432         │                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

**Right now we have only built the Backend layer.** The Frontend and Database
are planned for future phases.

---

## The Project Folder Structure

```
alphacrm/                        ← root of the entire project
│
├── .gitignore                   ← tells Git which files to never track
├── CLAUDE.md                    ← instructions for the AI assistant
│
├── frontend/                    ← (empty — built in a future phase)
│
└── backend/                     ← the Express server lives here
    ├── package.json             ← project config: name, scripts, dependencies
    ├── .env                     ← secret config values (NEVER committed to Git)
    ├── .env.example             ← safe template showing what .env should contain
    ├── node_modules/            ← downloaded libraries (NEVER committed to Git)
    │
    └── src/                     ← all source code lives here
        ├── index.js             ← entry point — starts the server
        ├── routes/
        │   └── health.routes.js ← defines what URLs exist
        └── controllers/
            └── health.controller.js ← defines what those URLs do
```

---

## What Every File Does

### `.gitignore` (at the root)

This file tells Git: "pretend these files and folders don't exist."

The two most important rules:

```
node_modules/
```
The `node_modules` folder contains all your downloaded libraries. It can be
hundreds of megabytes. Anyone who clones your repo runs `npm install` to
rebuild it themselves — so there is no reason to commit it. Committing it
would slow down every push and pull, and the folder is not meant to be
hand-edited.

```
.env
.env.*
```
The `.env` file holds secrets (passwords, API keys, ports). If you commit it
to GitHub, those secrets are permanently public — even if you delete the commit
later, bots scan GitHub in real time and harvest credentials.

```
!.env.example
```
The `!` means "except this one." `.env.example` is a safe template with fake
placeholder values that shows teammates what variables they need to configure.
It is committed because it contains no real secrets.

---

### `backend/package.json` — the project's passport

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

**`"type": "module"`** — tells Node.js to use modern ES module syntax (`import`/`export`)
instead of the older CommonJS syntax (`require`/`module.exports`). This is the
current standard and is what all modern JavaScript uses.

**`scripts`** — shortcuts for terminal commands:
- `npm start` runs `node src/index.js` — starts the server normally (used in production)
- `npm run dev` runs `nodemon src/index.js` — starts the server in development mode
  where it automatically restarts whenever you save a file

**`dependencies`** — libraries needed for the app to run in production:
- `express` — the web framework. Handles HTTP requests and responses.
- `dotenv` — reads your `.env` file and makes its values available in code.
- `cors` — middleware that lets browsers from a different origin (your frontend)
  make requests to this backend without being blocked.

**`devDependencies`** — libraries only needed during development, not shipped:
- `nodemon` — watches your files and restarts the server on save. You would never
  run this in production — in production the code doesn't change.

---

### `backend/.env` — local secret configuration

```
PORT=3000
```

An **environment variable** is a value stored outside your code. The convention is
`KEY=value`. Your code reads these at startup. This means you can change the
port (or later, the database password) without touching a single line of code —
and without committing a secret to Git.

This file exists only on your local machine. Every developer on the team has their
own copy. In production, a secret manager or platform (like AWS Secrets Manager or
Kubernetes Secrets) provides these values.

---

### `backend/.env.example` — the safe template

```
PORT=3000
```

Identical to `.env` here because `PORT=3000` is not a secret. In later phases
this file will grow to look like:

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/alphacrm
JWT_SECRET=your-secret-key-here
```

The actual `.env` will have real passwords. This file will always have
placeholder text — safe to commit.

---

### `backend/src/index.js` — the entry point (where everything starts)

```js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

This is the first file Node.js executes when you run `npm run dev`.

**Line 1: `import 'dotenv/config'`**
Must be the very first line. This triggers dotenv to immediately read your `.env`
file and load everything into `process.env` — Node's built-in global object for
environment variables. If this ran any later, code above it that tried to read
`process.env.PORT` would get `undefined`.

**Line 2-4: imports**
Brings in the tools this file needs. Note the `.js` extension on the local
import — required when using ES modules.

**Line 6: `const app = express()`**
Creates your Express application instance. This is the object you configure and
attach everything to. Think of it as "instantiating the kitchen."

**Line 7: `const PORT = process.env.PORT || 3000`**
Reads the port from the environment. The `|| 3000` is a fallback — if `PORT`
is not set in `.env` for any reason, default to 3000. This is good defensive
coding.

**Line 9-10: `app.use(...)`** — registering middleware
`app.use()` registers a piece of middleware that runs on every incoming request,
in order.

- `cors()` — adds HTTP headers that tell browsers: "requests from other origins
  (like your React frontend at port 5173) are allowed." Without this, browsers
  enforce the Same-Origin Policy and block the request automatically.
- `express.json()` — when a client sends a POST or PUT request with a JSON body,
  this automatically parses it so you can read it as `req.body` in your
  controllers. Without it, `req.body` would be `undefined`.

**Line 12: `app.use('/api', healthRouter)`**
Mounts the health router under the `/api` prefix. Any request whose URL starts
with `/api` is handed off to `healthRouter`. The router then matches the rest
of the URL. So `/api/health` matches.

**Line 14-16: `app.listen(...)`**
Starts the HTTP server. Node begins listening for incoming connections on the
given port. The callback function runs once when the server is ready — that's
when you see the startup message in the terminal.

---

### `backend/src/routes/health.routes.js` — the URL map

```js
import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', getHealth);

export default router;
```

A **Router** in Express is a mini-application that handles a slice of your URLs.
You define which URL patterns it responds to and which controller function handles
each one.

`router.get('/health', getHealth)` means:
- When a **GET** request arrives
- With the path `/health` (which, with the `/api` prefix from `index.js`, becomes `/api/health`)
- Call the `getHealth` function

**Why separate routes from controllers?** Single responsibility. The routes file
answers "what URLs exist." The controller answers "what do we do when that URL is
hit." As the app grows to dozens of endpoints, this separation keeps the code
organized and testable.

---

### `backend/src/controllers/health.controller.js` — the work

```js
export function getHealth(req, res) {
  res.json({ status: 'ok' });
}
```

Every controller function receives two arguments that Express provides:

- **`req`** (request) — everything the client sent: URL, headers, body, query
  string, URL parameters. You read from `req`.
- **`res`** (response) — methods to send a response back. You write to `res`.

`res.json({ status: 'ok' })` does two things:
1. Converts the JavaScript object to a JSON string: `{"status":"ok"}`
2. Sends it back with HTTP status `200 OK` and the header
   `Content-Type: application/json`

**Why does the health endpoint exist?**
When you deploy to Docker or Kubernetes later, those platforms automatically ping
`GET /api/health` every few seconds to ask "is this container still alive and
working?" If they get back `200 OK`, the container is considered healthy. If it
fails, Kubernetes automatically restarts the container. It is the most standard
first endpoint you build in any production backend.

---

## How a Request Flows Through the System

Here is what happens, step by step, when you visit
`http://localhost:3000/api/health` in a browser:

```
Browser
  │
  │  1. Sends HTTP GET request to http://localhost:3000/api/health
  │
  ▼
index.js — app.listen() receives the request
  │
  │  2. Request passes through middleware (in order):
  │     ├── cors()         → adds CORS headers to the response
  │     └── express.json() → checks if body is JSON, parses it (no body here)
  │
  │  3. app.use('/api', healthRouter)
  │     URL starts with /api → hand off to healthRouter
  │
  ▼
health.routes.js — router.get('/health', getHealth)
  │
  │  4. Method is GET, path is /health → match found
  │     Call getHealth function
  │
  ▼
health.controller.js — getHealth(req, res)
  │
  │  5. res.json({ status: 'ok' })
  │     Converts to JSON string, sets status 200, sends response
  │
  ▼
Browser
  │
  │  6. Receives: {"status":"ok"}
  │     Displays it on screen (or curl prints it in the terminal)
```

---

## How the Files Connect to Each Other

```
index.js
  │
  ├── imports dotenv           → reads .env → PORT=3000 available
  ├── imports express          → creates the app
  ├── imports cors             → used as middleware
  └── imports health.routes.js
              │
              └── imports health.controller.js
                          │
                          └── exports getHealth function
```

The dependency direction always flows inward:
- `index.js` knows about routes
- routes know about controllers
- controllers know about nothing (they only use `req` and `res` that Express provides)

This one-way dependency chain means you can understand and test each layer
in isolation.

---

## What We Have Built — Phase Summary

### Phase 1 — Foundations
- Installed VS Code, Git, Node.js, Docker Desktop
- Created a GitHub account and cloned the `alphacrm` repo
- Learned: Git vs GitHub, the add → commit → push loop, why `.gitignore` exists

### Phase 2 — Backend Foundation (current)
- Initialized a Node.js project with `npm init -y`
- Configured ES modules with `"type": "module"`
- Installed Express, dotenv, cors, nodemon
- Created the route → controller architecture
- Built the `GET /api/health` endpoint
- Learned: client-server model, REST API, routes, controllers, middleware,
  environment variables

---

## What Comes Next

### Phase 3 — Database (PostgreSQL + Prisma)
- Install and run PostgreSQL locally (in Docker)
- Install Prisma (the ORM — the layer that translates between your JavaScript
  code and SQL)
- Define data models: User, Contact, Deal
- Add `DATABASE_URL` to `.env`

### Phase 4 — Authentication
- POST /api/auth/register — create a new user account
- POST /api/auth/login — verify password, return a JWT token
- Middleware to protect routes: check the JWT on every authenticated request
- Role-based access control: Admin, Manager, Sales Rep

### Phase 5 — Frontend
- React + Vite setup
- Tailwind CSS for styling
- Login page, contact list, deal pipeline (Kanban board)
- Fetch data from the backend API

### Phase 6 — DevOps (Docker, CI/CD, Kubernetes, AWS)
- Dockerfile to containerize the backend
- Docker Compose to run backend + database together
- GitHub Actions to automatically test and build on every push
- Terraform to provision AWS infrastructure
- Kubernetes on EKS to run the containers in production
- Prometheus + Grafana for monitoring

---

## Glossary — Plain English Definitions

| Term | Plain English |
|------|---------------|
| **API** | A set of URLs your backend exposes so other software can talk to it |
| **REST** | A convention for designing those URLs using HTTP verbs |
| **Endpoint** | One specific URL + HTTP verb combination (e.g. GET /api/health) |
| **Middleware** | Code that runs on every request before it reaches a controller |
| **Route** | A mapping from a URL pattern to a controller function |
| **Controller** | The function that handles a specific request and sends a response |
| **`req`** | The request object — everything the client sent |
| **`res`** | The response object — methods to send data back |
| **Environment variable** | A config value stored outside your code |
| **`.env`** | A file that holds environment variables locally (never committed) |
| **`process.env`** | Node's built-in object where environment variables are stored |
| **Port** | A numbered "door" on a computer that network connections come through |
| **CORS** | A browser security rule; the CORS middleware lifts the restriction |
| **JSON** | A text format for data: `{"key": "value"}` |
| **npm** | Node's package manager — downloads and manages libraries |
| **`node_modules`** | The folder where npm puts downloaded libraries |
| **`package.json`** | The file that describes your project and lists its dependencies |
| **nodemon** | A dev tool that restarts your server when you save a file |
| **Health endpoint** | A URL that returns OK — used by Docker/Kubernetes to check if the app is alive |
| **ORM** | A library that lets you write JavaScript instead of SQL to talk to a database |
| **JWT** | A signed token that proves a user is logged in |
| **Docker** | A tool that packages your app + its dependencies into a portable container |
| **Kubernetes** | A platform that runs, scales, and manages Docker containers in production |
