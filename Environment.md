# Environment Variables

AssetFlow requires the following environment variables to run properly:

- `DATABASE_URL`: The connection string for the PostgreSQL database (e.g., `postgresql://user:password@localhost:5432/assetflow`).
- `JWT_SECRET`: A secure random string used to sign and verify JSON Web Tokens.
- `NODE_ENV`: Should be set to `production` when deploying.
- `PORT`: The port the server will listen on (defaults to 3000).
