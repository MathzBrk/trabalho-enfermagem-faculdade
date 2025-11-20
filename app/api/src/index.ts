/**
 * Application Entry Point
 *
 * CRITICAL: Import order matters!
 * 1. reflect-metadata MUST be imported first (required by tsyringe)
 * 2. setupContainer() MUST be called before importing app
 * 3. App imports routes, which resolve controllers from container
 */

// Step 1: Enable decorators and reflection (MUST be first)
import 'reflect-metadata';

// Step 2: Setup DI container (MUST be before app import)
import { setupContainer } from '@infrastructure/di/container';
setupContainer();

// Step 3: Import app (after container is configured)
import app from '@infrastructure/http/app';

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
});
