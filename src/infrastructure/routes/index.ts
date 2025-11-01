import { Router } from "express";
import userRoutes from "./user.routes";

/**
 * Main Routes Index
 *
 * Combines all application routes with their respective prefixes
 */
const routes = Router();

/**
 * Health check endpoint
 * GET /health
 */
routes.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

/**
 * User routes
 * Prefix: /users
 */
routes.use("/users", userRoutes);

/**
 * TODO: Add more routes here as you create new modules
 *
 * Example:
 * routes.use("/vaccines", vaccineRoutes);
 * routes.use("/schedulings", schedulingRoutes);
 * routes.use("/auth", authRoutes);
 */

export default routes;
