# JobTrack Frontend

React frontend for the JobTrack application.

## Requirements

- Node.js
- npm

## Project Structure

```text
frontend/
  src/
    clients/       Axios, local storage, and React Query setup
    common/        Shared UI components, hooks, utilities, and constants
    modules/auth/  Authentication components, hooks, context, and services
    pages/         Route-level pages
    routes/        React Router setup
```

The old project-specific modules were removed. The current frontend keeps the
shared/common code and auth flow as the base for JobTrack.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

The app runs on the Vite development URL printed in the terminal, usually:

```text
http://localhost:5173
```

## Backend API

Create a `.env` file in the frontend project root with the following variable to connect to the API:

```dotenv
VITE_API_BASE_URL=http://localhost:5100/api
```

## Build

```bash
npm run build
```

## Current Status

The frontend is a clean JobTrack starter with:

- Auth module preserved
- Shared/common components and utilities preserved
- Old project, user, notification, storage, and construction-specific modules removed
- Basic protected dashboard placeholder
