
import express from "express";
import { createSavingsGoal } from "../controllers/savingsGoalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createSavingsGoal);

export default router;
