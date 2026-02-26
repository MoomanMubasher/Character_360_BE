// BACKEND/src/middlewares/rbac.middleware.js

import { sendError } from '../utils/response.js';

/**
 * Role-based authorization
 * Checks if user has one of the allowed roles
 * 
 * Usage in routes:
 *   authorize('super_admin', 'district_admin', 'school_admin')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user exists (should be set by authenticate middleware)
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    // 2. Check if user has any of the allowed roles
    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return sendError(
        res,
        403,
        'Access denied. You do not have permission to perform this action.',
        {
          required: allowedRoles,
          current: userRoles,
        }
      );
    }

    next();
  };
};

/**
 * Permission-based authorization
 * Checks if user has a specific permission string
 * 
 * Usage in routes:
 *   checkPermission('students:read')
 *   checkPermission('grades:write')
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    // Use the user model's hasPermission method if available
    if (typeof req.user.hasPermission === 'function') {
      if (!req.user.hasPermission(requiredPermission)) {
        return sendError(
          res,
          403,
          `Access denied. Missing permission: ${requiredPermission}`
        );
      }
    } else {
      // Fallback: direct array check
      const userPermissions = req.user.permissions || [];
      if (!userPermissions.includes(requiredPermission)) {
        return sendError(
          res,
          403,
          `Access denied. Missing permission: ${requiredPermission}`
        );
      }
    }

    next();
  };
};

/**
 * Check multiple permissions (ALL required)
 * 
 * Usage:
 *   checkAllPermissions('students:read', 'students:write')
 */
export const checkAllPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    const missingPermissions = requiredPermissions.filter((perm) => {
      if (typeof req.user.hasPermission === 'function') {
        return !req.user.hasPermission(perm);
      }
      return !(req.user.permissions || []).includes(perm);
    });

    if (missingPermissions.length > 0) {
      return sendError(
        res,
        403,
        'Access denied. Missing permissions.',
        { missing: missingPermissions }
      );
    }

    next();
  };
};

/**
 * Check multiple permissions (ANY one is enough)
 * 
 * Usage:
 *   checkAnyPermission('students:read', 'students:write')
 */
export const checkAnyPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    const hasAny = requiredPermissions.some((perm) => {
      if (typeof req.user.hasPermission === 'function') {
        return req.user.hasPermission(perm);
      }
      return (req.user.permissions || []).includes(perm);
    });

    if (!hasAny) {
      return sendError(
        res,
        403,
        'Access denied. Insufficient permissions.',
        { required: requiredPermissions }
      );
    }

    next();
  };
};

/**
 * Scope-based check: ensures user can only access data within their scope
 * 
 * Usage:
 *   checkScope('school')  → user must have schoolId
 *   checkScope('district') → user must have districtId
 */
export const checkScope = (scopeLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    // Super admin bypasses scope checks
    if (req.user.roles?.includes('super_admin')) {
      return next();
    }

    if (scopeLevel === 'district' && !req.user.districtId) {
      return sendError(res, 403, 'Access denied. No district scope assigned.');
    }

    if (scopeLevel === 'school') {
      if (!req.user.districtId || !req.user.schoolId) {
        return sendError(res, 403, 'Access denied. No school scope assigned.');
      }
    }

    next();
  };
};

// Default export for backward compatibility (permission-based)
const rbacMiddleware = (permission) => {
  return (req, res, next) => {
    if (!req.user?.permissions?.includes(permission)) {
      return sendError(res, 403, 'Forbidden');
    }
    next();
  };
};

export default rbacMiddleware;