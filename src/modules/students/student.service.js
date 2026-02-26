import Student from './student.model.js';
import User from '../users/user.model.js';
import mongoose from 'mongoose';

class StudentService {
  async generateStudentId(districtId) {
    const count = await Student.countDocuments({ districtId });
    const year = new Date().getFullYear().toString().slice(-2);
    const sequence = (count + 1).toString().padStart(5, '0');
    return `STU-${year}-${sequence}`;
  }

  getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 7) return `${year}-${year + 1}`;
    return `${year - 1}-${year}`;
  }

  async createStudent(data, createdBy) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const studentId = data.studentId || (await this.generateStudentId(data.districtId));

      const user = await User.create(
        [
          {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            email: data.email,
            password: data.password || `Temp@${Date.now()}`,
            phone: data.phone,
            roles: ['student'],
            primaryRole: 'student',
            districtId: data.districtId,
            schoolId: data.schoolId,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            address: data.address,
            status: 'pending',
            createdBy,
          },
        ],
        { session }
      );

      const student = await Student.create(
        [
          {
            userId: user[0]._id,
            districtId: data.districtId,
            schoolId: data.schoolId,
            studentId,
            stateStudentId: data.stateStudentId,
            gradeLevel: data.gradeLevel,
            classId: data.classId,
            sectionId: data.sectionId,
            academicYear: data.academicYear || this.getCurrentAcademicYear(),
            enrollmentDate: data.enrollmentDate || new Date(),
            enrollmentType: data.enrollmentType || 'new',
            previousSchool: data.previousSchool,
            guardians: data.guardians,
            medical: data.medical,
            transportation: data.transportation,
            mealPlan: data.mealPlan,
            demographics: data.demographics,
            enrollmentStatus: 'pre_enrolled',
            notes: data.notes,
            createdBy,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return await Student.findById(student[0]._id)
        .populate('userId', '-password')
        .populate('schoolId', 'name code');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllStudents(query, scope) {
    const {
      page = 1, limit = 10, search, enrollmentStatus,
      gradeLevel, classId, academicYear,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = query;

    const filter = {};
    if (scope.districtId) filter.districtId = scope.districtId;
    if (scope.schoolId) filter.schoolId = scope.schoolId;
    if (scope.classIds) filter.classId = { $in: scope.classIds };
    if (enrollmentStatus) filter.enrollmentStatus = enrollmentStatus;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;

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
        { studentId: { $regex: search, $options: 'i' } },
        { stateStudentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('userId', '-password')
        .populate('schoolId', 'name code')
        .populate('classId', 'name section gradeLevel')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Student.countDocuments(filter),
    ]);

    return {
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(id, scope) {
    const filter = { _id: id };
    if (scope.districtId) filter.districtId = scope.districtId;
    if (scope.schoolId) filter.schoolId = scope.schoolId;

    return await Student.findOne(filter)
      .populate('userId', '-password')
      .populate('schoolId', 'name code address')
      .populate('classId', 'name section gradeLevel')
      .populate('guardians.userId', 'firstName lastName email phone');
  }

  async getStudentByUserId(userId) {
    return await Student.findOne({ userId })
      .populate('userId', '-password')
      .populate('schoolId', 'name code')
      .populate('classId', 'name section gradeLevel');
  }

  async updateStudent(id, data, updatedBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;
      if (scope.schoolId) filter.schoolId = scope.schoolId;

      const student = await Student.findOne(filter);
      if (!student) return null;

      const userUpdateFields = {};
      ['firstName', 'lastName', 'middleName', 'phone', 'gender', 'dateOfBirth', 'address'].forEach(
        (field) => {
          if (data[field] !== undefined) userUpdateFields[field] = data[field];
        }
      );

      if (Object.keys(userUpdateFields).length > 0) {
        userUpdateFields.updatedBy = updatedBy;
        await User.findByIdAndUpdate(student.userId, userUpdateFields, { session });
      }

      const studentUpdateFields = {};
      const studentFields = [
        'gradeLevel', 'classId', 'sectionId', 'academicYear',
        'enrollmentType', 'previousSchool', 'guardians', 'medical',
        'transportation', 'mealPlan', 'demographics', 'enrollmentStatus',
        'withdrawalDate', 'withdrawalReason', 'notes',
      ];

      studentFields.forEach((field) => {
        if (data[field] !== undefined) studentUpdateFields[field] = data[field];
      });

      studentUpdateFields.updatedBy = updatedBy;

      const updatedStudent = await Student.findByIdAndUpdate(
        id, studentUpdateFields,
        { new: true, session, runValidators: true }
      )
        .populate('userId', '-password')
        .populate('schoolId', 'name code')
        .populate('classId', 'name section gradeLevel');

      await session.commitTransaction();
      return updatedStudent;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async approveEnrollment(id, approvedBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;

      const student = await Student.findOne(filter);
      if (!student) return null;

      if (!['pre_enrolled', 'pending_review'].includes(student.enrollmentStatus)) {
        throw new Error(`Cannot approve student with status: ${student.enrollmentStatus}`);
      }

      await User.findByIdAndUpdate(
        student.userId,
        { status: 'active', updatedBy: approvedBy },
        { session }
      );

      student.enrollmentStatus = 'active';
      student.updatedBy = approvedBy;
      await student.save({ session });

      await session.commitTransaction();

      return await Student.findById(id)
        .populate('userId', '-password')
        .populate('schoolId', 'name code');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async transferStudent(id, newSchoolId, reason, transferredBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;

      const student = await Student.findOne(filter);
      if (!student) return null;

      student.schoolId = newSchoolId;
      student.classId = null;
      student.sectionId = null;
      student.enrollmentStatus = 'active';
      student.enrollmentType = 'transfer';
      student.updatedBy = transferredBy;

      await User.findByIdAndUpdate(
        student.userId,
        { schoolId: newSchoolId, updatedBy: transferredBy },
        { session }
      );

      await student.save({ session });
      await session.commitTransaction();

      return await Student.findById(id)
        .populate('userId', '-password')
        .populate('schoolId', 'name code');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async withdrawStudent(id, reason, withdrawnBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;

      const student = await Student.findOne(filter);
      if (!student) return null;

      student.enrollmentStatus = 'withdrawn';
      student.withdrawalDate = new Date();
      student.withdrawalReason = reason;
      student.updatedBy = withdrawnBy;

      await User.findByIdAndUpdate(
        student.userId,
        { status: 'inactive', updatedBy: withdrawnBy },
        { session }
      );

      await student.save({ session });
      await session.commitTransaction();

      return await Student.findById(id)
        .populate('userId', '-password')
        .populate('schoolId', 'name code');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getStudentStats(scope) {
    const matchStage = {};
    if (scope.districtId) matchStage.districtId = new mongoose.Types.ObjectId(scope.districtId);
    if (scope.schoolId) matchStage.schoolId = new mongoose.Types.ObjectId(scope.schoolId);

    const [byStatus, byGrade, byEnrollmentType] = await Promise.all([
      Student.aggregate([
        { $match: matchStage },
        { $group: { _id: '$enrollmentStatus', count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match: { ...matchStage, enrollmentStatus: 'active' } },
        { $group: { _id: '$gradeLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Student.aggregate([
        { $match: matchStage },
        { $group: { _id: '$enrollmentType', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      byStatus: byStatus.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
      byGrade: byGrade.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
      byEnrollmentType: byEnrollmentType.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
      total: byStatus.reduce((sum, c) => sum + c.count, 0),
    };
  }
}

export default new StudentService();