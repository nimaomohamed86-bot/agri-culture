import { Router } from 'express';
import {
  getInventory,
  getInventoryHistory,
  updateMinimumStock,
  stockIn,
  stockOut,
} from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'SUPPLIER'), getInventory);
router.get('/history', authenticate, authorize('ADMIN', 'SUPPLIER'), getInventoryHistory);
router.patch(
  '/:productId/minimum',
  authenticate,
  authorize('ADMIN'),
  updateMinimumStock
);
router.post('/:productId/stock-in', authenticate, authorize('ADMIN', 'SUPPLIER'), stockIn);
router.post('/:productId/stock-out', authenticate, authorize('ADMIN', 'SUPPLIER'), stockOut);

export default router;
