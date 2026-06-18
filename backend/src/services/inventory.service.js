import prisma from '../config/db.js';
import { getStockStatus } from '../utils/helpers.js';

export const syncProductStock = async (productId, tx = prisma) => {
  const product = await tx.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });

  if (!product) return;

  const minStock = product.inventory?.minimumStock ?? 10;
  const stockStatus = getStockStatus(product.quantity, minStock);

  await tx.product.update({
    where: { id: productId },
    data: { stockStatus },
  });

  if (stockStatus === 'LOW_STOCK' || stockStatus === 'OUT_OF_STOCK') {
    const admins = await tx.user.findMany({ where: { role: 'ADMIN' } });
    const suppliers = product.supplierId
      ? await tx.user.findMany({ where: { id: product.supplierId } })
      : [];

    const notifyUsers = [...admins, ...suppliers];
    for (const user of notifyUsers) {
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Low Stock Alert',
          message: `${product.name} is ${stockStatus.replace('_', ' ').toLowerCase()} (${product.quantity} ${product.unit})`,
          type: 'LOW_STOCK',
        },
      });
    }
  }
};

export const recordInventoryMovement = async (
  productId,
  type,
  quantity,
  note,
  tx = prisma
) => {
  await tx.inventoryMovement.create({
    data: { productId, type, quantity, note },
  });
};

export const createNotification = async (userId, title, message, type = 'SYSTEM', tx = prisma) => {
  return tx.notification.create({
    data: { userId, title, message, type },
  });
};
