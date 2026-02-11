// BACKEND/src/modules/teachers/teacher.service.js

const Teacher = require('./teacher.model');
const User = require('../users/user.model');
const mongoose = require('mongoose');

class TeacherService {
 
  async createTeacher(data, createdBy) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Determine role
      const role =
        data.designation === 'teaching_assistant'
          ? 'teaching_assistant'
          : 'teacher';

      // 2. Create base user
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

      // 3. Create teacher profile
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

      // Update user fields
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

      // Update teacher fields
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

    // Check if already assigned
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
    const stats = await Teacher.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const designationStats = await Teacher.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          status: 'active',
        },
      },
      {
        $group: {
          _id: '$designation',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      byStatus: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byDesignation: designationStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}

module.exports = new TeacherService();