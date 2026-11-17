
import pool from "../config/db.js";

export const createBudget = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { category_id, amount, budget_month } = req.body;

    // Validate category ID
    const categoryId = Number(category_id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid category ID."
      });
    }

    // Validate amount
    const budgetAmount = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(budgetAmount) ||
      budgetAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget amount must be greater than zero."
      });
    }

    // Validate budget month (YYYY-MM)
    if (
      typeof budget_month !== "string" ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(budget_month)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid budget month in YYYY-MM format."
      });
    }

    const budgetDate = `${budget_month}-01`;

    // Check whether the category exists and is an expense category
    const [categories] = await pool.query(
      `SELECT id, name
       FROM categories
       WHERE id = ?
         AND type = 'expense'
         AND (user_id IS NULL OR user_id = ?)`,
      [categoryId, userId]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense category or category does not belong to you."
      });
    }

    // Check for an existing budget
    const [existingBudgets] = await pool.query(
      `SELECT id
       FROM budgets
       WHERE user_id = ?
         AND category_id = ?
         AND budget_month = ?`,
      [userId, categoryId, budgetDate]
    );

    if (existingBudgets.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this category and month."
      });
    }

    // Create budget
    const [result] = await pool.query(
      `INSERT INTO budgets
       (user_id, category_id, amount, budget_month)
       VALUES (?, ?, ?, ?)`,
      [userId, categoryId, budgetAmount, budgetDate]
    );

    return res.status(201).json({
      success: true,
      message: "Budget created successfully!",
      budget: {
        id: result.insertId,
        category_id: categoryId,
        category_name: categories[0].name,
        amount: budgetAmount,
        budget_month: budgetDate
      }
    });

  } catch (error) {
    console.error("Create budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the budget."
    });
  }
};
