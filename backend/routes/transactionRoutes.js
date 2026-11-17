
import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction
} from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getTransactions);
router.post("/", verifyToken, createTransaction);
router.put("/:id", verifyToken, updateTransaction);

export default router;
