import prisma from '../config/db.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import { createNotification } from '../services/inventory.service.js';
import { sendOrderUpdateEmail } from '../config/email.js';
import { AppError } from '../middleware/errorHandler.js';

export const getDeliveries = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};
    if (status) where.status = status;

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              customer: { select: { fullName: true, email: true, phone: true } },
              items: { include: { product: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.delivery.count({ where }),
    ]);

    res.json({
      success: true,
      data: deliveries,
      meta: buildPaginationMeta(total, pageNum, limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const getDelivery = async (req, res, next) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    if (!delivery) throw new AppError('Delivery not found', 404);
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
};

export const updateDelivery = async (req, res, next) => {
  try {
    const { driverName, status, estimatedDate } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: { order: { include: { customer: true } } },
    });

    if (!delivery) throw new AppError('Delivery not found', 404);

    const updated = await prisma.delivery.update({
      where: { id: req.params.id },
      data: {
        driverName: driverName ?? delivery.driverName,
        status: status ?? delivery.status,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : delivery.estimatedDate,
      },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' },
      });
    } else if (status === 'IN_TRANSIT') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'SHIPPED' },
      });
    }

    if (status) {
      await createNotification(
        delivery.order.customerId,
        'Delivery Update',
        `Delivery for order #${delivery.orderId.slice(-8)} is ${status.replace('_', ' ').toLowerCase()}`,
        'DELIVERY_UPDATE'
      );
      await sendOrderUpdateEmail(
        delivery.order.customer.email,
        delivery.orderId,
        status
      );
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const assignDriver = async (req, res, next) => {
  try {
    const { driverName, estimatedDate } = req.body;

    const updated = await prisma.delivery.update({
      where: { orderId: req.params.orderId },
      data: {
        driverName,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : undefined,
        status: 'IN_TRANSIT',
      },
      include: { order: true },
    });

    await prisma.order.update({
      where: { id: req.params.orderId },
      data: { status: 'PROCESSING' },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
