import prisma from '../prismaClient.js';
import { logStatusChange } from '../utils/statusHistory.js';


export async function createDeliveryOrder(req, res) {
  const { orderNumber, customerId, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

  try {
    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: Number(customerId) } });
      if (!customer) {
        return res.status(400).json({ error: `Customer with ID ${customerId} does not exist.` });
      }
    }

    const generatedOrderNumber = orderNumber || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: Number(item.productId) } });
        if (!product) throw new Error(`Product with ID ${item.productId} not found`);
        if (product.quantityInStock < item.qty) {
          throw new Error(`Not enough stock for ${product.name} (Requested: ${item.qty}, Available: ${product.quantityInStock})`);
        }
      }

      const newOrder = await tx.deliveryOrder.create({
        data: {
          orderNumber: generatedOrderNumber,
          customerId: customerId ? Number(customerId) : null,
          status: 'PENDING',
          items: {
            create: items.map((i) => ({ productId: Number(i.productId), qty: Number(i.qty) })),
          },
        },
        include: { items: { include: { product: true } }, customer: true },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { decrement: item.qty } },
        });
      }

      return newOrder;
    });

    await logStatusChange('DeliveryOrder', order.id, null, 'PENDING');
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getDeliveryOrders(req, res) {
  try {
    const orders = await prisma.deliveryOrder.findMany({
      include: { customer: true, items: { include: { product: true } }, delivery: true },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDeliveryOrderById(req, res) {
  try {
    const order = await prisma.deliveryOrder.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true, items: { include: { product: true } }, delivery: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDeliveryOrderTracking(req, res) {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
