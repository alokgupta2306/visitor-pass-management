import { Router } from 'express';
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
  getAppointment,
} from '../controllers/appointmentController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listAppointments);
router.get('/:id', requireAuth, getAppointment);
router.post('/', requireAuth, requireRole(['employee', 'admin', 'security']), createAppointment);
router.patch('/:id/status', requireAuth, requireRole(['employee', 'admin']), updateAppointmentStatus);

export default router;