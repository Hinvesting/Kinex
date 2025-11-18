# Kinex Monorepo

Full-stack monorepo for the Kinex web app.

Tech Stack:
- Client: React (Vite) + TypeScript
- Server: Node.js + Express + TypeScript
- Database: MongoDB (Mongoose)
- Auth: JWT (email/password)

## Quick Start

1) Install deps

```bash
npm install
```

2) Configure env vars

- Copy `server/.env.example` to `server/.env` and fill values.
- (Optional) Copy `client/.env.example` to `client/.env`.

3) Run dev (server + client)

```bash
npm run dev
```

Server runs on `http://localhost:5000` (default). Client runs on `http://localhost:5173`.

## Scripts

- `npm run dev` — runs server and client in parallel
- `npm run build` — builds server and client
- `npm run start` — starts the compiled server

## API

Auth endpoints under `/api/auth`:
- `POST /register` (email, password, name?)
- `POST /login` (email, password)
- `GET /me` (requires `Authorization: Bearer <token>`) – demo protected route

## Structure

```
client/        # Vite React app
server/        # Express API + Mongoose
```
