import express from "express";
import {
  createSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
  deleteSavingsGoal
} from "../controllers/savingsGoalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createSavingsGoal);
router.get("/", verifyToken, getSavingsGoals);
router.put("/:id", verifyToken, updateSavingsGoal);
router.delete("/:id", verifyToken, deleteSavingsGoal);

export default router;