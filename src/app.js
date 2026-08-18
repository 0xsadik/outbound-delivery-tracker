import express from "express";
import productRoutes from "./routes/product.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import deliveryOrderRoutes from "./routes/deliveryOrder.routes.js";
import deliveryAgentRoutes from "./routes/deliveryAgent.routes.js";  
import deliveryRoutes from './routes/delivery.routes.js';

const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => res.json({ message: "it's alive !" }));


app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/delivery-orders", deliveryOrderRoutes);
app.use('/api/delivery-agents', deliveryAgentRoutes);
app.use('/api/deliveries', deliveryRoutes); 


app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({error: "kuch to garbar hain dayaa!!!"});
});

export default app;

