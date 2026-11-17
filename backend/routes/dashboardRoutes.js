
import express from "express";
import {
  getDashboardSummary,
  getRecentTransactions,
  getMonthlyAnalytics,
  getCategoryAnalytics
} from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", verifyToken, getDashboardSummary);
router.get("/recent-transactions", verifyToken, getRecentTransactions);
router.get("/monthly-analytics", verifyToken, getMonthlyAnalytics);
router.get("/category-analytics", verifyToken, getCategoryAnalytics);

export default router;
