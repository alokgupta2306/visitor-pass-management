import { Router } from 'express';
import { listLogs, logCheck } from '../controllers/checkLogController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listLogs);
router.post('/', requireAuth, requireRole(['security', 'admin']), logCheck);

export default router;


