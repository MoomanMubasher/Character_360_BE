
import studentService from './student.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class StudentController {
  async create(req, res, next) {
    try {
      const student = await studentService.createStudent(req.body, req.user._id);
      return sendSuccess(res, 201, 'Student created successfully', student);
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

      const result = await studentService.getAllStudents(req.query, scope);
      return sendSuccess(res, 200, 'Students fetched successfully', result);
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

      const student = await studentService.getStudentById(req.params.id, scope);

      if (!student) return sendError(res, 404, 'Student not found');

      return sendSuccess(res, 200, 'Student fetched successfully', student);
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const student = await studentService.getStudentByUserId(req.user._id);

      if (!student) return sendError(res, 404, 'Student profile not found');

      return sendSuccess(res, 200, 'Profile fetched successfully', student);
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

      const student = await studentService.updateStudent(
        req.params.id, req.body, req.user._id, scope
      );

      if (!student) return sendError(res, 404, 'Student not found');

      return sendSuccess(res, 200, 'Student updated successfully', student);
    } catch (error) {
      next(error);
    }
  }

  async approveEnrollment(req, res, next) {
    try {
      const scope = { districtId: req.user.districtId };
      if (req.user.hasRole('super_admin')) delete scope.districtId;

      const student = await studentService.approveEnrollment(
        req.params.id, req.user._id, scope
      );

      if (!student) return sendError(res, 404, 'Student not found');

      return sendSuccess(res, 200, 'Enrollment approved successfully', student);
    } catch (error) {
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const scope = { districtId: req.user.districtId };
      if (req.user.hasRole('super_admin')) delete scope.districtId;

      const { newSchoolId, reason } = req.body;
      const student = await studentService.transferStudent(
        req.params.id, newSchoolId, reason, req.user._id, scope
      );

      if (!student) return sendError(res, 404, 'Student not found');

      return sendSuccess(res, 200, 'Student transferred successfully', student);
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const scope = { districtId: req.user.districtId };
      if (req.user.hasRole('super_admin')) delete scope.districtId;

      const student = await studentService.withdrawStudent(
        req.params.id, req.body.reason, req.user._id, scope
      );

      if (!student) return sendError(res, 404, 'Student not found');

      return sendSuccess(res, 200, 'Student withdrawn successfully', student);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
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

      const stats = await studentService.getStudentStats(scope);
      return sendSuccess(res, 200, 'Stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentController();