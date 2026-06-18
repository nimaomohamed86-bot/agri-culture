import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getSuppliers,
  getFarmers,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getUsers);
router.get('/suppliers', authenticate, authorize('ADMIN', 'SUPPLIER'), getSuppliers);
router.get('/farmers', authenticate, authorize('ADMIN', 'FARMER'), getFarmers);
router.get('/:id', authenticate, authorize('ADMIN'), getUser);
router.put('/:id', authenticate, authorize('ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;
