// BACKEND/src/modules/branding/branding.routes.js

import { Router } from 'express';
import brandingController from './branding.controller.js';

const router = Router();

// ─── Public — no authentication needed ─────────────────────────────────────
// The login page calls this BEFORE the user authenticates to load branding.
router.get('/resolve', brandingController.resolve.bind(brandingController));

export default router;
