import { Router } from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getInventoryReport,
  getSupplierPerformance,
  getCustomerPurchases,
  getFarmerEarnings,
  exportSalesExcel,
  exportSalesPDF,
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/sales', authenticate, authorize('ADMIN'), getSalesReport);
router.get('/inventory', authenticate, authorize('ADMIN', 'SUPPLIER'), getInventoryReport);
router.get('/suppliers', authenticate, authorize('ADMIN'), getSupplierPerformance);
router.get('/customers', authenticate, authorize('ADMIN'), getCustomerPurchases);
router.get('/farmer-earnings', authenticate, authorize('FARMER', 'ADMIN'), getFarmerEarnings);
router.get('/export/sales/excel', authenticate, authorize('ADMIN'), exportSalesExcel);
router.get('/export/sales/pdf', authenticate, authorize('ADMIN'), exportSalesPDF);

export default router;
