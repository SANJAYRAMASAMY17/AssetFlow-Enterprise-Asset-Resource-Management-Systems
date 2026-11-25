const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(
/model User \{[\s\S]*?createdAt DateTime  @default\(now\(\)\)/g,
`model User {
  id       String  @id @default(uuid())
  email    String  @unique
  password String
  name     String
  role     Role    @default(EMPLOYEE)
  isActive Boolean @default(true)

  departmentId String?
  department   Department? @relation("DepartmentEmployees", fields: [departmentId], references: [id])

  managedDepartments Department[] @relation("DepartmentHead")

  deletedAt DateTime?
  createdAt DateTime  @default(now())`
);

schema = schema.replace(
/model AuditCycle \{[\s\S]*?enum AuditStatus \{[\s\S]*?COMPLETED\n\}/,
`model AuditCycle {
  id          String      @id @default(uuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime?
  status      AuditStatus @default(OPEN)

  departmentId String?
  department   Department? @relation(fields: [departmentId], references: [id])
  locationId   String?
  location     Location?   @relation(fields: [locationId], references: [id])

  auditors     User[]      @relation("AuditCycleAuditors")

  auditItems AuditItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum AuditStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
}`
);

schema = schema.replace(
/model AuditItem \{[\s\S]*?enum AuditItemStatus \{[\s\S]*?DAMAGED\n\}/,
`model AuditItem {
  id           String     @id @default(uuid())
  auditCycleId String
  auditCycle   AuditCycle @relation(fields: [auditCycleId], references: [id])

  assetId String
  asset   Asset  @relation(fields: [assetId], references: [id])

  status AuditItemStatus @default(PENDING)
  notes  String?
  photoUrl String?

  auditedById String?
  auditedBy   User?     @relation("AuditedBy", fields: [auditedById], references: [id])
  auditedAt   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([auditCycleId])
  @@index([assetId])
}

enum AuditItemStatus {
  PENDING
  VERIFIED
  MISSING
  DAMAGED
  RETIRED
}`
);

schema = schema.replace(
/transferRequests    TransferRequest\[\]    @relation\("RequestedTransfers"\)/,
`transferRequests    TransferRequest[]    @relation("RequestedTransfers")
  auditedItems        AuditItem[]          @relation("AuditedBy")
  assignedAudits      AuditCycle[]         @relation("AuditCycleAuditors")`
);

schema = schema.replace(
/assets      Asset\[\]\n\n  deletedAt DateTime\?/,
`assets      Asset[]
  auditCycles AuditCycle[]

  deletedAt DateTime?`
);

schema = schema.replace(
/assets Asset\[\]\n\n  deletedAt DateTime\?/,
`assets Asset[]
  auditCycles AuditCycle[]

  deletedAt DateTime?`
);

fs.writeFileSync('prisma/schema.prisma', schema);
