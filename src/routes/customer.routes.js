import {Router} from "express";

import {
    createCustomer, 
    getCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} from '../controllers/customer.controller.js'; 

const router = Router();

router.post('/', createCustomer);
router.get('/', getCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router; 

