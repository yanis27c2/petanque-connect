import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createResult, getResults, getMyResults, deleteResult, toggleLike } from '../controllers/resultController.js';

const router = express.Router();

// Public
router.get('/', getResults);

// Protected
router.post('/', verifyToken, createResult);
router.get('/mine', verifyToken, getMyResults);
router.delete('/:id', verifyToken, deleteResult);
router.post('/:id/like', verifyToken, toggleLike);

export default router;
