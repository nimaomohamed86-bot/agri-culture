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
} from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/cart', authenticate, authorize('CUSTOMER'), getCart);
router.post('/cart', authenticate, authorize('CUSTOMER'), addToCart);
router.put('/cart/:itemId', authenticate, authorize('CUSTOMER'), updateCartItem);
router.delete('/cart/:itemId', authenticate, authorize('CUSTOMER'), removeFromCart);
router.delete('/cart', authenticate, authorize('CUSTOMER'), clearCart);
router.post('/checkout', authenticate, authorize('CUSTOMER'), checkout);

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.get('/:id/invoice', authenticate, getInvoice);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'SUPPLIER'), updateOrderStatus);
router.patch('/:id/cancel', authenticate, cancelOrder);

export default router;
