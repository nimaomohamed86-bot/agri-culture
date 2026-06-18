import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductQuantity,
  deleteProduct,
  getCategories,
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/upload.js';
import { productValidation } from '../validators/auth.validator.js';

const router = Router();

router.get('/', authenticate, getProducts);
router.get('/categories', getCategories);
router.get('/:id', authenticate, getProduct);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPPLIER', 'FARMER'),
  upload.single('image'),
  productValidation,
  createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPPLIER', 'FARMER'),
  upload.single('image'),
  updateProduct
);
router.patch(
  '/:id/quantity',
  authenticate,
  authorize('ADMIN', 'SUPPLIER'),
  updateProductQuantity
);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
