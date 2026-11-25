# Deployment Guide

AssetFlow can be deployed to any Node.js compatible hosting environment (e.g., Google Cloud Run, Heroku, Render) or a standard VPS.

## Prerequisites
- Node.js 18+
- PostgreSQL Database
- NPM or Yarn

## Environment Setup
1. Copy `.env.example` to `.env`.
2. Update the `DATABASE_URL` with your production database credentials.
3. Set a strong `JWT_SECRET`.

## Building for Production
Run the following command to create a production bundle:
```bash
npm run build
```
This builds both the Vite frontend and the Express server.

## Running the Server
```bash
npm run start
```
The server will start on port 3000 by default and serve the API as well as the static frontend files.
