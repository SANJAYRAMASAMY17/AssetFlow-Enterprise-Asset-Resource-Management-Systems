# API Documentation

The backend exposes a RESTful API under `/api`. All endpoints (except auth) require a valid JWT token.

## Authentication
- `POST /api/auth/login` - Authenticate a user and receive a JWT.
- `POST /api/auth/register` - Create a new user (Admin only).

## Assets
- `GET /api/assets` - List all assets.
- `GET /api/assets/:id` - Get asset details.
- `POST /api/assets` - Create a new asset.
- `PUT /api/assets/:id` - Update an asset.
- `DELETE /api/assets/:id` - Delete an asset.

## Analytics & Reports
- `GET /api/analytics/dashboard` - Get dashboard statistics and charts.
- `GET /api/analytics/reports/:type` - Get exportable report data.

## Other Endpoints
- Departments, Categories, Employees, Allocations, Transfers, Bookings, Maintenance, Audits follow standard CRUD conventions.
