import express from 'express';
import { getProfile, searchUsers, getFriends, addFriend, toggleFavorite, getSuggestions } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', verifyToken, getProfile);
router.get('/search', verifyToken, searchUsers);
router.get('/friends', verifyToken, getFriends);
router.get('/suggestions', verifyToken, getSuggestions);
router.post('/friends', verifyToken, addFriend);
router.post('/favorites', verifyToken, toggleFavorite); // post handler in controller handles response
router.get('/:id', verifyToken, getProfile);

export default router;
