import { validationResult } from 'express-validator';
import prisma from '../config/db.js';
import { paginate, buildPaginationMeta, sanitizeUser, getStockStatus } from '../utils/helpers.js';
import { uploadImage } from '../config/upload.js';
import {
  syncProductStock,
  recordInventoryMovement,
} from '../services/inventory.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, search, category, stockStatus, sortBy = 'createdAt', order = 'desc' } = req.query;
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (stockStatus) where.stockStatus = stockStatus;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        include: {
          supplier: { select: { id: true, fullName: true, email: true } },
          farmer: { select: { id: true, fullName: true, email: true } },
          inventory: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      meta: buildPaginationMeta(total, pageNum, limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: { select: { id: true, fullName: true, email: true } },
        farmer: { select: { id: true, fullName: true, email: true } },
        inventory: true,
      },
    });

    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, category, description, price, quantity, unit, farmerId } = req.body;
    const imageUrl = req.file ? await uploadImage(req.file) : null;

    let supplierId = req.body.supplierId;
    if (req.user.role === 'SUPPLIER') supplierId = req.user.id;
    if (req.user.role === 'FARMER') {
      supplierId = supplierId || null;
    }

    const qty = parseInt(quantity, 10) || 0;
    const stockStatus = getStockStatus(qty);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          category,
          description,
          price: parseFloat(price),
          quantity: qty,
          unit: unit || 'Kg',
          image: imageUrl,
          stockStatus,
          supplierId: supplierId || null,
          farmerId: req.user.role === 'FARMER' ? req.user.id : farmerId || null,
        },
      });

      await tx.inventory.create({
        data: {
          productId: created.id,
          currentStock: qty,
          minimumStock: parseInt(req.body.minimumStock, 10) || 10,
        },
      });

      if (qty > 0) {
        await recordInventoryMovement(created.id, 'STOCK_IN', qty, 'Initial stock', tx);
      }

      return created;
    });

    const full = await prisma.product.findUnique({
      where: { id: product.id },
      include: { supplier: true, farmer: true, inventory: true },
    });

    res.status(201).json({ success: true, data: full });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) throw new AppError('Product not found', 404);

    if (req.user.role === 'SUPPLIER' && product.supplierId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }
    if (req.user.role === 'FARMER' && product.farmerId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    const imageUrl = req.file ? await uploadImage(req.file) : product.image;
    const { name, category, description, price, unit } = req.body;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ?? product.name,
        category: category ?? product.category,
        description: description ?? product.description,
        price: price !== undefined ? parseFloat(price) : product.price,
        unit: unit ?? product.unit,
        image: imageUrl,
      },
      include: { supplier: true, farmer: true, inventory: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateProductQuantity = async (req, res, next) => {
  try {
    const { quantity, type, note } = req.body;
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { inventory: true },
    });

    if (!product) throw new AppError('Product not found', 404);

    const qtyChange = parseInt(quantity, 10);
    let newQty = product.quantity;

    if (type === 'STOCK_IN') newQty += qtyChange;
    else if (type === 'STOCK_OUT') newQty = Math.max(0, newQty - qtyChange);
    else newQty = qtyChange;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: { quantity: newQty },
      });
      await tx.inventory.update({
        where: { productId: product.id },
        data: { currentStock: newQty },
      });
      await recordInventoryMovement(
        product.id,
        type || 'ADJUSTMENT',
        qtyChange,
        note || `Stock ${type || 'adjustment'}`,
        tx
      );
    });

    await syncProductStock(product.id);

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { inventory: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) throw new AppError('Product not found', 404);

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (_req, res) => {
  res.json({
    success: true,
    data: [
      'FRUITS',
      'VEGETABLES',
      'GRAINS',
      'SEEDS',
      'FERTILIZERS',
      'LIVESTOCK_FEED',
    ],
  });
};
