import { Router } from "express";

import {
    createAgent, 
    getAgents,
    getAgentById,
    updateAgent,
    deleteAgent
} from '../controllers/deliveryAgent.controller.js';


const router = Router();

router.post('/', createAgent);
router.get('/', getAgents);
router.get('/:id', getAgentById);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);
// router.get('/:agentId/deliveries)


export default router;