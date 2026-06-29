import prisma from '../config/db.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import {
  syncProductStock,
  recordInventoryMovement,
  createNotification,
} from '../services/inventory.service.js';
import { sendOrderUpdateEmail } from '../config/email.js';
import { AppError } from '../middleware/errorHandler.js';


const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { supplier: { select: { fullName: true } } },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { supplier: { select: { fullName: true } } },
            },
          },
        },
      },
    });
  }

  return cart;
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    res.json({ success: true, data: { ...cart, total } });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) throw new AppError('Product not found', 404);
    if (product.quantity < quantity) throw new AppError('Insufficient stock', 400);

    const cart = await getOrCreateCart(req.user.id);

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await getOrCreateCart(req.user.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!item || item.cart.userId !== req.user.id) {
      throw new AppError('Cart item not found', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: item.id },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    const cart = await getOrCreateCart(req.user.id);

    res.json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
export const createOrder = async (req, res, next) => {
  try {
    const { customerId, totalAmount, status, paymentStatus } = req.body;

    const order = await prisma.order.create({
      data: {
        customerId,
        totalAmount,
        status,
        paymentStatus,
      },
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.update({
      where: {
        id: req.params.id,
      },
      data: {
        totalAmount: req.body.totalAmount,
        status: req.body.status,
        paymentStatus: req.body.paymentStatus,
      },
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      throw new AppError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    const cart = await getOrCreateCart(req.user.id);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

export const checkout = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    if (!cart.items.length) throw new AppError('Cart is empty', 400);

    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      }
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: req.user.id,
          totalAmount,
          status: 'PENDING',
          paymentStatus: 'PAID',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: { select: { email: true, fullName: true } },
        },
      });

      await tx.delivery.create({
        data: { orderId: newOrder.id, status: 'PENDING' },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });
        await recordInventoryMovement(
          item.productId,
          'STOCK_OUT',
          item.quantity,
          `Order ${newOrder.id}`,
          tx
        );
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    for (const item of order.items) {
      await syncProductStock(item.productId);
      if (item.product.supplierId) {
        await createNotification(
          item.product.supplierId,
          'New Order',
          `New order for ${item.quantity}x ${item.product.name}`,
          'ORDER_UPDATE'
        );
      }
    }

    await createNotification(
      req.user.id,
      'Order Placed',
      `Your order #${order.id.slice(-8)} has been placed successfully`,
      'ORDER_UPDATE'
    );

    await sendOrderUpdateEmail(order.customer.email, order.id, 'PENDING');

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { page, limit, status, paymentStatus } = req.query;
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};
    if (req.user.role === 'CUSTOMER') where.customerId = req.user.id;
    if (req.user.role === 'SUPPLIER') {
      where.items = { some: { product: { supplierId: req.user.id } } };
    }
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, fullName: true, email: true } },
          items: { include: { product: true } },
          delivery: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      meta: buildPaginationMeta(total, pageNum, limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        items: { include: { product: { include: { supplier: true, farmer: true } } } },
        delivery: true,
      },
    });

    if (!order) throw new AppError('Order not found', 404);

    if (
      req.user.role === 'CUSTOMER' &&
      order.customerId !== req.user.id
    ) {
      throw new AppError('Not authorized', 403);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { customer: true },
    });

    if (!order) throw new AppError('Order not found', 404);

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: status ?? order.status,
        paymentStatus: paymentStatus ?? order.paymentStatus,
      },
      include: {
        items: { include: { product: true } },
        delivery: true,
        customer: true,
      },
    });

    if (status) {
      await createNotification(
        order.customerId,
        'Order Update',
        `Order #${order.id.slice(-8)} is now ${status}`,
        'ORDER_UPDATE'
      );
      await sendOrderUpdateEmail(order.customer.email, order.id, status);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) throw new AppError('Order not found', 404);
    if (order.customerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });
        await recordInventoryMovement(
          item.productId,
          'STOCK_IN',
          item.quantity,
          `Order ${order.id} cancelled`,
          tx
        );
      }
    });

    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    next(err);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { fullName: true, email: true, phone: true } },
        items: { include: { product: true } },
      },
    });

    if (!order) throw new AppError('Order not found', 404);

    const invoice = {
      invoiceNumber: `INV-${order.id.slice(-8).toUpperCase()}`,
      orderId: order.id,
      date: order.createdAt,
      customer: order.customer,
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unit: i.product.unit,
        price: i.price,
        total: i.price * i.quantity,
      })),
      subtotal: order.totalAmount,
      total: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
    };

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};
