import Teacher from './teacher.model.js';
import User from '../users/user.model.js';
import mongoose from 'mongoose';

class TeacherService {
  async createTeacher(data, createdBy) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const role = data.designation === 'teaching_assistant' ? 'teaching_assistant' : 'teacher';

      const user = await User.create(
        [
          {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            roles: [role],
            primaryRole: role,
            districtId: data.districtId,
            schoolId: data.schoolId,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            address: data.address,
            status: 'active',
            createdBy,
          },
        ],
        { session }
      );

      const teacher = await Teacher.create(
        [
          {
            userId: user[0]._id,
            districtId: data.districtId,
            schoolId: data.schoolId,
            employeeId: data.employeeId,
            designation: data.designation || 'teacher',
            subjects: data.subjects,
            gradeLevels: data.gradeLevels,
            departmentId: data.departmentId,
            certifications: data.certifications,
            educationBackground: data.educationBackground,
            specializations: data.specializations,
            dateOfJoining: data.dateOfJoining,
            yearsOfExperience: data.yearsOfExperience,
            contractType: data.contractType,
            previousEmployment: data.previousEmployment,
            maxClassesPerDay: data.maxClassesPerDay,
            maxClassesPerWeek: data.maxClassesPerWeek,
            emergencyContact: data.emergencyContact,
            notes: data.notes,
            createdBy,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return await Teacher.findById(teacher[0]._id)
        .populate('userId', '-password')
        .populate('schoolId', 'name code');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllTeachers(query, scope) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      designation,
      subject,
      gradeLevel,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter = {};
    if (scope.districtId) filter.districtId = scope.districtId;
    if (scope.schoolId) filter.schoolId = scope.schoolId;
    if (status) filter.status = status;
    if (designation) filter.designation = designation;
    if (gradeLevel) filter.gradeLevels = gradeLevel;
    if (subject) filter['subjects.subjectName'] = { $regex: subject, $options: 'i' };

    if (search) {
      const userIds = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      filter.$or = [
        { userId: { $in: userIds.map((u) => u._id) } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate('userId', '-password')
        .populate('schoolId', 'name code')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Teacher.countDocuments(filter),
    ]);

    return {
      data: teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTeacherById(id, scope) {
    const filter = { _id: id };
    if (scope.districtId) filter.districtId = scope.districtId;
    if (scope.schoolId) filter.schoolId = scope.schoolId;

    return await Teacher.findOne(filter)
      .populate('userId', '-password')
      .populate('schoolId', 'name code')
      .populate('classAssignments.classId', 'name section gradeLevel');
  }

  async getTeacherByUserId(userId) {
    return await Teacher.findOne({ userId })
      .populate('userId', '-password')
      .populate('schoolId', 'name code')
      .populate('classAssignments.classId', 'name section gradeLevel');
  }

  async updateTeacher(id, data, updatedBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;
      if (scope.schoolId) filter.schoolId = scope.schoolId;

      const teacher = await Teacher.findOne(filter);
      if (!teacher) return null;

      const userUpdateFields = {};
      ['firstName', 'lastName', 'middleName', 'phone', 'gender', 'dateOfBirth', 'address'].forEach(
        (field) => {
          if (data[field] !== undefined) userUpdateFields[field] = data[field];
        }
      );

      if (Object.keys(userUpdateFields).length > 0) {
        userUpdateFields.updatedBy = updatedBy;
        await User.findByIdAndUpdate(teacher.userId, userUpdateFields, { session });
      }

      const teacherUpdateFields = {};
      const teacherFields = [
        'employeeId', 'designation', 'subjects', 'gradeLevels',
        'classAssignments', 'departmentId', 'certifications',
        'educationBackground', 'specializations', 'dateOfJoining',
        'dateOfLeaving', 'yearsOfExperience', 'contractType',
        'previousEmployment', 'maxClassesPerDay', 'maxClassesPerWeek',
        'availablePeriods', 'emergencyContact', 'status', 'notes',
      ];

      teacherFields.forEach((field) => {
        if (data[field] !== undefined) teacherUpdateFields[field] = data[field];
      });

      teacherUpdateFields.updatedBy = updatedBy;

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        id,
        teacherUpdateFields,
        { new: true, session, runValidators: true }
      )
        .populate('userId', '-password')
        .populate('schoolId', 'name code');

      await session.commitTransaction();
      return updatedTeacher;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async assignToClass(teacherId, classData, updatedBy, scope) {
    const filter = { _id: teacherId };
    if (scope.schoolId) filter.schoolId = scope.schoolId;

    const teacher = await Teacher.findOne(filter);
    if (!teacher) return null;

    const alreadyAssigned = teacher.classAssignments.some(
      (a) => a.classId.toString() === classData.classId
    );

    if (alreadyAssigned) {
      throw new Error('Teacher is already assigned to this class');
    }

    teacher.classAssignments.push({
      classId: classData.classId,
      role: classData.role || 'subject_teacher',
      assignedDate: new Date(),
    });

    teacher.updatedBy = updatedBy;
    await teacher.save();

    return await Teacher.findById(teacherId)
      .populate('userId', '-password')
      .populate('classAssignments.classId', 'name section gradeLevel');
  }

  async removeFromClass(teacherId, classId, updatedBy, scope) {
    const filter = { _id: teacherId };
    if (scope.schoolId) filter.schoolId = scope.schoolId;

    const teacher = await Teacher.findOne(filter);
    if (!teacher) return null;

    teacher.classAssignments = teacher.classAssignments.filter(
      (a) => a.classId.toString() !== classId
    );

    teacher.updatedBy = updatedBy;
    await teacher.save();

    return await Teacher.findById(teacherId)
      .populate('userId', '-password')
      .populate('classAssignments.classId', 'name section gradeLevel');
  }

  async deactivateTeacher(id, updatedBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;
      if (scope.schoolId) filter.schoolId = scope.schoolId;

      const teacher = await Teacher.findOne(filter);
      if (!teacher) return null;

      await User.findByIdAndUpdate(
        teacher.userId,
        { status: 'inactive', updatedBy },
        { session }
      );

      const updated = await Teacher.findByIdAndUpdate(
        id,
        { status: 'inactive', updatedBy },
        { new: true, session }
      )
        .populate('userId', '-password')
        .populate('schoolId', 'name code');

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTeachersBySchool(schoolId, query) {
    const { status = 'active' } = query;
    return await Teacher.find({ schoolId, status })
      .populate('userId', 'firstName lastName email phone avatar')
      .populate('classAssignments.classId', 'name section gradeLevel')
      .lean();
  }

  async getTeacherStats(schoolId) {
    const [statusStats, designationStats] = await Promise.all([
      Teacher.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Teacher.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), status: 'active' } },
        { $group: { _id: '$designation', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      byStatus: statusStats.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
      byDesignation: designationStats.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
    };
  }

  // ─── Teacher Dashboard Stats ──────────────────────────────────────────────

  async getDashboardStats(userId, scope) {
    const [Class, Assignment, Announcement, Attendance] = await Promise.all([
      import('../classes/class.model.js').then((m) => m.default),
      import('../academic/assignments/assignment.model.js').then((m) => m.default),
      import('../announcements/announcement.model.js').then((m) => m.default),
      import('../attendance/attendance.model.js').then((m) => m.default),
    ]);

    const classFilter = {
      ...scope,
      $or: [
        { classTeacherId: userId },
        { 'subjectTeachers.teacherId': userId },
      ],
      status: 'active',
    };

    const [classes, totalStudentsAgg, upcoming, announcementsCount] = await Promise.all([
      Class.find(classFilter).lean(),
      Class.aggregate([
        { $match: classFilter },
        { $project: { count: { $size: '$students' } } },
        { $group: { _id: null, total: { $sum: '$count' } } },
      ]),
      Assignment.find({
        teacherId: userId,
        ...scope,
        dueDate: { $gte: new Date() },
        status: 'published',
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('classId', 'name section')
        .populate('subjectId', 'name code')
        .lean(),
      Announcement.countDocuments({
        authorId: userId,
        ...scope,
        status: 'published',
      }),
    ]);

    // Today attendance coverage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const markedToday = await Attendance.countDocuments({
      ...scope,
      classId: { $in: classes.map((c) => c._id) },
      date: { $gte: today },
    });

    return {
      totalClasses: classes.length,
      totalStudents: totalStudentsAgg[0]?.total || 0,
      totalSubjects: [...new Set(classes.flatMap((c) => c.subjectTeachers?.map((st) => st.subjectId?.toString()) || []))].length,
      totalAnnouncements: announcementsCount,
      attendanceMarkedToday: markedToday,
      classesNeedingAttendance: classes.length - markedToday,
      upcomingAssignments: upcoming,
    };
  }

  // ─── Teacher Calendar ─────────────────────────────────────────────────────

  async getCalendarEvents(userId, scope, startDate, endDate) {
    const [Assignment, Announcement] = await Promise.all([
      import('../academic/assignments/assignment.model.js').then((m) => m.default),
      import('../announcements/announcement.model.js').then((m) => m.default),
    ]);

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [assignments, announcements] = await Promise.all([
      Assignment.find({
        teacherId: userId,
        ...scope,
        ...(Object.keys(dateFilter).length ? { dueDate: dateFilter } : {}),
        status: { $in: ['published', 'closed'] },
      })
        .populate('classId', 'name section gradeLevel')
        .populate('subjectId', 'name code')
        .lean(),
      Announcement.find({
        authorId: userId,
        ...scope,
        status: 'published',
        ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
      })
        .populate('classId', 'name section')
        .lean(),
    ]);

    const events = [
      ...assignments.map((a) => ({
        id: a._id,
        type: a.type === 'exam' ? 'Exam' : 'Assignment',
        title: a.title,
        subject: a.subjectId?.name || '',
        subjectCode: a.subjectId?.code || '',
        className: a.classId ? `${a.classId.name} ${a.classId.section || ''}`.trim() : '',
        date: a.dueDate,
        color: a.type === 'exam' ? '#dc2626' : '#2563eb',
        meta: { totalPoints: a.totalPoints, type: a.type },
      })),
      ...announcements.map((an) => ({
        id: an._id,
        type: 'Announcement',
        title: an.title,
        subject: '',
        className: an.classId ? `${an.classId.name} ${an.classId.section || ''}`.trim() : 'School-wide',
        date: an.createdAt,
        color: '#16a34a',
        meta: { category: an.category, priority: an.priority },
      })),
    ];

    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    return events;
  }

  // ─── Teacher Settings ─────────────────────────────────────────────────────

  async getSettings(userId) {
    const teacher = await Teacher.findOne({ userId }).select('preferences').lean();
    return teacher?.preferences || {};
  }

  async updateSettings(userId, preferences) {
    const teacher = await Teacher.findOneAndUpdate(
      { userId },
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');
    if (!teacher) {
      const error = new Error('Teacher profile not found');
      error.statusCode = 404;
      throw error;
    }
    return teacher.preferences;
  }
}

export default new TeacherService();