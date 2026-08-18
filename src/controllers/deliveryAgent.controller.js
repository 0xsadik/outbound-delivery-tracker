import prisma from '../prismaClient.js';

export async function createAgent(req, res) {
    try {
        const { name, phone, vehicleInfo, isActive } = req.body || {};
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: "Agent 'name' is required." });
        }
        const agent = await prisma.deliveryAgent.create({
            data: { 
                name: name.trim(), 
                phone: phone || null, 
                vehicleInfo: vehicleInfo || null, 
                isActive: isActive ?? true 
            },
        });
        res.status(201).json(agent);
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
}


export async function getAgents(req, res) {
    try {
        const agents = await prisma.deliveryAgent.findMany();
        res.json(agents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getAgentById(req, res) {
    try {
        const agent = await prisma.deliveryAgent.findUnique({
            where: { id: Number(req.params.id) },
            include: { deliveries: true },
        });
        if (!agent) return res.status(404).json({ error: "Agent not found!" });
        res.json(agent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateAgent(req, res) {
    try {
        const agent = await prisma.deliveryAgent.update({ 
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json(agent);
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
}

export async function deleteAgent(req, res) {
    try {
        await prisma.deliveryAgent.delete({
            where: { id: Number(req.params.id) }
        });
        res.status(204).send();
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
}