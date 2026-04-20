// BACKEND/src/app.js

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { corsOptions } from './config/cors.js';

const app = express();

// ─── Body Parsers ────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── CORS ────────────────────────────────────────────
app.use(cors(corsOptions));

// ─── Routes ──────────────────────────────────────────
app.use(routes);

// ─── 404 Handler (Express v5 compatible) ─────────────
// Option 1: No path (catches everything not matched above)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ────────────────────────────
app.use(errorMiddleware);

export default app;