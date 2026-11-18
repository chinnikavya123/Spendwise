
import express from "express";
import {
  createSavingsGoal,
  getSavingsGoals
} from "../controllers/savingsGoalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createSavingsGoal);
router.get("/", verifyToken, getSavingsGoals);

export default router;
