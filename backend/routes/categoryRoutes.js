
import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory
} from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, createCategory);
router.put("/:id", verifyToken, updateCategory);

export default router;
