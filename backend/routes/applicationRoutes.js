import express from 'express';
import {
  getApplications,
  submitApplication,
  updateApplicationStatus,
  withdrawApplication,
  getStudentApplications
} from '../controllers/applicationController.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', submitApplication);
router.put('/:id/status', updateApplicationStatus);
router.patch('/:id/status', updateApplicationStatus);
router.post('/:id/withdraw', withdrawApplication);
router.get('/student/:studentId', getStudentApplications);

export default router;
