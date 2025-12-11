import { Router } from 'express';
import {
  createVisitor,
  deleteVisitor,
  getVisitor,
  listVisitors,
  updateVisitor,
  preRegisterVisitor,
} from '../controllers/visitorController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

// Public pre-registration (no auth required)
router.post('/pre-register', upload.single('photo'), preRegisterVisitor);

router.get('/', requireAuth, listVisitors);
router.get('/:id', requireAuth, getVisitor);
router.post('/', requireAuth, requireRole(['admin', 'security', 'employee']), upload.single('photo'), createVisitor);
router.put('/:id', requireAuth, upload.single('photo'), updateVisitor);
router.delete('/:id', requireAuth, requireRole(['admin']), deleteVisitor);

export default router;