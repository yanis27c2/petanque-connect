import express from 'express';
import { getNews } from '../controllers/newsController.js';

const router = express.Router();

// GET /api/news/petanque — returns top 5 pétanque articles
router.get('/petanque', getNews);

export default router;
