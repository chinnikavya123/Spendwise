
import pool from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [categories] = await pool.query(
      `SELECT id, name, type, icon, color, is_default
       FROM categories
       WHERE user_id IS NULL OR user_id = ?
       ORDER BY type, name`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully!",
      total: categories.length,
      categories
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving categories."
    });
  }
};


export const createCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Category name and type are required."
      });
    }

    const categoryName = name.trim();
    const categoryType = type.toLowerCase();

    if (!categoryName || categoryName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name must contain 1 to 100 characters."
      });
    }

    if (!["income", "expense"].includes(categoryType)) {
      return res.status(400).json({
        success: false,
        message: "Category type must be income or expense."
      });
    }

    const [existingCategories] = await pool.query(
      `SELECT id FROM categories
       WHERE (user_id IS NULL OR user_id = ?)
       AND name = ? AND type = ?`,
      [userId, categoryName, categoryType]
    );

    if (existingCategories.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This category already exists."
      });
    }

    const [result] = await pool.query(
      `INSERT INTO categories
       (user_id, name, type, icon, color, is_default)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [
        userId,
        categoryName,
        categoryType,
        icon || null,
        color || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Custom category created successfully!",
      category: {
        id: result.insertId,
        user_id: userId,
        name: categoryName,
        type: categoryType,
        icon: icon || null,
        color: color || null,
        is_default: 0
      }
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the category."
    });
  }
};
