import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  addUserSkill,
  removeUserSkill,
  addPortfolio,
  removePortfolio,
  deleteUser,
  deleteAllCreatedUsers
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.delete('/cleanup/all-custom', deleteAllCreatedUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/skills', addUserSkill);
router.delete('/:id/skills/:skillName', removeUserSkill);
router.post('/:id/portfolios', addPortfolio);

export default router;
