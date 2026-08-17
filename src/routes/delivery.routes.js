import { Router } from 'express'; 
import { updateDeliveryStatus } from '../controllers/delivery.controller.js'; 

const router = Router();

router.patch('/:id/status', updateDeliveryStatus); 

export default router;