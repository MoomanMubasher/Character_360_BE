// BACKEND/src/modules/departments/department.routes.js

import express from 'express';
import * as departmentController from './department.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../middlewares/tenant.middleware.js';

const router = express.Router();

// Middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @route   GET /api/v1/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get('/', departmentController.getAllDepartments);

/**
 * @route   GET /api/v1/departments/with-subjects
 * @desc    Get departments with their subjects
 * @access  Private
 */
router.get('/with-subjects', departmentController.getDepartmentsWithSubjects);

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Get single department
 * @access  Private
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @route   POST /api/v1/departments
 * @desc    Create department
 * @access  Private (Admin/Staff)
 */
router.post('/', departmentController.createDepartment);

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department
 * @access  Private (Admin/Staff)
 */
router.put('/:id', departmentController.updateDepartment);

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Delete department
 * @access  Private (Admin/Staff)
 */
router.delete('/:id', departmentController.deleteDepartment);

export default router;
