// BACKEND/src/modules/counties/county.service.js

import County from './county.model.js';
import { paginate } from '../../utils/pagination.js';
import { formatDoc, formatDocs } from '../../utils/helpers.js';

const REF_MAP = {
  academicYearId: 'academic_year_id',
  countryId: 'country_id',
  stateId: 'state_id',
};

class CountyService {
  async create(body, userId) {
    const exists = await County.findOne({
      code: body.code,
      stateId: body.state_id,
      academicYearId: body.academic_year_id,
    });
    if (exists) {
      const err = new Error('A county with this code already exists for the selected state and academic year');
      err.statusCode = 409;
      throw err;
    }

    const doc = await County.create({
      name: body.name,
      code: body.code,
      countryId: body.country_id,
      stateId: body.state_id,
      academicYearId: body.academic_year_id,
      status: body.status || 'active',
      createdBy: userId,
    });

    // Return populated
    return this.getById(doc._id);
  }

  async getAll(query) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.country_id) filter.countryId = query.country_id;
    if (query.state_id) filter.stateId = query.state_id;
    if (query.academic_year_id) filter.academicYearId = query.academic_year_id;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { code: { $regex: query.search, $options: 'i' } },
      ];
    }

    const result = await paginate(County, filter, {
      page: query.page,
      limit: query.limit,
      sort: { name: 1 },
      populate: [
        { path: 'countryId', select: 'name code' },
        { path: 'stateId', select: 'name code' },
        { path: 'academicYearId', select: 'name' },
      ],
    });

    const data = result.data.map((doc) => {
      const formatted = formatDoc(doc, REF_MAP);
      formatted.country_name = doc.countryId?.name || '';
      formatted.state_name = doc.stateId?.name || '';
      formatted.academic_year_name = doc.academicYearId?.name || '';
      formatted.country_id = doc.countryId?._id?.toString() || formatted.country_id;
      formatted.state_id = doc.stateId?._id?.toString() || formatted.state_id;
      formatted.academic_year_id = doc.academicYearId?._id?.toString() || formatted.academic_year_id;
      return formatted;
    });

    return { data, pagination: result.pagination };
  }

  async getById(id) {
    const doc = await County.findById(id)
      .populate('countryId', 'name code')
      .populate('stateId', 'name code')
      .populate('academicYearId', 'name')
      .lean();
    if (!doc) return null;

    const result = formatDoc(doc, REF_MAP);
    result.country_name = doc.countryId?.name || '';
    result.state_name = doc.stateId?.name || '';
    result.academic_year_name = doc.academicYearId?.name || '';
    result.country_id = doc.countryId?._id?.toString() || result.country_id;
    result.state_id = doc.stateId?._id?.toString() || result.state_id;
    result.academic_year_id = doc.academicYearId?._id?.toString() || result.academic_year_id;
    return result;
  }

  async update(id, body, userId) {
    const updateData = { updatedBy: userId };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code;
    if (body.country_id !== undefined) updateData.countryId = body.country_id;
    if (body.state_id !== undefined) updateData.stateId = body.state_id;
    if (body.academic_year_id !== undefined) updateData.academicYearId = body.academic_year_id;
    if (body.status !== undefined) updateData.status = body.status;

    const doc = await County.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('countryId', 'name code')
      .populate('stateId', 'name code')
      .populate('academicYearId', 'name')
      .lean();

    if (!doc) return null;

    const result = formatDoc(doc, REF_MAP);
    result.country_name = doc.countryId?.name || '';
    result.state_name = doc.stateId?.name || '';
    result.academic_year_name = doc.academicYearId?.name || '';
    result.country_id = doc.countryId?._id?.toString() || result.country_id;
    result.state_id = doc.stateId?._id?.toString() || result.state_id;
    result.academic_year_id = doc.academicYearId?._id?.toString() || result.academic_year_id;
    return result;
  }

  async delete(id) {
    const doc = await County.findByIdAndDelete(id);
    return !!doc;
  }
}

export default new CountyService();
