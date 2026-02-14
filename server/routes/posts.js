import express from 'express';
import { getPosts, createPost, likePost } from '../controllers/postController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getPosts);
router.post('/', verifyToken, createPost);
router.post('/:id/like', verifyToken, likePost);

export default router;
