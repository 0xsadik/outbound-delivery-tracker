import prisma from '../prismaClient.js';

export async function createAgent(req, res) {
    try {
        const {name, phone, vehicleInfo} = req.body;
        const agent = await prisma.deliveryAgent.create({
            data: {name, phone, vehicleInfo},
        });
        res.status(201).json(agent);
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}


export async function getAgents(req, res) {
    const agents = await prisma.deliveryAgent.findMany();
    res.json(agents);
}

export async function getAgentById(req, res) {
    const agent = await prisma.deliveryAgent.findUnique( {
        whre: {id: Number(req.params.id)},
        include: {deliveries: true},
    });
    if (!agent) return res.status(404).json({error: "Agent not found!"});
    res.json(agent);
}

export async function updateAgent(req, res) {
    try{
        const agent = await prisma.deliveryAgent.update({ 
            wehre: {id: Number(req.params.id)},
            data: req.body,
        });
        res.json(agent);
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}

export async function deleteAgent(req, res) {
    try {
        await prisma.deliveryAgent.delete({
            where: {id: Number(req.params.id)}
        });
        res.status(204).send();
    } catch(err) {
        res.staus(400).json({error: err.message});
    }
}