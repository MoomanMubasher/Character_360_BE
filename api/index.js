// BACKEND/api/index.js
// Vercel serverless entry point

// dotenv only matters locally — on Vercel, env vars are injected by the dashboard
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import { applyCorsHeaders } from '../src/config/cors.js';

// Cache the DB connection across serverless invocations
let isConnected = false;

export default async function handler(req, res) {
  // Handle CORS for serverless early returns and preflight requests.
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI environment variable is not set. Add it in Vercel → Project → Settings → Environment Variables.',
    });
  }

  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed.',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }

  return app(req, res);
}
