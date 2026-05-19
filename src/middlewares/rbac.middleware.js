// BACKEND/src/middlewares/rbac.middleware.js

import { sendError } from '../utils/response.js';
import { getPermissionsForRole } from '../constants/roles.js';

/**
 * Check if a user has a permission, considering:
 * 1. Base permissions derived from their roles (ROLE_PERMISSIONS)
 * 2. Per-user customPermissions.granted (additions)
 * 3. Per-user customPermissions.revoked (removals)
 */
export const resolveUserPermissions = (user) => {
  const rolePerms = (user.roles || []).flatMap((r) => getPermissionsForRole(r));
  const granted = user.customPermissions?.granted || [];
  const revoked = new Set(user.customPermissions?.revoked || []);
  const all = new Set([...rolePerms, ...granted]);
  revoked.forEach((p) => all.delete(p));
  return all;
};

/**
 * Check if a user has a specific permission, using the resolved set above.
 * Falls back to user.hasPermission() if defined on the model.
 */
const userHasPermission = (user, permission) => {
  // Prefer model method if it already handles custom overrides
  if (typeof user.hasPermission === 'function') {
    // Also layer in role-based perms that the model method might miss
    const rolePerms = (user.roles || []).flatMap((r) => getPermissionsForRole(r));
    if (rolePerms.includes(permission)) {
      const revoked = new Set(user.customPermissions?.revoked || []);
      if (!revoked.has(permission)) return true;
    }
    return user.hasPermission(permission);
  }
  return resolveUserPermissions(user).has(permission);
};

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
 * Checks if user has a specific permission string (role-based + custom overrides).
 *
 * Usage in routes:
 *   checkPermission('students:read')
 *   checkPermission(PERMISSIONS.GRADES_UPDATE)
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!userHasPermission(req.user, requiredPermission)) {
      return sendError(
        res,
        403,
        `Access denied. Missing permission: ${requiredPermission}`
      );
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

    const missingPermissions = requiredPermissions.filter(
      (perm) => !userHasPermission(req.user, perm)
    );

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
      return userHasPermission(req.user, perm);
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