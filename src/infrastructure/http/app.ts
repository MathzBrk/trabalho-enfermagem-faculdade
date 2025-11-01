import "dotenv/config";
import express, { type Express } from "express";
import routes from "@infrastructure/routes";
import { errorHandler } from "@shared/middlewares/errorHandler";

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
    // Parse JSON bodies
    this.server.use(express.json());

    // Parse URL-encoded bodies
    this.server.use(express.urlencoded({ extended: true }));

    // CORS (if needed - uncomment and install cors package)
    // this.server.use(cors());

    // Request logging (simple version - replace with morgan in production)
    this.server.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Configure application routes
   */
  private routes(): void {
    // Mount all routes under /api prefix
    this.server.use("/api", routes);

    // Root endpoint
    this.server.get("/", (req, res) => {
      res.json({
        message: "Univas Enfermagem API",
        version: "1.0.0",
        endpoints: {
          health: "/api/health",
          users: "/api/users",
        },
      });
    });

    // 404 handler for undefined routes
    this.server.use((req, res) => {
      res.status(404).json({
        error: "Route not found",
        path: req.url,
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
