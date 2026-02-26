import teacherService from './teacher.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class TeacherController {
  async create(req, res, next) {
    try {
      const teacher = await teacherService.createTeacher(req.body, req.user._id);
      return sendSuccess(res, 201, 'Teacher created successfully', teacher);
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

      const result = await teacherService.getAllTeachers(req.query, scope);
      return sendSuccess(res, 200, 'Teachers fetched successfully', result);
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

      const teacher = await teacherService.getTeacherById(req.params.id, scope);

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(res, 200, 'Teacher fetched successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const teacher = await teacherService.getTeacherByUserId(req.user._id);

      if (!teacher) {
        return sendError(res, 404, 'Teacher profile not found');
      }

      return sendSuccess(res, 200, 'Profile fetched successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
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

      const teacher = await teacherService.updateTeacher(
        req.params.id, req.body, req.user._id, scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(res, 200, 'Teacher updated successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  async assignClass(req, res, next) {
    try {
      const scope = { schoolId: req.user.schoolId };

      if (req.user.hasRole('super_admin') || req.user.hasRole('district_admin')) {
        delete scope.schoolId;
      }

      const teacher = await teacherService.assignToClass(
        req.params.id, req.body, req.user._id, scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(res, 200, 'Teacher assigned to class successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  async removeClass(req, res, next) {
    try {
      const scope = { schoolId: req.user.schoolId };

      if (req.user.hasRole('super_admin') || req.user.hasRole('district_admin')) {
        delete scope.schoolId;
      }

      const teacher = await teacherService.removeFromClass(
        req.params.id, req.params.classId, req.user._id, scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(res, 200, 'Teacher removed from class successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req, res, next) {
    try {
      const scope = {
        districtId: req.user.districtId,
        schoolId: req.user.schoolId,
      };

      if (req.user.hasRole('super_admin')) {
        delete scope.districtId;
        delete scope.schoolId;
      }

      const teacher = await teacherService.deactivateTeacher(
        req.params.id, req.user._id, scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(res, 200, 'Teacher deactivated successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  async getBySchool(req, res, next) {
    try {
      const teachers = await teacherService.getTeachersBySchool(
        req.params.schoolId, req.query
      );
      return sendSuccess(res, 200, 'Teachers fetched successfully', teachers);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await teacherService.getTeacherStats(req.params.schoolId);
      return sendSuccess(res, 200, 'Stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new TeacherController();