import express from 'express';
import * as companyController from './company.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Read endpoints
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// Write/Admin-only endpoints
router.post('/', restrictTo(USER_ROLE.ADMIN), companyController.createCompany);
router.put('/:id', restrictTo(USER_ROLE.ADMIN), companyController.updateCompany);
router.delete('/:id', restrictTo(USER_ROLE.ADMIN), companyController.deleteCompany);

export default router;
