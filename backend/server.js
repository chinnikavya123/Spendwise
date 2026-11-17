
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool, { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SpendWise API!"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SpendWise backend is running successfully!",
    status: "Healthy"
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS databaseName, NOW() AS serverTime"
    );

    res.status(200).json({
      success: true,
      message: "MySQL query executed successfully!",
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database query failed",
      error: error.message
    });
  }
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`SpendWise server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start SpendWise server:", error.message);
    process.exit(1);
  }
};

startServer();
