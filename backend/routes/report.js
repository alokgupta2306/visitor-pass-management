import { Router } from 'express';
import { getSummary } from '../controllers/reportController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

// Changed: Allow all authenticated users to see summary
router.get('/summary', requireAuth, getSummary);

export default router;