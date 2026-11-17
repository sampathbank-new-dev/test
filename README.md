# CBL Shop

A small shop app for learning how to move a monolithic application to microservices, one step at a
time.

| Folder | What it is | How it runs on the server |
|---|---|---|
| [`frontend/`](frontend/README.md) | React app (Vite) | Nginx serves the built files |
| [`backend/`](backend/README.md) | NestJS API, the monolith (products and orders modules) | Node.js with PM2, port 3000 |

## How the parts fit together

```
Browser ──► Nginx (port 80)
              ├── /         → the React app (files in /var/www/cbl-frontend)
              └── /api/...  → the NestJS backend (127.0.0.1:3000)
```

The browser only ever talks to Nginx. Because of that, the backend can later be split into several
services without changing the frontend.

## Steps

1. Frontend: done. See [frontend/README.md](frontend/README.md).
2. Backend (the monolith): done. See [backend/README.md](backend/README.md).
3. Next: a real database, then splitting the backend into microservices.

## Run everything on your computer

In one terminal:

```bash
cd backend
npm install
npm run start:dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open <http://localhost:5173>.
