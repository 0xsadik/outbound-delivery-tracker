import prisma from '../prismaClient.js'; 
import { logStatusChange } from '../utils/statusHistory.js';

const VALID_TRANSITIONS = {
    assigned: ['picked_up', 'failed'],
    picked_up: ['delivered', 'failed'],
    in_transit: ['delivered', 'failed'],
    delivered: [],
    failed: [],
};


export async function assignOrderToAgent(req, res) {
    const orderId = Number(req.params.id);
    const { agentId } = req.body;

    try {
        const order = await prisma.deliveryOrder.findUnique({
            where: { id: orderId },
            include: { delivery: true },
        });

        if (!order) return res.status(404).json({ error: 'Order not found' }); 
        if (order.delivery) return res.status(400).json({ error: 'Order already assigned' });

        const agent = await prisma.deliveryAgent.findUnique({ where: { id: Number(agentId) } });
        if (!agent || !agent.isActive) {
            return res.status(400).json({ error: "Agent not found or inactive" });
        }

        const delivery = await prisma.$transaction(async (tx) => {
            const newDelivery = await tx.delivery.create({
                data: {
                    deliveryOrderId: orderId, 
                    agentId: Number(agentId),
                    status: 'assigned',
                    dispatchedAt: new Date(),
                },
            });

            await tx.deliveryOrder.update({
                where: { id: orderId },
                data: { status: 'assigned' },
            });
            return newDelivery;
        });

        await logStatusChange('DeliveryOrder', orderId, order.status, 'assigned');
        await logStatusChange('Delivery', delivery.id, null, 'assigned');

        res.status(201).json(delivery);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function updateDeliveryStatus(req, res) {
  const deliveryId = Number(req.params.id);
  const { status: newStatus } = req.body;

  try {
    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    const allowed = VALID_TRANSITIONS[delivery.status] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        error: `Cannot move from "${delivery.status}" to "${newStatus}"`,
      });
    }

    const data = { status: newStatus };
    if (newStatus === 'delivered') data.deliveredAt = new Date();

    const updated = await prisma.delivery.update({ where: { id: deliveryId }, data });
    await logStatusChange('Delivery', deliveryId, delivery.status, newStatus);

    if (newStatus === 'delivered' || newStatus === 'failed') {
      const order = await prisma.deliveryOrder.findUnique({
        where: { id: delivery.deliveryOrderId },
      });
      const orderNewStatus = newStatus === 'delivered' ? 'delivered' : 'cancelled';
      await prisma.deliveryOrder.update({
        where: { id: delivery.deliveryOrderId },
        data: { status: orderNewStatus },
      });
      await logStatusChange('DeliveryOrder', delivery.deliveryOrderId, order.status, orderNewStatus);
    } else if (newStatus === 'in_transit') {
      const order = await prisma.deliveryOrder.findUnique({
        where: { id: delivery.deliveryOrderId },
      });
      await prisma.deliveryOrder.update({
        where: { id: delivery.deliveryOrderId },
        data: { status: 'out_for_delivery' },
      });
      await logStatusChange(
        'DeliveryOrder',
        delivery.deliveryOrderId,
        order.status,
        'out_for_delivery'
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


export async function getDeliveriesForAgent(req, res) {
    try {
        const agentId = Number(req.params.agentId || req.params.id);
        const deliveries = await prisma.delivery.findMany({
            where: { agentId },
            include: { deliveryOrder: { include: { customer: true, items: { include: { product: true } } } } }, 
        }); 
        res.json(deliveries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

