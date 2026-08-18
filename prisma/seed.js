import prisma from '../src/prismaClient.js';

async function main() {
  console.log('Seeding initial data...');


  await prisma.statusHistory.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.deliveryOrder.deleteMany();
  await prisma.deliveryAgent.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();


  const customer1 = await prisma.customer.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1-555-0101',
      address: '123 Main St, New York, NY',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '+1-555-0202',
      address: '456 Market St, San Francisco, CA',
    },
  });


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

  
  const agent1 = await prisma.deliveryAgent.create({
    data: {
      name: 'Dave Express',
      phone: '+1-555-0303',
      vehicleInfo: 'Van - Plate XYZ-1234',
      isActive: true,
    },
  });

  
  const order1 = await prisma.deliveryOrder.create({
    data: {
      orderNumber: 'ORD-2026-001',
      status: 'PENDING',
      customerId: customer1.id,
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
      status: 'PENDING',
      customerId: customer2.id,
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
  console.log({
    createdCustomers: [customer1.name, customer2.name],
    createdProducts: [keyboard.name, mouse.name, monitor.name],
    createdAgents: [agent1.name],
    createdOrders: [order1.orderNumber, order2.orderNumber],
  });
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
