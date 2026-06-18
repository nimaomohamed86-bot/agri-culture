import { Router } from 'express';
import {
  getDeliveries,
  getDelivery,
  updateDelivery,
  assignDriver,
} from '../controllers/delivery.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'SUPPLIER'), getDeliveries);
router.get('/:id', authenticate, getDelivery);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPPLIER'), updateDelivery);
router.post(
  '/assign/:orderId',
  authenticate,
  authorize('ADMIN', 'SUPPLIER'),
  assignDriver
);

export default router;
