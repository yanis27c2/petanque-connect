import express from 'express';
import { getConversations, getMessages, sendMessage, createOrGetConversation } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', verifyToken, getConversations);
router.get('/:id/messages', verifyToken, getMessages);
router.post('/send', verifyToken, sendMessage);
router.post('/conversation', verifyToken, createOrGetConversation);

export default router;
