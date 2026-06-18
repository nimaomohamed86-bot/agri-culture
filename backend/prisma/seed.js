import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agrisupply.com' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin@agrisupply.com',
      phone: '+1234567890',
      password,
      role: 'ADMIN',
    },
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@agrisupply.com' },
    update: {},
    create: {
      fullName: 'Green Valley Supplies',
      email: 'supplier@agrisupply.com',
      phone: '+1234567891',
      password,
      role: 'SUPPLIER',
    },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@agrisupply.com' },
    update: {},
    create: {
      fullName: 'John Farmer',
      email: 'farmer@agrisupply.com',
      phone: '+1234567892',
      password,
      role: 'FARMER',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@agrisupply.com' },
    update: {},
    create: {
      fullName: 'Jane Customer',
      email: 'customer@agrisupply.com',
      phone: '+1234567893',
      password,
      role: 'CUSTOMER',
    },
  });

  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  const sampleProducts = [
    {
      name: 'Organic Tomatoes',
      category: 'VEGETABLES',
      description: 'Fresh organic tomatoes from local farms',
      price: 3.5,
      quantity: 500,
      unit: 'Kg',
      supplierId: supplier.id,
      farmerId: farmer.id,
    },
    {
      name: 'Golden Wheat',
      category: 'GRAINS',
      description: 'Premium quality wheat grains',
      price: 25.0,
      quantity: 2000,
      unit: 'Ton',
      supplierId: supplier.id,
    },
    {
      name: 'Red Apples',
      category: 'FRUITS',
      description: 'Crisp and sweet red apples',
      price: 4.0,
      quantity: 300,
      unit: 'Kg',
      supplierId: supplier.id,
      farmerId: farmer.id,
    },
    {
      name: 'Hybrid Corn Seeds',
      category: 'SEEDS',
      description: 'High-yield hybrid corn seeds',
      price: 15.0,
      quantity: 100,
      unit: 'Sack',
      supplierId: supplier.id,
    },
    {
      name: 'NPK Fertilizer',
      category: 'FERTILIZERS',
      description: 'Balanced NPK fertilizer for all crops',
      price: 45.0,
      quantity: 150,
      unit: 'Sack',
      supplierId: supplier.id,
    },
    {
      name: 'Cattle Feed Mix',
      category: 'LIVESTOCK_FEED',
      description: 'Nutritious feed mix for cattle',
      price: 30.0,
      quantity: 80,
      unit: 'Sack',
      supplierId: supplier.id,
    },
    {
      name: 'Fresh Carrots',
      category: 'VEGETABLES',
      description: 'Sweet and crunchy carrots',
      price: 2.5,
      quantity: 8,
      unit: 'Kg',
      supplierId: supplier.id,
      farmerId: farmer.id,
    },
  ];

  for (const p of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      const stockStatus =
        p.quantity <= 0 ? 'OUT_OF_STOCK' : p.quantity <= 10 ? 'LOW_STOCK' : 'IN_STOCK';

      const product = await prisma.product.create({
        data: { ...p, stockStatus },
      });

      await prisma.inventory.create({
        data: {
          productId: product.id,
          currentStock: p.quantity,
          minimumStock: 10,
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          type: 'STOCK_IN',
          quantity: p.quantity,
          note: 'Initial seed stock',
        },
      });
    }
  }

  console.log('Seed completed!');
  console.log('Demo accounts (password: password123):');
  console.log('  Admin:    admin@agrisupply.com');
  console.log('  Supplier: supplier@agrisupply.com');
  console.log('  Farmer:   farmer@agrisupply.com');
  console.log('  Customer: customer@agrisupply.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
