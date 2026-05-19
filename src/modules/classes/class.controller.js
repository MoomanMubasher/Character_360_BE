// BACKEND/src/modules/classes/class.controller.js

import classService from './class.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const buildScope = (user) => {
  const scope = { districtId: user.districtId, schoolId: user.schoolId };
  if (user.hasRole('super_admin')) { delete scope.districtId; delete scope.schoolId; }
  else if (user.hasRole('district_admin') || user.hasRole('district_superintendent')) { delete scope.schoolId; }
  return scope;
};

class ClassController {
  async create(req, res, next) {
    try {
      const cls = await classService.createClass(req.body, req.user._id);
      return sendSuccess(res, 201, 'Class created successfully', cls);
    } catch (error) { next(error); }
  }

  async getAll(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const result = await classService.getAllClasses(req.query, scope);
      return sendSuccess(res, 200, 'Classes fetched successfully', result);
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const cls = await classService.getClassById(req.params.id, scope);
      if (!cls) return sendError(res, 404, 'Class not found');
      return sendSuccess(res, 200, 'Class fetched successfully', cls);
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const cls = await classService.updateClass(req.params.id, req.body, req.user._id, scope);
      if (!cls) return sendError(res, 404, 'Class not found');
      return sendSuccess(res, 200, 'Class updated successfully', cls);
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const cls = await classService.deleteClass(req.params.id, scope);
      if (!cls) return sendError(res, 404, 'Class not found');
      return sendSuccess(res, 200, 'Class deleted successfully');
    } catch (error) { next(error); }
  }

  async getMyClasses(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const classes = await classService.getClassesForTeacher(req.user._id, scope);
      return sendSuccess(res, 200, 'Your classes fetched successfully', classes);
    } catch (error) { next(error); }
  }
}

export default new ClassController();
