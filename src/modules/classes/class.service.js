// BACKEND/src/modules/classes/class.service.js

import Class from './class.model.js';
import { paginate } from '../../utils/pagination.js';

class ClassService {
  async createClass(data, createdBy) {
    const existing = await Class.findOne({
      name: data.name,
      section: data.section || 'A',
      schoolId: data.schoolId,
      academicYear: data.academicYear,
    });
    if (existing) {
      const error = new Error('A class with this name and section already exists for this academic year.');
      error.statusCode = 409;
      throw error;
    }
    const cls = await Class.create({ ...data, createdBy });
    return cls.populate('schoolId', 'name code');
  }

  async getAllClasses(query, scope) {
    const {
      page = 1, limit = 20, status, search,
      gradeLevel, academicYear, teacherId,
    } = query;

    const filter = { ...scope };
    if (status) filter.status = status;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (academicYear) filter.academicYear = academicYear;
    if (teacherId) {
      filter.$or = [
        { classTeacherId: teacherId },
        { 'subjectTeachers.teacherId': teacherId },
      ];
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    return paginate(Class, filter, {
      page,
      limit,
      sort: { gradeLevel: 1, name: 1 },
      populate: [
        { path: 'classTeacherId', select: 'firstName lastName email' },
        { path: 'schoolId', select: 'name code' },
      ],
    });
  }

  async getClassById(id, scope) {
    const filter = { _id: id, ...scope };
    return Class.findOne(filter)
      .populate('classTeacherId', 'firstName lastName email')
      .populate('subjectTeachers.teacherId', 'firstName lastName')
      .populate('subjectTeachers.subjectId', 'name code')
      .populate('schoolId', 'name code')
      .lean();
  }

  async updateClass(id, data, updatedBy, scope) {
    const filter = { _id: id, ...scope };
    const cls = await Class.findOneAndUpdate(
      filter,
      { ...data, updatedBy },
      { new: true, runValidators: true }
    );
    return cls;
  }

  async deleteClass(id, scope) {
    const filter = { _id: id, ...scope };
    return Class.findOneAndDelete(filter);
  }

  async getClassesForTeacher(userId, scope) {
    const filter = {
      ...scope,
      $or: [
        { classTeacherId: userId },
        { 'subjectTeachers.teacherId': userId },
      ],
      status: 'active',
    };
    return Class.find(filter)
      .populate('subjectTeachers.subjectId', 'name code')
      .lean();
  }
}

export default new ClassService();
