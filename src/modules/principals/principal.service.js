// BACKEND/src/modules/principals/principal.service.js

import Principal from './principal.model.js';
import User from '../users/user.model.js';
import mongoose from 'mongoose';

class PrincipalService {
  async createPrincipal(data, createdBy) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.create(
        [
          {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            roles: [data.title === 'vice_principal' ? 'vice_principal' : 'school_admin'],
            primaryRole: data.title === 'vice_principal' ? 'vice_principal' : 'school_admin',
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

      const principal = await Principal.create(
        [
          {
            userId: user[0]._id,
            districtId: data.districtId,
            schoolId: data.schoolId,
            employeeId: data.employeeId,
            title: data.title || 'principal',
            certifications: data.certifications,
            educationBackground: data.educationBackground,
            dateOfJoining: data.dateOfJoining,
            yearsOfExperience: data.yearsOfExperience,
            previousSchools: data.previousSchools,
            contractType: data.contractType,
            emergencyContact: data.emergencyContact,
            notes: data.notes,
            createdBy,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return await Principal.findById(principal[0]._id)
        .populate('userId', '-password')
        .populate('schoolId', 'name code');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllPrincipals(query, scope) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      title,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter = {};
    if (scope.districtId) filter.districtId = scope.districtId;
    if (scope.schoolId) filter.schoolId = scope.schoolId;
    if (status) filter.status = status;
    if (title) filter.title = title;

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

    const [principals, total] = await Promise.all([
      Principal.find(filter)
        .populate('userId', '-password')
        .populate('schoolId', 'name code')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Principal.countDocuments(filter),
    ]);

    return {
      data: principals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPrincipalById(id, scope) {
    const filter = { _id: id };
    if (scope.districtId) filter.districtId = scope.districtId;
    if (scope.schoolId) filter.schoolId = scope.schoolId;

    return await Principal.findOne(filter)
      .populate('userId', '-password')
      .populate('schoolId', 'name code address');
  }

  async getPrincipalByUserId(userId) {
    return await Principal.findOne({ userId })
      .populate('userId', '-password')
      .populate('schoolId', 'name code');
  }

  async updatePrincipal(id, data, updatedBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;

      const principal = await Principal.findOne(filter);
      if (!principal) return null;

      const userUpdateFields = {};
      ['firstName', 'lastName', 'middleName', 'phone', 'gender', 'dateOfBirth', 'address'].forEach(
        (field) => {
          if (data[field] !== undefined) userUpdateFields[field] = data[field];
        }
      );

      if (Object.keys(userUpdateFields).length > 0) {
        userUpdateFields.updatedBy = updatedBy;
        await User.findByIdAndUpdate(principal.userId, userUpdateFields, { session });
      }

      const principalUpdateFields = {};
      const principalFields = [
        'employeeId', 'title', 'certifications', 'educationBackground',
        'dateOfJoining', 'dateOfLeaving', 'yearsOfExperience',
        'previousSchools', 'contractType', 'emergencyContact',
        'status', 'notes',
      ];

      principalFields.forEach((field) => {
        if (data[field] !== undefined) principalUpdateFields[field] = data[field];
      });

      principalUpdateFields.updatedBy = updatedBy;

      const updatedPrincipal = await Principal.findByIdAndUpdate(
        id,
        principalUpdateFields,
        { new: true, session, runValidators: true }
      )
        .populate('userId', '-password')
        .populate('schoolId', 'name code');

      await session.commitTransaction();
      return updatedPrincipal;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deactivatePrincipal(id, updatedBy, scope) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const filter = { _id: id };
      if (scope.districtId) filter.districtId = scope.districtId;

      const principal = await Principal.findOne(filter);
      if (!principal) return null;

      await User.findByIdAndUpdate(
        principal.userId,
        { status: 'inactive', updatedBy },
        { session }
      );

      const updated = await Principal.findByIdAndUpdate(
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

  async getPrincipalStats(schoolId) {
    const stats = await Principal.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
  }
}

export default new PrincipalService();