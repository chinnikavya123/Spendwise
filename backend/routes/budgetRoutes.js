
import express from "express";
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
} from "../controllers/budgetController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createBudget);
router.get("/", verifyToken, getBudgets);
router.put("/:id", verifyToken, updateBudget);
router.delete("/:id", verifyToken, deleteBudget);

export default router;