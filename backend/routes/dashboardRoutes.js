
import express from "express";
import {
  getDashboardSummary,
  getRecentTransactions
} from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", verifyToken, getDashboardSummary);
router.get("/recent-transactions", verifyToken, getRecentTransactions);

export default router;
