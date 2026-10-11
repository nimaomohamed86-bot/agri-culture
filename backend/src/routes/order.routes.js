import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getInvoice,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller.js';

import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Cart Routes
router.get('/cart', authenticate, authorize('CUSTOMER'), getCart);
router.post('/cart', authenticate, authorize('CUSTOMER'), addToCart);
router.put('/cart/:itemId', authenticate, authorize('CUSTOMER'), updateCartItem);
router.delete('/cart/:itemId', authenticate, authorize('CUSTOMER'), removeFromCart);
router.delete('/cart', authenticate, authorize('CUSTOMER'), clearCart);
router.post('/checkout', authenticate, authorize('CUSTOMER'), checkout);

// Orders Routes
router.get('/', authenticate, getOrders);

// KU DAR HALKAN ↓↓↓
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createOrder
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateOrder
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  deleteOrder
);
// KU DAR HALKAN ↑↑↑

router.get('/:id', authenticate, getOrder);
router.get('/:id/invoice', authenticate, getInvoice);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'SUPPLIER'), updateOrderStatus);
router.patch('/:id/cancel', authenticate, cancelOrder);

export default router;