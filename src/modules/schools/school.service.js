// BACKEND/src/modules/schools/school.service.js

import School from './school.model.js';
import { paginate } from '../../utils/pagination.js';
import { formatDoc } from '../../utils/helpers.js';

const REF_MAP = {
  districtId: 'district_id',
  principalId: 'principal_id',
};

const toResponse = (doc) => {
  const result = formatDoc(doc, REF_MAP);
  if (!result) return null;

  if (doc.districtId && typeof doc.districtId === 'object') {
    result.district_name = doc.districtId.name || '';
    result.district_id = doc.districtId._id?.toString();
  }
  if (doc.principalId && typeof doc.principalId === 'object') {
    result.principal_name = `${doc.principalId.firstName || ''} ${doc.principalId.lastName || ''}`.trim();
    result.principal_email = doc.principalId.email || '';
    result.principal_id = doc.principalId._id?.toString();
  }

  // Map address plain-string fields to flat response keys
  result.country_name = doc.address?.country || '';
  result.state_name = doc.address?.state || '';
  result.county_name = '';  // School model has no county reference
  result.academic_year = doc.currentAcademicYear || '';

  return result;
};

const POPULATE_REFS = [
  { path: 'districtId', select: 'name code' },
  { path: 'principalId', select: 'firstName lastName email' },
];

class SchoolService {
  async create(body, createdBy) {
    const existing = await School.findOne({ code: body.code });
    if (existing) {
      const err = new Error('A school with this code already exists');
      err.statusCode = 409;
      throw err;
    }

    const school = await School.create({
      name: body.name,
      code: body.code,
      description: body.description,
      districtId: body.district_id,
      type: body.type,
      gradeLevels: body.grade_levels,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      status: body.status || 'active',
      createdBy,
    });

    return toResponse(school.toObject());
  }

  async getAll(query = {}) {
    const { page, limit, status, district_id, type, search } = query;

    const filter = {};
    if (status) filter.status = status;
    if (district_id) filter.districtId = district_id;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await paginate(School, filter, {
      page,
      limit,
      populate: POPULATE_REFS,
    });

    return {
      ...result,
      data: result.data.map(toResponse),
    };
  }

  async getById(id) {
    const school = await School.findById(id).populate(POPULATE_REFS).lean();
    return toResponse(school);
  }

  async update(id, body, updatedBy) {
    const updateData = { updatedBy };

    if (body.name) updateData.name = body.name;
    if (body.code) updateData.code = body.code;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type) updateData.type = body.type;
    if (body.grade_levels) updateData.gradeLevels = body.grade_levels;
    if (body.address) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.status) updateData.status = body.status;

    const school = await School.findByIdAndUpdate(id, updateData, { new: true })
      .populate(POPULATE_REFS)
      .lean();
    return toResponse(school);
  }

  async delete(id) {
    return School.findByIdAndDelete(id).lean();
  }
}

export default new SchoolService();
