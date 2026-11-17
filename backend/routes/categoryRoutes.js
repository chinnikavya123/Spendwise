
import express from "express";
import { getCategories } from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getCategories);

export default router;
