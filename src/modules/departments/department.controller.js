// BACKEND/src/modules/departments/department.controller.js

import * as departmentService from './department.service.js';
import { sendResponse } from '../../utils/response.js';

/**
 * Get all departments
 * GET /api/v1/departments
 */
export const getAllDepartments = async (req, res) => {
  try {
    const { schoolId, districtId, status, withSubjects } = req.query;
    
    const filter = {
      schoolId: schoolId || req.user?.schoolId,
      districtId: districtId || req.user?.districtId,
      status: status || 'active',
      withSubjects: withSubjects === 'true',
    };

    const departments = await departmentService.getAllDepartments(filter);
    
    return sendResponse(res, 200, 'Departments fetched successfully', departments);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Get departments with their subjects
 * GET /api/v1/departments/with-subjects
 */
export const getDepartmentsWithSubjects = async (req, res) => {
  try {
    const { schoolId, districtId, status } = req.query;
    
    const filter = {
      schoolId: schoolId || req.user?.schoolId,
      districtId: districtId || req.user?.districtId,
      status: status || 'active',
    };

    const departments = await departmentService.getDepartmentsWithSubjects(filter);
    
    return sendResponse(res, 200, 'Departments fetched successfully', departments);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Get single department
 * GET /api/v1/departments/:id
 */
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await departmentService.getDepartmentById(id);
    
    if (!department) {
      return sendResponse(res, 404, 'Department not found');
    }
    
    return sendResponse(res, 200, 'Department fetched successfully', department);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Create department
 * POST /api/v1/departments
 */
export const createDepartment = async (req, res) => {
  try {
    const data = {
      ...req.body,
      districtId: req.user?.districtId,
      schoolId: req.user?.schoolId,
    };

    const department = await departmentService.createDepartment(data);
    
    return sendResponse(res, 201, 'Department created successfully', department);
  } catch (error) {
    return sendResponse(res, 400, error.message);
  }
};

/**
 * Update department
 * PUT /api/v1/departments/:id
 */
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await departmentService.updateDepartment(id, req.body);
    
    if (!department) {
      return sendResponse(res, 404, 'Department not found');
    }
    
    return sendResponse(res, 200, 'Department updated successfully', department);
  } catch (error) {
    return sendResponse(res, 400, error.message);
  }
};

/**
 * Delete department
 * DELETE /api/v1/departments/:id
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await departmentService.deleteDepartment(id);
    
    if (!department) {
      return sendResponse(res, 404, 'Department not found');
    }
    
    return sendResponse(res, 200, 'Department deleted successfully');
  } catch (error) {
    return sendResponse(res, 400, error.message);
  }
};
