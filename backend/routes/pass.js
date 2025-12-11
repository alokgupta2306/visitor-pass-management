import { Router } from 'express';
import { 
  issuePass, 
  listPasses, 
  updatePassStatus, 
  verifyPass,
  getPass,
  expireOldPasses
} from '../controllers/passController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listPasses);
router.get('/:id', requireAuth, getPass);
router.post('/', requireAuth, requireRole(['security', 'admin']), issuePass);
router.patch('/:id/status', requireAuth, updatePassStatus);
router.post('/verify', requireAuth, requireRole(['security', 'admin']), verifyPass);
router.post('/expire-old', requireAuth, requireRole(['admin']), expireOldPasses);

export default router;