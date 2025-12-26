# Quiz App (Full Stack)

Full-stack quiz application with a Next.js frontend and an Express + MongoDB backend. Users can browse topics, take quizzes, create quizzes, and track progress.

## Tech Stack

- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth

## Project Structure

- `frontend/`: Next.js app (UI + styling)
- `backend/`: Express API server + MongoDB models/seed data
- `run-dev.js`: Starts backend and frontend together

## Prerequisites

- Node.js 18+ recommended
- MongoDB running locally (or a MongoDB connection string)

## Setup

Install dependencies for root + frontend + backend:

```bash
npm run install-all
```

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env`:

```bash
MONGODB_URI=mongodb://localhost:27017/Quiz_app
MONGODB_DB=Quiz_app
PORT=5000
JWT_SECRET=replace-with-a-strong-secret
```

### Frontend (`frontend/.env.local`)

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Run (Development)

From the project root:

```bash
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000` (API under `/api`)

## Useful Scripts

From the project root:

- `npm start`: Run backend + frontend together
- `npm run backend`: Run backend only
- `npm run frontend`: Run frontend only

From `frontend/`:

- `npm run dev`: Next.js dev server
- `npm run build`: Production build
- `npm run lint`: Lint

From `backend/`:

- `npm run dev`: Start backend with nodemon
- `npm start`: Start backend

