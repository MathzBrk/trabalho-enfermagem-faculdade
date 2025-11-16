import 'dotenv/config';
import routes from '@infrastructure/routes';
import { errorHandler } from '@shared/middlewares/errorHandler';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

/**
 * Express Application Setup
 *
 * Configures all middlewares, routes, and error handling
 */
export class App {
  public server: Express;

  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  /**
   * Configure global middlewares
   */
  private middlewares(): void {
    // Security headers
    this.server.use(helmet());

    // CORS configuration
    this.server.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
      }),
    );

    // Parse JSON bodies (limit payload size to prevent DoS)
    this.server.use(express.json({ limit: '10mb' }));

    // Parse URL-encoded bodies
    this.server.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging (simple version - replace with morgan in production)
    this.server.use((req, _res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
      next();
    });

    // Security: Disable X-Powered-By header
    this.server.disable('x-powered-by');
  }

  /**
   * Configure application routes
   */
  private routes(): void {
    // Mount all routes under /api prefix
    this.server.use('/api', routes);

    // Root endpoint
    this.server.get('/', (_req, res) => {
      res.json({
        message: 'Univas Enfermagem API',
        version: '1.0.0',
        documentation: 'https://github.com/your-repo/api-docs',
        endpoints: {
          health: '/api/health',
          auth: {
            login: 'POST /api/auth/login',
            register: 'POST /api/auth/register',
          },
          users: '/api/users',
        },
      });
    });

    // 404 handler for undefined routes
    this.server.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.url,
        method: req.method,
      });
    });
  }

  /**
   * Configure error handling middleware
   * Must be the last middleware registered
   */
  private errorHandling(): void {
    this.server.use(errorHandler);
  }
}

export default new App().server;
