# Folder Structure

```
.
├── prisma/
│   ├── schema.prisma       # Database schema and models
│   └── seed.ts             # Database seeding script
├── src/
│   ├── api/                # Frontend API client and interceptors
│   ├── components/         # Reusable React components (Layout, UI)
│   ├── pages/              # React page components (organized by feature)
│   └── server/             # Express backend source code
│       ├── controllers/    # API request handlers
│       ├── middleware/     # Express middleware (Auth, Error Handling)
│       ├── repositories/   # Database access layer
│       ├── routes/         # Express route definitions
│       ├── services/       # Business logic and background jobs
│       └── utils/          # Helpers (Logger, Error Classes)
├── dist/                   # Production build output
├── package.json            # Dependencies and scripts
└── server.ts               # Express application entry point
```
