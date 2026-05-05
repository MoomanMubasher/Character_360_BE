// BACKEND/src/middlewares/tenant.middleware.js

import { sendError } from '../utils/response.js';

/**
 * Tenant middleware
 * Extracts tenant ID from request (header, params, or user context)
 * Attaches tenant context to the request
 */
export const extractTenant = (req, res, next) => {
  try {
    // Get tenant ID from various sources
    const tenantId =
      req.headers['x-tenant-id'] ||
      req.params.tenantId ||
      req.user?.tenantId ||
      req.user?.schoolId;

    if (!tenantId) {
      return sendError(res, 400, 'Tenant ID is required.');
    }

    // Attach tenant context to request
    req.tenantId = tenantId;
    req.tenant = {
      id: tenantId,
    };

    next();
  } catch (error) {
    return sendError(res, 500, 'Tenant extraction error.');
  }
};

/**
 * Validate tenant access
 * Ensures user has access to the requested tenant
 */
export const validateTenantAccess = (req, res, next) => {
  try {
    const userTenantId = req.user?.tenantId || req.user?.schoolId;
    const requestedTenantId = req.tenantId || req.params.tenantId;

    if (userTenantId && requestedTenantId && userTenantId !== requestedTenantId) {
      return sendError(res, 403, 'Access denied. You do not have access to this tenant.');
    }

    next();
  } catch (error) {
    return sendError(res, 500, 'Tenant validation error.');
  }
};

// Export aliases for backward compatibility
export const tenantMiddleware = extractTenant;
export default extractTenant;
