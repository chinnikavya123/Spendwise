
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
