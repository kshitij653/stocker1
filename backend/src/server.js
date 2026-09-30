const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const stockRoutes = require("./routes/stocks");
const watchlistRoutes = require("./routes/watchlists");
const holdingRoutes = require("./routes/holdings");
const transactionRoutes = require("./routes/transactions");
const alertRoutes = require("./routes/alerts");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/watchlists", watchlistRoutes);
app.use("/api/holdings", holdingRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Stocker backend is running",
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`Stocker backend running on http://127.0.0.1:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});