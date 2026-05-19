// BACKEND/src/modules/academic/assignments/assignment.controller.js

import assignmentService from './assignment.service.js';
import { sendSuccess, sendError } from '../../../utils/response.js';

const buildScope = (user) => {
  const scope = { districtId: user.districtId, schoolId: user.schoolId };
  if (user.hasRole('super_admin')) { delete scope.districtId; delete scope.schoolId; }
  else if (user.hasRole('district_admin') || user.hasRole('district_superintendent')) { delete scope.schoolId; }
  // Teachers are further scoped to their own assignments
  if (user.hasRole('teacher') || user.hasRole('teaching_assistant')) {
    scope.teacherId = user._id;
  }
  return scope;
};

class AssignmentController {
  async create(req, res, next) {
    try {
      const assignment = await assignmentService.createAssignment(req.body, req.user._id);
      return sendSuccess(res, 201, 'Assignment created successfully', assignment);
    } catch (error) { next(error); }
  }

  async getAll(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const result = await assignmentService.getAllAssignments(req.query, scope);
      return sendSuccess(res, 200, 'Assignments fetched successfully', result);
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const assignment = await assignmentService.getAssignmentById(req.params.id, scope);
      if (!assignment) return sendError(res, 404, 'Assignment not found');
      return sendSuccess(res, 200, 'Assignment fetched successfully', assignment);
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const assignment = await assignmentService.updateAssignment(req.params.id, req.body, req.user._id, scope);
      if (!assignment) return sendError(res, 404, 'Assignment not found');
      return sendSuccess(res, 200, 'Assignment updated successfully', assignment);
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const assignment = await assignmentService.deleteAssignment(req.params.id, scope);
      if (!assignment) return sendError(res, 404, 'Assignment not found');
      return sendSuccess(res, 200, 'Assignment deleted successfully');
    } catch (error) { next(error); }
  }

  async publish(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const assignment = await assignmentService.publishAssignment(req.params.id, req.user._id, scope);
      if (!assignment) return sendError(res, 404, 'Assignment not found');
      return sendSuccess(res, 200, 'Assignment published', assignment);
    } catch (error) { next(error); }
  }
}

export default new AssignmentController();
