
import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getTransactions);
router.post("/", verifyToken, createTransaction);
router.put("/:id", verifyToken, updateTransaction);
router.delete("/:id", verifyToken, deleteTransaction);

export default router;
