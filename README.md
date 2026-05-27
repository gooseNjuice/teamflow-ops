# TeamFlow Ops

TeamFlow Ops is a portfolio project for managing team operations work across projects, tasks, and workflow status. The current app is a React client that demonstrates a production-style task workspace using local mock/demo data.

## Current Features

- App shell with sidebar navigation for Dashboard, Projects, Tasks, Team, and Settings.
- Dashboard summary cards and task status breakdown from demo data.
- Projects page with searchable mock project cards.
- Tasks page with searchable and filterable task table.
- Kanban board with drag-and-drop task status updates.
- Task details modal.
- Reusable validated task form using React Hook Form and Zod.
- Local task creation, editing, archiving, and restore flows.
- Recent task activity for status changes, archive, and restore events.
- LocalStorage persistence for demo tasks and recent activity.
- Reset demo data action to restore the original mock workspace.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- dnd kit
- React Hook Form
- Zod
- CSS Modules

Planned backend stack:

- Node.js
- Express
- TypeScript
- MongoDB/Mongoose

## Architecture

- `client/` contains the React + TypeScript Vite application.
- The app currently uses local mock/demo data as the initial workspace data.
- Task and recent activity changes are stored in `localStorage` for demo persistence.
- Backend/API integration is planned with an Express API, but is not connected yet.

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

## Project Status

TeamFlow Ops is currently a frontend-focused demo workspace. It has realistic task management UI flows, but it does not yet use a backend, database, authentication, or API calls.

## Planned Next Features

- Express + TypeScript API.
- MongoDB/Mongoose models.
- Tasks and projects API integration.
- RTK Query data fetching.
- Authentication.
- Comments and richer activity history.
- Role-based UI.
- Deployment.
