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

export async function getProductsById(req, res) {
    const product = await prisma.product.findUnique({
        where: {id: Number(req.params.id)},
    });
    if (!product) return res.status(404).json({error: "Product not found"});
    res.json(product);
}


export async function updateProduct(req, res) {
    try {
        const product = await prisma.product.update({
            where: {id: Number(req.params.id)},
            data: req.body,
        });
        res.json(product);
    } catch(err) {
        res.status(400).json({error: err.message})
    }
}

export async function deleteProduct(req, res) {
    try {
        await prisma.product.delete({ where: {id: Number(req.params.id)}});
        res.status(204).send();
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}

