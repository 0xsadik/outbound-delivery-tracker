import prisma from '../../prismaClient.js';
import { logStatusChange } from '../utils/statusHistory.js';


export async function createDeliveryOrder(req, res) {
  const { customerId, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.quantityInStock < item.qty) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
      }


      const newOrder = await tx.deliveryOrder.create({
        data: {
          customerId,
          status: 'pending',
          orderItems: {
            create: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          },
        },
        include: { orderItems: true },
      });


      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { decrement: item.qty } },
        });
      }

      return newOrder;
    });

    await logStatusChange('DeliveryOrder', order.id, null, 'pending');
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getDeliveryOrders(req, res) {
  const orders = await prisma.deliveryOrder.findMany({
    include: { customer: true, orderItems: { include: { product: true } }, delivery: true },
  });
  res.json(orders);
}

export async function getDeliveryOrderById(req, res) {
  const order = await prisma.deliveryOrder.findUnique({
    where: { id: Number(req.params.id) },
    include: { customer: true, orderItems: { include: { product: true } }, delivery: true },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}

export async function getDeliveryOrderTracking(req, res) {
  const orderId = Number(req.params.id);
  const order = await prisma.deliveryOrder.findUnique({
    where: { id: orderId },
    include: { delivery: true },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const orderHistory = await prisma.statusHistory.findMany({
    where: { entityType: 'DeliveryOrder', entityId: orderId },
    orderBy: { changedAt: 'asc' },
  });

  let deliveryHistory = [];
  if (order.delivery) {
    deliveryHistory = await prisma.statusHistory.findMany({
      where: { entityType: 'Delivery', entityId: order.delivery.id },
      orderBy: { changedAt: 'asc' },
    });
  }

  res.json({
    orderStatus: order.status,
    deliveryStatus: order.delivery?.status ?? null,
    timeline: [...orderHistory, ...deliveryHistory].sort(
      (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
    ),
  });
}

export async function cancelDeliveryOrder(req, res) {
  try {
    const orderId = Number(req.params.id);
    const existing = await prisma.deliveryOrder.findUnique({ where: { id: orderId } });
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    const order = await prisma.deliveryOrder.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });
    await logStatusChange('DeliveryOrder', orderId, existing.status, 'cancelled');
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
