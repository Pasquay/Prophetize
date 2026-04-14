// Imports
import express from "express";
import userRoutes from "../src/routes/userRoutes";
import marketRoutes from "../src/routes/marketRoutes";
import transactionRoutes from "../src/routes/transactionRoutes";
import portfolioRoutes from '../src/routes/portfolioRoutes';

// Server
const app = express();
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
    res.send("Prophetize is online!");
});

// Routes - connect routes to server
app.use("/auth", userRoutes);
app.use("/markets", marketRoutes);
app.use("/transaction", transactionRoutes);
app.use('/portfolio', portfolioRoutes);

// Starting server
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} and listening on all network interfaces`);
});