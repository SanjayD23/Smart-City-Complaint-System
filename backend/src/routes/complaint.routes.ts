import { Router } from 'express';
import {
    createComplaint,
    getComplaints,
    getComplaintById,
    assignComplaint,
    updateComplaintStatus
} from '../controllers/complaint.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create complaint (citizen only)
router.post('/', authorizeRoles('citizen'), upload.single('image'), createComplaint);

// Get complaints (all roles, filtered by role in controller)
router.get('/', getComplaints);

// Get complaint by ID
router.get('/:id', getComplaintById);

// Assign complaint to department (admin only)
router.put('/:id/assign', authorizeRoles('admin'), assignComplaint);

// Update complaint status (officer only)
router.put('/:id/status', authorizeRoles('officer'), updateComplaintStatus);

export default router;
