import express from "express";
import {
  getTransactionReport,
  exportTransactionsCSV
} from "../controllers/reportController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/transactions", verifyToken, getTransactionReport);
router.get("/export/csv", verifyToken, exportTransactionsCSV);

export default router;