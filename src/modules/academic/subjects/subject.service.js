// BACKEND/src/modules/academic/subjects/subject.service.js

import Subject from './subject.model.js';
import Department from '../../departments/department.model.js';

/**
 * Get all subjects for a school/district
 * @param {Object} filter - Filter options
 * @returns {Promise<Array>} - Array of subjects
 */
export const getAllSubjects = async (filter = {}) => {
  try {
    const { schoolId, districtId, category, departmentId, status = 'active' } = filter;

    let query = {};
    
    if (districtId) query.districtId = districtId;
    if (schoolId) query.schoolId = schoolId;
    if (category) query.category = category;
    if (departmentId) query.departmentId = departmentId;
    if (status) query.status = status;

    const subjects = await Subject.find(query)
      .populate('departmentId', 'name code')
      .sort({ name: 1 });

    return subjects;
  } catch (error) {
    throw new Error(`Error fetching subjects: ${error.message}`);
  }
};

/**
 * Get subject types/categories
 * @returns {Promise<Array>} - Array of subject categories with counts
 */
export const getSubjectTypes = async (filter = {}) => {
  try {
    const { schoolId, districtId, status = 'active' } = filter;

    let query = { status };
    
    if (districtId) query.districtId = districtId;
    if (schoolId) query.schoolId = schoolId;

    const categories = [
      'core',
      'elective',
      'honors',
      'ap',
      'special_education',
      'physical_education',
      'arts',
      'technology',
      'foreign_language',
      'other',
    ];

    const subjectTypes = [];

    for (const category of categories) {
      const count = await Subject.countDocuments({ ...query, category });
      if (count > 0) {
        subjectTypes.push({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '),
          count,
        });
      }
    }

    return subjectTypes;
  } catch (error) {
    throw new Error(`Error fetching subject types: ${error.message}`);
  }
};

/**
 * Get departments with their subjects
 * @param {Object} filter - Filter options
 * @returns {Promise<Array>} - Array of departments with subject counts
 */
export const getDepartmentsWithSubjects = async (filter = {}) => {
  try {
    const { schoolId, districtId, status = 'active' } = filter;

    let query = { status };
    
    if (districtId) query.districtId = districtId;
    if (schoolId) query.schoolId = schoolId;

    const departments = await Department.find(query)
      .populate('subjects', 'name category code')
      .sort({ name: 1 });

    // Filter departments that have subjects and map with subject counts
    const departmentsWithSubjects = departments
      .filter(dept => dept.subjects && dept.subjects.length > 0)
      .map(dept => ({
        id: dept._id,
        name: dept.name,
        code: dept.code,
        color: dept.color || '#666',
        count: dept.subjects.length,
        subjects: dept.subjects,
      }));

    return departmentsWithSubjects;
  } catch (error) {
    throw new Error(`Error fetching departments: ${error.message}`);
  }
};

/**
 * Get subjects by category
 * @param {String} category - Subject category
 * @param {Object} filter - Additional filters
 * @returns {Promise<Array>} - Array of subjects
 */
export const getSubjectsByCategory = async (category, filter = {}) => {
  try {
    const { schoolId, districtId, status = 'active' } = filter;

    let query = { category, status };
    
    if (districtId) query.districtId = districtId;
    if (schoolId) query.schoolId = schoolId;

    const subjects = await Subject.find(query)
      .populate('departmentId', 'name code')
      .sort({ name: 1 });

    return subjects;
  } catch (error) {
    throw new Error(`Error fetching subjects by category: ${error.message}`);
  }
};

/**
 * Get subjects by department
 * @param {String} departmentId - Department ID
 * @param {Object} filter - Additional filters
 * @returns {Promise<Array>} - Array of subjects
 */
export const getSubjectsByDepartment = async (departmentId, filter = {}) => {
  try {
    const { schoolId, districtId, status = 'active' } = filter;

    let query = { departmentId, status };
    
    if (districtId) query.districtId = districtId;
    if (schoolId) query.schoolId = schoolId;

    const subjects = await Subject.find(query)
      .populate('departmentId', 'name code')
      .sort({ name: 1 });

    return subjects;
  } catch (error) {
    throw new Error(`Error fetching subjects by department: ${error.message}`);
  }
};

/**
 * Create a new subject
 * @param {Object} data - Subject data
 * @returns {Promise<Object>} - Created subject
 */
export const createSubject = async (data) => {
  try {
    const subject = new Subject(data);
    await subject.save();
    return subject.populate('departmentId', 'name code');
  } catch (error) {
    throw new Error(`Error creating subject: ${error.message}`);
  }
};

/**
 * Update subject
 * @param {String} subjectId - Subject ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated subject
 */
export const updateSubject = async (subjectId, data) => {
  try {
    const subject = await Subject.findByIdAndUpdate(subjectId, data, {
      new: true,
      runValidators: true,
    }).populate('departmentId', 'name code');

    return subject;
  } catch (error) {
    throw new Error(`Error updating subject: ${error.message}`);
  }
};

/**
 * Delete subject
 * @param {String} subjectId - Subject ID
 * @returns {Promise<Object>} - Deleted subject
 */
export const deleteSubject = async (subjectId) => {
  try {
    const subject = await Subject.findByIdAndDelete(subjectId);
    return subject;
  } catch (error) {
    throw new Error(`Error deleting subject: ${error.message}`);
  }
};

/**
 * Get single subject
 * @param {String} subjectId - Subject ID
 * @returns {Promise<Object>} - Subject details
 */
export const getSubjectById = async (subjectId) => {
  try {
    const subject = await Subject.findById(subjectId)
      .populate('departmentId', 'name code')
      .populate('prerequisites', 'name code');

    return subject;
  } catch (error) {
    throw new Error(`Error fetching subject: ${error.message}`);
  }
};
