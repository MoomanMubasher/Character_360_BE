// BACKEND/src/modules/schools/school.controller.js

import schoolService from './school.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class SchoolController {
  async create(req, res, next) {
    try {
      const school = await schoolService.create(req.body, req.user.id);
      return sendSuccess(res, 201, 'School created successfully', school);
    } catch (error) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await schoolService.getAll(req.validatedQuery || req.query);
      return sendSuccess(res, 200, 'Schools retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const school = await schoolService.getById(req.params.id);
      if (!school) return sendError(res, 404, 'School not found');
      return sendSuccess(res, 200, 'School retrieved successfully', school);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const school = await schoolService.update(req.params.id, req.body, req.user.id);
      if (!school) return sendError(res, 404, 'School not found');
      return sendSuccess(res, 200, 'School updated successfully', school);
    } catch (error) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await schoolService.delete(req.params.id);
      if (!deleted) return sendError(res, 404, 'School not found');
      return sendSuccess(res, 200, 'School deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new SchoolController();
