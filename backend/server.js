
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`SpendWise server running on http://localhost:${PORT}`);
});
