import prisma from '../prismaClient.js'; 

export async function createProduct(req, res) {
    try {
        const {sku, name, quantityInStock} = req.body;
        const product = await prisma.product.create({
            data: { sku, name, quantityInStock: quantityInStock ?? 0},
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

export async function getProducts(req, res) {
    const products = await prisma.product.findMany();
    res.json(products);
}

