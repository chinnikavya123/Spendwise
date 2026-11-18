
import express from "express";
import {
  createBudget,
  getBudgets
} from "../controllers/budgetController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createBudget);
router.get("/", verifyToken, getBudgets);

export default router;
