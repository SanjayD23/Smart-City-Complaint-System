import { Router } from 'express';
import {
    getDepartments,
    createDepartment,
    getOfficersByDepartment
} from '../controllers/department.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all departments (all roles)
router.get('/', getDepartments);

// Create department (admin only)
router.post('/', authorizeRoles('admin'), createDepartment);

// Get officers by department (admin only)
router.get('/:departmentId/officers', authorizeRoles('admin'), getOfficersByDepartment);

export default router;
