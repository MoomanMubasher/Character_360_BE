// BACKEND/src/modules/academic/assignments/assignment.service.js

import Assignment from './assignment.model.js';
import { paginate } from '../../../utils/pagination.js';

class AssignmentService {
  async createAssignment(data, createdBy) {
    return Assignment.create({ ...data, teacherId: createdBy, createdBy });
  }

  async getAllAssignments(query, scope) {
    const { page = 1, limit = 20, classId, subjectId, type, status, search, startDate, endDate } = query;
    const filter = { ...scope };
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }
    return paginate(Assignment, filter, {
      page,
      limit,
      sort: { dueDate: 1 },
      populate: [
        { path: 'classId', select: 'name section gradeLevel' },
        { path: 'subjectId', select: 'name code' },
        { path: 'teacherId', select: 'firstName lastName' },
      ],
    });
  }

  async getAssignmentById(id, scope) {
    return Assignment.findOne({ _id: id, ...scope })
      .populate('classId', 'name section gradeLevel')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email')
      .lean();
  }

  async updateAssignment(id, data, updatedBy, scope) {
    return Assignment.findOneAndUpdate(
      { _id: id, ...scope },
      { ...data, updatedBy },
      { new: true, runValidators: true }
    );
  }

  async deleteAssignment(id, scope) {
    return Assignment.findOneAndDelete({ _id: id, ...scope });
  }

  async publishAssignment(id, updatedBy, scope) {
    return Assignment.findOneAndUpdate(
      { _id: id, ...scope },
      { status: 'published', isPublished: true, updatedBy },
      { new: true }
    );
  }

  async getUpcomingForTeacher(teacherUserId, scope, limit = 5) {
    const now = new Date();
    return Assignment.find({
      teacherId: teacherUserId,
      ...scope,
      dueDate: { $gte: now },
      status: 'published',
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .populate('classId', 'name section')
      .populate('subjectId', 'name code')
      .lean();
  }
}

export default new AssignmentService();
