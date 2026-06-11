# TeamFlow Ops

[![CI](https://github.com/gooseNjuice/teamflow-ops/actions/workflows/ci.yml/badge.svg)](https://github.com/gooseNjuice/teamflow-ops/actions/workflows/ci.yml)

TeamFlow Ops is a portfolio project for managing team operations work across projects, tasks, and workflow status. The app includes a React client and an Express TypeScript API for a demo workspace.

## Current Features

- App shell with sidebar navigation for Dashboard, Projects, Tasks, Team, and Settings.
- Dashboard summary cards, charts, workload, and project progress from API data.
- Projects page with searchable API-backed project cards.
- Tasks page with searchable and filterable task table.
- Kanban board with drag-and-drop task status updates.
- Task details modal.
- Reusable validated task form using React Hook Form and Zod.
- API-backed task creation, editing, archiving, and restore flows.
- Recent task activity for status changes, archive, and restore events.
- Authentication, protected app routes, and role-aware task actions.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit / RTK Query
- dnd kit
- React Hook Form
- Zod
- Recharts
- CSS Modules
- Node.js
- Express
- TypeScript
- MongoDB/Mongoose
- Vitest
- Supertest

## Architecture

- `client/` contains the React + TypeScript Vite application.
- `server/` contains the Express + TypeScript API.
- The project uses demo workspace data while backend persistence and API-backed workflows continue to evolve.

## Local Setup

```bash
cd client
npm install
npm run dev
```

The Vite dev server will print the local URL, usually `http://localhost:5173/`.

## Available Scripts

Run these from the `client/` directory:

- `npm run dev` - start the local Vite dev server.
- `npm run build` - run TypeScript project checks and build the production bundle.
- `npm run preview` - preview the production build locally.

## Quality Checks

GitHub Actions runs CI on `push` and `pull_request`. The workflow currently checks:

- Backend tests.
- Backend build.
- Frontend tests.
- Frontend build.

Run the same checks locally with:

```bash
cd server
npm test
npm run build

cd ../client
npm test
npm run build
```

## Project Status

TeamFlow Ops is a full-stack portfolio project in active development. It has realistic task management UI flows, API-backed workspace data, authentication work, and automated CI checks. Deployment is not configured yet.

## Planned Next Features

- Comments and richer activity history.
- Broader backend and frontend test coverage.
- More complete role and ownership permissions.
- Production deployment configuration.
