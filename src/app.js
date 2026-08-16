import express from "express";

const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => res.json({ message: "it's alive !" }));

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({error: "kuch to garbar hain dayaa!!!"});
});

export default app;