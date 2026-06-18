import prisma from '../config/db.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

export const getInventory = async (req, res, next) => {
  try {
    const { page, limit, lowStock } = req.query;
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};
    if (lowStock === 'true') {
      where.OR = [
        { currentStock: { lte: prisma.raw ? undefined : 10 } },
      ];
    }

    const inventories = await prisma.inventory.findMany({
      skip,
      take,
      include: {
        product: {
          include: {
            supplier: { select: { fullName: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let filtered = inventories;
    if (lowStock === 'true') {
      filtered = inventories.filter(
        (inv) => inv.currentStock <= inv.minimumStock
      );
    }

    res.json({
      success: true,
      data: filtered,
      meta: buildPaginationMeta(filtered.length, pageNum, limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const getInventoryHistory = async (req, res, next) => {
  try {
    const { page, limit, productId } = req.query;
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};
    if (productId) where.productId = productId;

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, unit: true } },
        },
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    res.json({
      success: true,
      data: movements,
      meta: buildPaginationMeta(total, pageNum, limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const updateMinimumStock = async (req, res, next) => {
  try {
    const { minimumStock } = req.body;
    const inventory = await prisma.inventory.update({
      where: { productId: req.params.productId },
      data: { minimumStock: parseInt(minimumStock, 10) },
      include: { product: true },
    });
    res.json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
};

export const stockIn = async (req, res, next) => {
  try {
    const { quantity, note } = req.body;
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
    });
    if (!product) throw new AppError('Product not found', 404);

    const qty = parseInt(quantity, 10);
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { increment: qty } },
      });
      await tx.inventory.update({
        where: { productId: product.id },
        data: { currentStock: { increment: qty } },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          type: 'STOCK_IN',
          quantity: qty,
          note: note || 'Manual stock in',
        },
      });
    });

    const updated = await prisma.inventory.findUnique({
      where: { productId: product.id },
      include: { product: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const stockOut = async (req, res, next) => {
  try {
    const { quantity, note } = req.body;
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
    });
    if (!product) throw new AppError('Product not found', 404);

    const qty = parseInt(quantity, 10);
    if (product.quantity < qty) throw new AppError('Insufficient stock', 400);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: qty } },
      });
      await tx.inventory.update({
        where: { productId: product.id },
        data: { currentStock: { decrement: qty } },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          type: 'STOCK_OUT',
          quantity: qty,
          note: note || 'Manual stock out',
        },
      });
    });

    const updated = await prisma.inventory.findUnique({
      where: { productId: product.id },
      include: { product: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
