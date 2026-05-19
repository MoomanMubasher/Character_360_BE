// BACKEND/src/modules/attendance/attendance.controller.js

import attendanceService from './attendance.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const buildScope = (user) => {
  const scope = { districtId: user.districtId, schoolId: user.schoolId };
  if (user.hasRole('super_admin')) { delete scope.districtId; delete scope.schoolId; }
  else if (user.hasRole('district_admin') || user.hasRole('district_superintendent')) { delete scope.schoolId; }
  return scope;
};

class AttendanceController {
  async getAll(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const result = await attendanceService.getAttendanceSummary(req.query, scope);
      return sendSuccess(res, 200, 'Attendance records fetched', result);
    } catch (error) { next(error); }
  }

  async getTeacherOverview(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const overview = await attendanceService.getTeacherAttendanceOverview(req.user._id, scope);
      return sendSuccess(res, 200, 'Attendance overview fetched', overview);
    } catch (error) { next(error); }
  }

  async getClassSheet(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const { classId } = req.params;
      const date = req.query.date || new Date().toISOString();
      const record = await attendanceService.getClassAttendance(classId, date, scope);
      if (!record) {
        // No record yet — return empty shell
        return sendSuccess(res, 200, 'No attendance record found for this date', null);
      }
      return sendSuccess(res, 200, 'Attendance sheet fetched', record);
    } catch (error) { next(error); }
  }

  async getOrCreateSheet(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const { classId } = req.params;
      const { academicYear } = req.query;
      const sheet = await attendanceService.getOrCreateAttendanceSheet(
        classId, academicYear, req.user._id, scope
      );
      return sendSuccess(res, 200, 'Attendance sheet ready', sheet);
    } catch (error) { next(error); }
  }

  async saveAttendance(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const { classId } = req.params;
      const { records, academicYear } = req.body;
      if (!records || !Array.isArray(records)) {
        return sendError(res, 400, 'records array is required');
      }
      const saved = await attendanceService.saveAttendance(
        classId, records, academicYear, req.user._id, scope
      );
      return sendSuccess(res, 200, 'Attendance saved successfully', saved);
    } catch (error) { next(error); }
  }

  async updateRemark(req, res, next) {
    try {
      const { attendanceId, studentId } = req.params;
      const { notes } = req.body;
      const updated = await attendanceService.updateRemark(
        attendanceId, studentId, notes, req.user._id
      );
      if (!updated) return sendError(res, 404, 'Attendance record not found');
      return sendSuccess(res, 200, 'Remark updated', updated);
    } catch (error) { next(error); }
  }

  async finalizeAttendance(req, res, next) {
    try {
      const updated = await attendanceService.finalizeAttendance(req.params.id, req.user._id);
      if (!updated) return sendError(res, 404, 'Attendance record not found');
      return sendSuccess(res, 200, 'Attendance finalized', updated);
    } catch (error) { next(error); }
  }
}

export default new AttendanceController();
