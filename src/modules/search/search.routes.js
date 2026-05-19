// BACKEND/src/modules/search/search.routes.js

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import searchController from './search.controller.js';

const router = Router();

router.use(authenticate);
router.use(checkPermission(PERMISSIONS.SEARCH_GLOBAL));

/**
 * GET /api/v1/search?q=<query>&limit=<n>
 * Returns categorised results the authenticated user is allowed to see.
 */
router.get('/', searchController.globalSearch.bind(searchController));

export default router;
