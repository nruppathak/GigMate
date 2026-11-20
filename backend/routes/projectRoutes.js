import express from 'express';
import {
  getProjects,
  getRecommendedProjects,
  getProjectById,
  createProject
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/recommended/:studentId', getRecommendedProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);

export default router;
