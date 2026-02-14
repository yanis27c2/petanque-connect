import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getNotifications, markAsRead, acceptFriendRequest } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markAsRead);
router.post('/accept-friend', verifyToken, acceptFriendRequest);

export default router;
