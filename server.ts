import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './src/server/middleware/error.middleware.ts';
import { logger } from './src/server/utils/logger.ts';
import authRoutes from './src/server/routes/authRoutes.ts';
import departmentRoutes from './src/server/routes/department.routes.ts';
import categoryRoutes from './src/server/routes/category.routes.ts';
import employeeRoutes from './src/server/routes/employee.routes.ts';
import assetRoutes from './src/server/routes/asset.routes.ts';
import allocationRoutes from './src/server/routes/allocation.routes.ts';
import transferRoutes from './src/server/routes/transfer.routes.ts';
import activityRoutes from './src/server/routes/activity.routes.ts';
import bookingRoutes from './src/server/routes/booking.routes.ts';
import maintenanceRoutes from './src/server/routes/maintenance.routes.ts';
import auditRoutes from './src/server/routes/audit.routes.ts';
import analyticsRoutes from './src/server/routes/analytics.routes.ts';
import notificationRoutes from './src/server/routes/notification.routes.ts';
import locationRoutes from './src/server/routes/location.routes.ts';
import { requireAuth, requireAdmin } from './src/server/middleware/auth.middleware.ts';

import { startBackgroundJobs } from './src/server/services/backgroundJobs.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust first proxy (required for Cloud Run / reverse proxies with express-rate-limit)
  app.set('trust proxy', 1);

  startBackgroundJobs();

  // Middleware
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite HMR in dev
  }));
  app.use(morgan('dev'));
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    validate: { trustProxy: false, xForwardedForHeader: false, forwardedHeader: false }
  });
  app.use('/api', limiter);

  // API Routes
  app.use('/api/auth', authRoutes);
  
  app.use('/api/departments', requireAuth, departmentRoutes);
  app.use('/api/categories', requireAuth, categoryRoutes);
  app.use('/api/employees', requireAuth, employeeRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/allocations', allocationRoutes);
  app.use('/api/transfers', transferRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/audits', auditRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/locations', locationRoutes);
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AssetFlow API is running' });
  });

  // Global Error Handler
  app.use(errorHandler);

  // Serve Frontend (Vite Middleware)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
