
import express from "express";
import { createBudget } from "../controllers/budgetController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createBudget);

export default router;
