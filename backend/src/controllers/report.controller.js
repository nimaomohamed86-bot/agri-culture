import prisma from '../config/db.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({
        where: { stockStatus: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { fullName: true } },
        },
      }),
    ]);

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const revenueByMonthRaw = await prisma.$queryRaw`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, SUM("totalAmount") as revenue, COUNT(*)::int as orders
      FROM "Order"
      WHERE "paymentStatus" = 'PAID'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `.catch(() => []);

    const revenueByMonth = revenueByMonthRaw.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue ?? 0),
      orders: Number(row.orders ?? 0),
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
        pendingOrders,
        lowStockProducts,
        recentOrders,
        ordersByStatus,
        revenueByMonth,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { paymentStatus: 'PAID' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { fullName: true, email: true } },
        items: { include: { product: { select: { name: true, category: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
      averageOrderValue:
        orders.length > 0
          ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length
          : 0,
    };

    res.json({ success: true, data: { orders, summary } });
  } catch (err) {
    next(err);
  }
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
        supplier: { select: { fullName: true } },
      },
      orderBy: { name: 'asc' },
    });

    const summary = {
      totalProducts: products.length,
      inStock: products.filter((p) => p.stockStatus === 'IN_STOCK').length,
      lowStock: products.filter((p) => p.stockStatus === 'LOW_STOCK').length,
      outOfStock: products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length,
      totalValue: products.reduce((s, p) => s + p.price * p.quantity, 0),
    };

    res.json({ success: true, data: { products, summary } });
  } catch (err) {
    next(err);
  }
};

export const getSupplierPerformance = async (req, res, next) => {
  try {
    const suppliers = await prisma.user.findMany({
      where: { role: 'SUPPLIER' },
      include: {
        productsAsSupplier: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    const performance = suppliers.map((s) => {
      const products = s.productsAsSupplier;
      const totalSales = products.reduce(
        (sum, p) =>
          sum +
          p.orderItems.reduce((s, oi) => s + oi.price * oi.quantity, 0),
        0
      );
      return {
        id: s.id,
        fullName: s.fullName,
        email: s.email,
        productCount: products.length,
        totalSales,
      };
    });

    res.json({ success: true, data: performance });
  } catch (err) {
    next(err);
  }
};

export const getCustomerPurchases = async (req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          where: { paymentStatus: 'PAID' },
          select: { totalAmount: true, createdAt: true },
        },
      },
    });

    const data = customers.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      orderCount: c.orders.length,
      totalSpent: c.orders.reduce((s, o) => s + o.totalAmount, 0),
      lastOrder: c.orders[0]?.createdAt || null,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getFarmerEarnings = async (req, res, next) => {
  try {
    const farmerId = req.user.role === 'FARMER' ? req.user.id : req.params.farmerId;

    const products = await prisma.product.findMany({
      where: { farmerId },
      include: {
        orderItems: {
          include: { order: true },
        },
      },
    });

    const sales = products.flatMap((p) =>
      p.orderItems
        .filter((oi) => oi.order.paymentStatus === 'PAID')
        .map((oi) => ({
          productName: p.name,
          quantity: oi.quantity,
          revenue: oi.price * oi.quantity,
          date: oi.order.createdAt,
        }))
    );

    const totalEarnings = sales.reduce((s, sale) => s + sale.revenue, 0);

    res.json({
      success: true,
      data: { sales, totalEarnings, productCount: products.length },
    });
  } catch (err) {
    next(err);
  }
};

export const exportSalesExcel = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales Report');

    sheet.columns = [
      { header: 'Order ID', key: 'id', width: 20 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    orders.forEach((o) => {
      sheet.addRow({
        id: o.id.slice(-8),
        customer: o.customer.fullName,
        amount: o.totalAmount,
        status: o.status,
        date: o.createdAt.toISOString().split('T')[0],
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

export const exportSalesPDF = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      include: { customer: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Sales Report', { align: 'center' });
    doc.moveDown();

    orders.forEach((o) => {
      doc
        .fontSize(10)
        .text(
          `#${o.id.slice(-8)} | ${o.customer.fullName} | $${o.totalAmount.toFixed(2)} | ${o.status} | ${o.createdAt.toDateString()}`
        );
    });

    doc.end();
  } catch (err) {
    next(err);
  }
};
