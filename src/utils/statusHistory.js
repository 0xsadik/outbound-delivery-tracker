import prisma from '../prismaClient.js';

export async function logStatusChange(entityType, entityId, oldStatus, newStatus) {
    return prisma.statusHistory.create({
        data: { entityType, entityId, oldStatus, newStatus },
    });
}

