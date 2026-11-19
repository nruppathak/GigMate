import express from 'express';
import { getMessages, sendMessage, getConversations } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getMessages);
router.post('/', sendMessage);
router.get('/conversations/:userId', getConversations);
router.get('/:userId', getConversations);

export default router;
