// BACKEND/src/modules/academic/subjects/subject.controller.js

import * as subjectService from './subject.service.js';
import { sendResponse } from '../../../utils/response.js';

/**
 * Get all subjects
 * GET /api/v1/subjects
 */
export const getAllSubjects = async (req, res) => {
  try {
    const { schoolId, districtId, category, departmentId, status } = req.query;
    
    const filter = {
      schoolId: schoolId || req.user?.schoolId,
      districtId: districtId || req.user?.districtId,
      category,
      departmentId,
      status: status || 'active',
    };

    const subjects = await subjectService.getAllSubjects(filter);
    
    return sendResponse(res, 200, 'Subjects fetched successfully', subjects);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Get subject types/categories
 * GET /api/v1/subjects/types
 */
export const getSubjectTypes = async (req, res) => {
  try {
    const { schoolId, districtId, status } = req.query;
    
    const filter = {
      schoolId: schoolId || req.user?.schoolId,
      districtId: districtId || req.user?.districtId,
      status: status || 'active',
    };

    const types = await subjectService.getSubjectTypes(filter);
    
    return sendResponse(res, 200, 'Subject types fetched successfully', types);
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

    const departments = await subjectService.getDepartmentsWithSubjects(filter);
    
    return sendResponse(res, 200, 'Departments fetched successfully', departments);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Get subjects by category
 * GET /api/v1/subjects/by-category/:category
 */
export const getSubjectsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { schoolId, districtId, status } = req.query;
    
    const filter = {
      schoolId: schoolId || req.user?.schoolId,
      districtId: districtId || req.user?.districtId,
      status: status || 'active',
    };

    const subjects = await subjectService.getSubjectsByCategory(category, filter);
    
    return sendResponse(res, 200, 'Subjects fetched successfully', subjects);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Get subjects by department
 * GET /api/v1/subjects/by-department/:departmentId
 */
export const getSubjectsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { schoolId, districtId, status } = req.query;
    
    const filter = {
      schoolId: schoolId || req.user?.schoolId,
      districtId: districtId || req.user?.districtId,
      status: status || 'active',
    };

    const subjects = await subjectService.getSubjectsByDepartment(departmentId, filter);
    
    return sendResponse(res, 200, 'Subjects fetched successfully', subjects);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Get single subject
 * GET /api/v1/subjects/:id
 */
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await subjectService.getSubjectById(id);
    
    if (!subject) {
      return sendResponse(res, 404, 'Subject not found');
    }
    
    return sendResponse(res, 200, 'Subject fetched successfully', subject);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

/**
 * Create subject
 * POST /api/v1/subjects
 */
export const createSubject = async (req, res) => {
  try {
    const data = {
      ...req.body,
      districtId: req.user?.districtId,
      schoolId: req.user?.schoolId,
      createdBy: req.user?.id,
    };

    const subject = await subjectService.createSubject(data);
    
    return sendResponse(res, 201, 'Subject created successfully', subject);
  } catch (error) {
    return sendResponse(res, 400, error.message);
  }
};

/**
 * Update subject
 * PUT /api/v1/subjects/:id
 */
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {
      ...req.body,
      updatedBy: req.user?.id,
    };

    const subject = await subjectService.updateSubject(id, data);
    
    if (!subject) {
      return sendResponse(res, 404, 'Subject not found');
    }
    
    return sendResponse(res, 200, 'Subject updated successfully', subject);
  } catch (error) {
    return sendResponse(res, 400, error.message);
  }
};

/**
 * Delete subject
 * DELETE /api/v1/subjects/:id
 */
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await subjectService.deleteSubject(id);
    
    if (!subject) {
      return sendResponse(res, 404, 'Subject not found');
    }
    
    return sendResponse(res, 200, 'Subject deleted successfully');
  } catch (error) {
    return sendResponse(res, 400, error.message);
  }
};
