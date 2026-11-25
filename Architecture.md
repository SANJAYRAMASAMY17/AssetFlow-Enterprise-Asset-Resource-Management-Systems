# Architecture Overview

AssetFlow is a full-stack web application built with a modern React frontend and an Express/Node.js backend.

## Frontend
- **React (Vite):** Provides a fast, hot-reloading development experience.
- **TanStack Query:** Manages server state, caching, and background fetching.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI styling.
- **Recharts:** Used for data visualization in the Analytics Dashboard.
- **React Router:** Handles client-side navigation.

## Backend
- **Express:** Serves the REST API and the static React build in production.
- **Prisma:** Modern database ORM used to interact with PostgreSQL. Provides type-safe queries.
- **Security & Performance:** Helmet, CORS, and Express-Rate-Limit are used to protect the API. Winston is used for logging.

## Communication
- The frontend communicates with the backend via REST API calls. Axios is configured with request and response interceptors to handle authentication tokens and retries.
