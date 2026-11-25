# Database Schema

AssetFlow uses PostgreSQL as its primary data store. The schema is managed using Prisma.

## Core Models
- **User:** Represents employees and administrators.
- **Department:** Organizational units within the company.
- **AssetCategory:** Categories for assets (e.g., Laptops, Furniture).
- **Location:** Physical locations for assets or audits.
- **Asset:** The core entity representing a physical or digital item.
- **AssetAllocation:** Tracks when an asset is checked out to a user.
- **ResourceBooking:** Represents temporary reservations for shared assets.
- **MaintenanceRequest:** Logs repair and maintenance activities.
- **AuditCycle & AuditItem:** Used for periodic physical inventory checks.
- **Notification:** System alerts and messages for users.
- **ActivityLog:** An audit trail of important system events.
