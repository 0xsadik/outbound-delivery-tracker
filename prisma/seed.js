import prisma from '../prismaClient.js';

async function main() {
  console.log('Seeding initial data...');

  // 1. Clean existing records
  await prisma.orderItem.deleteMany();
  await prisma.deliveryOrder.deleteMany();
  await prisma.product.deleteMany();

  // 2. Create Products
  const keyboard = await prisma.product.create({
    data: {
      sku: 'KB-001',
      name: 'Wireless Mechanical Keyboard',
      quantityInStock: 50,
    },
  });

  const mouse = await prisma.product.create({
    data: {
      sku: 'MS-002',
      name: 'Ergonomic Wireless Mouse',
      quantityInStock: 80,
    },
  });

  const monitor = await prisma.product.create({
    data: {
      sku: 'MN-003',
      name: '27-inch 4K IPS Monitor',
      quantityInStock: 25,
    },
  });

  // 3. Create Delivery Orders with Order Items
  const order1 = await prisma.deliveryOrder.create({
    data: {
      orderNumber: 'ORD-2026-001',
      status: 'PROCESSING',
      items: {
        create: [
          { productId: keyboard.id, qty: 2 },
          { productId: mouse.id, qty: 1 },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  const order2 = await prisma.deliveryOrder.create({
    data: {
      orderNumber: 'ORD-2026-002',
      status: 'SHIPPED',
      items: {
        create: [
          { productId: monitor.id, qty: 1 },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log('Seed completed successfully!');
  console.log({ createdProducts: [keyboard, mouse, monitor], createdOrders: [order1, order2] });
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
