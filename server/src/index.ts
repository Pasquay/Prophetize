// Imports
import express from "express";
import marketRoutes from "../src/routes/marketRoutes";

// Server
const app = express();
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
    res.send("Prophetize is online!");
    res.redirect("/markets");
});

// Routes - connect routes to server
app.use("/markets", marketRoutes);

// Starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});