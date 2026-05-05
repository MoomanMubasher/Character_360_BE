// BACKEND/src/modules/departments/department.service.js

import Department from './department.model.js';

/**
 * Get all departments
 * @param {Object} filter - Filter options
 * @returns {Promise<Array>} - Array of departments
 */
export const getAllDepartments = async (filter = {}) => {
  try {
    const { schoolId, districtId, status = 'active', withSubjects = false } = filter;

    let query = {};
    
    if (districtId) query.districtId = districtId;
    if (schoolId) query.schoolId = schoolId;
    if (status) query.status = status;

    let query_obj = Department.find(query)
      .populate('headOfDepartmentId', 'firstName lastName email')
      .populate('teachers', 'firstName lastName email')
      .sort({ name: 1 });

    if (withSubjects) {
      query_obj = query_obj.populate('subjects', 'name code category');
    }

    const departments = await query_obj;

    return departments;
  } catch (error) {
    throw new Error(`Error fetching departments: ${error.message}`);
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
        subjects: dept.subjects.map(s => ({
          id: s._id,
          name: s.name,
          code: s.code,
          category: s.category,
        })),
      }));

    return departmentsWithSubjects;
  } catch (error) {
    throw new Error(`Error fetching departments with subjects: ${error.message}`);
  }
};

/**
 * Get single department
 * @param {String} departmentId - Department ID
 * @returns {Promise<Object>} - Department details
 */
export const getDepartmentById = async (departmentId) => {
  try {
    const department = await Department.findById(departmentId)
      .populate('headOfDepartmentId', 'firstName lastName email')
      .populate('teachers', 'firstName lastName email')
      .populate('subjects', 'name code category');

    return department;
  } catch (error) {
    throw new Error(`Error fetching department: ${error.message}`);
  }
};

/**
 * Create department
 * @param {Object} data - Department data
 * @returns {Promise<Object>} - Created department
 */
export const createDepartment = async (data) => {
  try {
    const department = new Department(data);
    await department.save();
    return department
      .populate('headOfDepartmentId', 'firstName lastName email')
      .populate('teachers', 'firstName lastName email')
      .populate('subjects', 'name code category');
  } catch (error) {
    throw new Error(`Error creating department: ${error.message}`);
  }
};

/**
 * Update department
 * @param {String} departmentId - Department ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated department
 */
export const updateDepartment = async (departmentId, data) => {
  try {
    const department = await Department.findByIdAndUpdate(departmentId, data, {
      new: true,
      runValidators: true,
    })
      .populate('headOfDepartmentId', 'firstName lastName email')
      .populate('teachers', 'firstName lastName email')
      .populate('subjects', 'name code category');

    return department;
  } catch (error) {
    throw new Error(`Error updating department: ${error.message}`);
  }
};

/**
 * Delete department
 * @param {String} departmentId - Department ID
 * @returns {Promise<Object>} - Deleted department
 */
export const deleteDepartment = async (departmentId) => {
  try {
    const department = await Department.findByIdAndDelete(departmentId);
    return department;
  } catch (error) {
    throw new Error(`Error deleting department: ${error.message}`);
  }
};
