
const teacherService = require('./teacher.service');
const { sendSuccess, sendError } = require('../../utils/response');

class TeacherController {
  /**
   * POST /api/v1/teachers
   */
  async create(req, res, next) {
    try {
      const teacher = await teacherService.createTeacher(
        req.body,
        req.user._id
      );
      return sendSuccess(res, 201, 'Teacher created successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teachers
   */
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

  /**
   * GET /api/v1/teachers/:id
   */
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

      const teacher = await teacherService.getTeacherById(
        req.params.id,
        scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(res, 200, 'Teacher fetched successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teachers/me
   */
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

  /**
   * PUT /api/v1/teachers/:id
   */
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
        req.params.id,
        req.body,
        req.user._id,
        scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(res, 200, 'Teacher updated successfully', teacher);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/teachers/:id/assign-class
   */
  async assignClass(req, res, next) {
    try {
      const scope = { schoolId: req.user.schoolId };

      if (req.user.hasRole('super_admin') || req.user.hasRole('district_admin')) {
        delete scope.schoolId;
      }

      const teacher = await teacherService.assignToClass(
        req.params.id,
        req.body,
        req.user._id,
        scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(
        res,
        200,
        'Teacher assigned to class successfully',
        teacher
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/teachers/:id/remove-class/:classId
   */
  async removeClass(req, res, next) {
    try {
      const scope = { schoolId: req.user.schoolId };

      if (req.user.hasRole('super_admin') || req.user.hasRole('district_admin')) {
        delete scope.schoolId;
      }

      const teacher = await teacherService.removeFromClass(
        req.params.id,
        req.params.classId,
        req.user._id,
        scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(
        res,
        200,
        'Teacher removed from class successfully',
        teacher
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/teachers/:id/deactivate
   */
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
        req.params.id,
        req.user._id,
        scope
      );

      if (!teacher) {
        return sendError(res, 404, 'Teacher not found');
      }

      return sendSuccess(
        res,
        200,
        'Teacher deactivated successfully',
        teacher
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teachers/school/:schoolId
   */
  async getBySchool(req, res, next) {
    try {
      const teachers = await teacherService.getTeachersBySchool(
        req.params.schoolId,
        req.query
      );
      return sendSuccess(res, 200, 'Teachers fetched successfully', teachers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teachers/stats/:schoolId
   */
  async getStats(req, res, next) {
    try {
      const stats = await teacherService.getTeacherStats(req.params.schoolId);
      return sendSuccess(res, 200, 'Stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherController();