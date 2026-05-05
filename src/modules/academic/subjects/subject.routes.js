// BACKEND/src/modules/academic/subjects/subject.routes.js

import express from 'express';
import * as subjectController from './subject.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../../middlewares/tenant.middleware.js';

const router = express.Router();

// Middleware
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * @route   GET /api/v1/subjects
 * @desc    Get all subjects
 * @access  Private
 */
router.get('/', subjectController.getAllSubjects);

/**
 * @route   GET /api/v1/subjects/types
 * @desc    Get subject types/categories
 * @access  Private
 */
router.get('/types', subjectController.getSubjectTypes);

/**
 * @route   GET /api/v1/subjects/by-category/:category
 * @desc    Get subjects by category
 * @access  Private
 */
router.get('/by-category/:category', subjectController.getSubjectsByCategory);

/**
 * @route   GET /api/v1/subjects/by-department/:departmentId
 * @desc    Get subjects by department
 * @access  Private
 */
router.get('/by-department/:departmentId', subjectController.getSubjectsByDepartment);

/**
 * @route   GET /api/v1/subjects/:id
 * @desc    Get single subject
 * @access  Private
 */
router.get('/:id', subjectController.getSubjectById);

/**
 * @route   POST /api/v1/subjects
 * @desc    Create subject
 * @access  Private (Admin/Staff)
 */
router.post('/', subjectController.createSubject);

/**
 * @route   PUT /api/v1/subjects/:id
 * @desc    Update subject
 * @access  Private (Admin/Staff)
 */
router.put('/:id', subjectController.updateSubject);

/**
 * @route   DELETE /api/v1/subjects/:id
 * @desc    Delete subject
 * @access  Private (Admin/Staff)
 */
router.delete('/:id', subjectController.deleteSubject);

export default router;
