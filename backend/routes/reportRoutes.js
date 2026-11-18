import express from "express";
import { getTransactionReport } from "../controllers/reportController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/transactions", verifyToken, getTransactionReport);

export default router;