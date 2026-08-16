import prisma from '../../prismaClient.js';

export async function createCustomer(req, res) {
    try {
        const { name, email, phone, address } = req.body;
        const customer = await prisma.customer.create( {
            data: { name, email, phone, address },
        }); 
        res.status(201).json(customer);
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
}

export async function getCustomer(req, res) {
    try {
        const customers = await prisma.customer.findMany();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getCustomerById(req, res) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: Number(req.params.id) },
            include: { deliveryOrders: true },
        });
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateCustomer(req, res) {
    try {
        const customer = await prisma.customer.update({
            where: {id: Number(req.params.id)}, 
            data: req.body,
        });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function deleteCustomer(req, res) {
    try {
        await prisma.customer.delete({
            where: {id: Number(req.params.id)}
        }); 
        res.status(204).send();
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

