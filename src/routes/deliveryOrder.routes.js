import { Router } from "express";
import {
    createDeliveryOrder,
    getDeliveryOrders,
    getDeliveryOrderById,
    getDeliveryOrderTracking,
    cancelDeliveryOrder
} from '../controllers/deliveryOrder.controller.js'; 

const router = Router();

router.post('/', createDeliveryOrder);
router.get('/', getDeliveryOrders); 
router.get('/:id', getDeliveryOrderById);
router.get('/:id/tracking', getDeliveryOrderTracking);
// router.post('/:orderId/assign', assignOrderToAgent);
router.post('/:id/cancel', cancelDeliveryOrder);


export default router;

