// BACKEND/src/modules/attendance/attendance.service.js

import Attendance from './attendance.model.js';
import { paginate } from '../../utils/pagination.js';

class AttendanceService {
  // Get attendance list for a teacher's classes (or full school for admin)
  async getAttendanceSummary(query, scope) {
    const { page = 1, limit = 20, classId, date, startDate, endDate, academicYear } = query;
    const filter = { ...scope };
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    return paginate(Attendance, filter, {
      page,
      limit,
      sort: { date: -1 },
      populate: [
        { path: 'classId', select: 'name section gradeLevel' },
        { path: 'markedBy', select: 'firstName lastName' },
      ],
    });
  }

  // Get full attendance record for a specific class on a specific date
  async getClassAttendance(classId, date, scope) {
    const d = new Date(date);
    const filter = {
      classId,
      ...scope,
      date: { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) },
    };
    return Attendance.findOne(filter)
      .populate('classId', 'name section gradeLevel students')
      .populate('records.studentId', 'firstName lastName avatar')
      .populate('markedBy', 'firstName lastName')
      .lean();
  }

  // Get or initialise today's attendance sheet for a class
  async getOrCreateAttendanceSheet(classId, academicYear, markedBy, scope) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      classId,
      ...scope,
      date: { $gte: today, $lte: endOfDay },
    });
    if (existing) {
      return Attendance.findById(existing._id)
        .populate('records.studentId', 'firstName lastName avatar')
        .lean();
    }

    const newRecord = await Attendance.create({
      classId,
      ...scope,
      academicYear,
      date: today,
      records: [],
      markedBy,
      summary: { total: 0, present: 0, absent: 0, late: 0, excused: 0 },
      createdBy: markedBy,
    });
    return Attendance.findById(newRecord._id)
      .populate('records.studentId', 'firstName lastName avatar')
      .lean();
  }

  // Save / update attendance records for a class
  async saveAttendance(classId, records, academicYear, markedBy, scope) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = records.reduce(
      (acc, r) => {
        acc.total++;
        if (r.status === 'present') acc.present++;
        else if (r.status === 'absent') acc.absent++;
        else if (r.status === 'late') acc.late++;
        else if (r.status === 'excused') acc.excused++;
        return acc;
      },
      { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
    );

    const attendance = await Attendance.findOneAndUpdate(
      { classId, ...scope, date: { $gte: today, $lte: endOfDay } },
      {
        records,
        summary,
        academicYear,
        markedBy,
        updatedBy: markedBy,
        $setOnInsert: { districtId: scope.districtId, schoolId: scope.schoolId },
      },
      { upsert: true, new: true, runValidators: true }
    );
    return attendance;
  }

  // Update a single remark on a student's attendance record
  async updateRemark(attendanceId, studentId, notes, updatedBy) {
    return Attendance.findOneAndUpdate(
      { _id: attendanceId, 'records.studentId': studentId },
      { $set: { 'records.$.notes': notes, updatedBy } },
      { new: true }
    );
  }

  // Finalize an attendance record
  async finalizeAttendance(attendanceId, verifiedBy) {
    return Attendance.findByIdAndUpdate(
      attendanceId,
      { isFinalized: true, verifiedBy, updatedBy: verifiedBy },
      { new: true }
    );
  }

  // Aggregate stats for a teacher's classes (for AllAttendances overview page)
  async getTeacherAttendanceOverview(teacherUserId, scope) {
    const Class = (await import('../classes/class.model.js')).default;
    const classes = await Class.find({
      ...scope,
      $or: [
        { classTeacherId: teacherUserId },
        { 'subjectTeachers.teacherId': teacherUserId },
      ],
      status: 'active',
    }).lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const classStats = await Promise.all(
      classes.map(async (cls) => {
        const todayRecord = await Attendance.findOne({
          classId: cls._id,
          date: { $gte: today },
        }).lean();
        return {
          id: cls._id,
          className: `${cls.name} ${cls.section || ''}`.trim(),
          gradeLevel: cls.gradeLevel,
          totalStudents: cls.students?.length || 0,
          markedToday: !!todayRecord,
          pendingCount: todayRecord
            ? 0
            : cls.students?.length || 0,
          lastMarked: todayRecord?.date || null,
          summary: todayRecord?.summary || null,
        };
      })
    );
    return classStats;
  }
}

export default new AttendanceService();
