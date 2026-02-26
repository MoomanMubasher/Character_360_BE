// BACKEND/src/modules/principals/principal.controller.js

import principalService from './principal.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class PrincipalController {
  async create(req, res, next) {
    try {
      const principal = await principalService.createPrincipal(req.body, req.user._id);
      return sendSuccess(res, 201, 'Principal created successfully', principal);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const scope = {
        districtId: req.user.districtId,
        schoolId: req.user.schoolId,
      };

      if (req.user.hasRole('super_admin')) {
        delete scope.districtId;
        delete scope.schoolId;
      } else if (req.user.hasRole('district_admin')) {
        delete scope.schoolId;
      }

      const result = await principalService.getAllPrincipals(req.query, scope);
      return sendSuccess(res, 200, 'Principals fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const scope = {
        districtId: req.user.districtId,
        schoolId: req.user.schoolId,
      };

      if (req.user.hasRole('super_admin')) {
        delete scope.districtId;
        delete scope.schoolId;
      } else if (req.user.hasRole('district_admin')) {
        delete scope.schoolId;
      }

      const principal = await principalService.getPrincipalById(req.params.id, scope);

      if (!principal) {
        return sendError(res, 404, 'Principal not found');
      }

      return sendSuccess(res, 200, 'Principal fetched successfully', principal);
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const principal = await principalService.getPrincipalByUserId(req.user._id);

      if (!principal) {
        return sendError(res, 404, 'Principal profile not found');
      }

      return sendSuccess(res, 200, 'Profile fetched successfully', principal);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const scope = { districtId: req.user.districtId };

      if (req.user.hasRole('super_admin')) {
        delete scope.districtId;
      }

      const principal = await principalService.updatePrincipal(
        req.params.id,
        req.body,
        req.user._id,
        scope
      );

      if (!principal) {
        return sendError(res, 404, 'Principal not found');
      }

      return sendSuccess(res, 200, 'Principal updated successfully', principal);
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req, res, next) {
    try {
      const scope = { districtId: req.user.districtId };

      if (req.user.hasRole('super_admin')) {
        delete scope.districtId;
      }

      const principal = await principalService.deactivatePrincipal(
        req.params.id,
        req.user._id,
        scope
      );

      if (!principal) {
        return sendError(res, 404, 'Principal not found');
      }

      return sendSuccess(res, 200, 'Principal deactivated successfully', principal);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await principalService.getPrincipalStats(req.params.schoolId);
      return sendSuccess(res, 200, 'Stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new PrincipalController();