
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


export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get requested month or use current month
    const now = new Date();

    const currentMonth =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const month = req.query.month || currentMonth;

    // Validate month
    if (
      typeof month !== "string" ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid month in YYYY-MM format."
      });
    }

    const budgetDate = `${month}-01`;

    // Retrieve budgets and calculate actual spending
    const [rows] = await pool.query(
      `SELECT
        b.id,
        b.category_id,
        c.name AS category_name,
        b.amount AS budget_amount,
        b.budget_month,

        COALESCE(SUM(t.amount), 0) AS spent_amount,

        COUNT(t.id) AS transaction_count

      FROM budgets b

      INNER JOIN categories c
        ON b.category_id = c.id

      LEFT JOIN transactions t
        ON t.user_id = b.user_id
        AND t.category_id = b.category_id
        AND t.type = 'expense'
        AND t.transaction_date >= b.budget_month
        AND t.transaction_date < DATE_ADD(
          b.budget_month,
          INTERVAL 1 MONTH
        )

      WHERE b.user_id = ?
        AND b.budget_month = ?

      GROUP BY
        b.id,
        b.category_id,
        c.name,
        b.amount,
        b.budget_month

      ORDER BY c.name ASC`,
      [userId, budgetDate]
    );

    // Calculate budget usage and status
    const budgets = rows.map((row) => {
      const budgetAmount = Number(row.budget_amount);
      const spentAmount = Number(row.spent_amount);

      const remainingAmount = budgetAmount - spentAmount;

      const percentageUsed = Number(
        ((spentAmount / budgetAmount) * 100).toFixed(2)
      );

      let status = "Safe";

      if (percentageUsed >= 75 && percentageUsed <= 100) {
        status = "Warning";
      } else if (percentageUsed > 100) {
        status = "Exceeded";
      }

      return {
        id: row.id,
        category_id: row.category_id,
        category_name: row.category_name,
        budget_amount: budgetAmount,
        spent_amount: spentAmount,
        remaining_amount: remainingAmount,
        percentage_used: percentageUsed,
        transaction_count: Number(row.transaction_count),
        status
      };
    });

    const totalBudget = budgets.reduce(
      (sum, item) => sum + item.budget_amount,
      0
    );

    const totalSpent = budgets.reduce(
      (sum, item) => sum + item.spent_amount,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Budgets retrieved successfully!",
      month,
      summary: {
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining_budget: totalBudget - totalSpent,
        percentage_used: totalBudget > 0
          ? Number(((totalSpent / totalBudget) * 100).toFixed(2))
          : 0
      },
      total_budgets: budgets.length,
      budgets
    });

  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving budgets."
    });
  }
};


export const updateBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const budgetId = Number(req.params.id);

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid budget ID."
      });
    }

    const { category_id, amount, budget_month } = req.body;

    // Check whether the budget exists and belongs to the user
    const [existingBudgets] = await pool.query(
      `SELECT id, category_id, amount, budget_month
       FROM budgets
       WHERE id = ? AND user_id = ?`,
      [budgetId, userId]
    );

    if (existingBudgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found."
      });
    }

    const existingBudget = existingBudgets[0];

    // Keep existing values when fields are not provided
    const newCategoryId = category_id === undefined
      ? Number(existingBudget.category_id)
      : Number(category_id);

    const newAmount = amount === undefined
      ? Number(existingBudget.amount)
      : Number(amount);

    let newMonth = existingBudget.budget_month;

    if (budget_month !== undefined) {
      if (
        typeof budget_month !== "string" ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(budget_month)
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid budget month in YYYY-MM format."
        });
      }

      newMonth = `${budget_month}-01`;
    }

    // Validate category ID
    if (
      !Number.isInteger(newCategoryId) ||
      newCategoryId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid category ID."
      });
    }

    // Validate amount
    if (
      !Number.isFinite(newAmount) ||
      newAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget amount must be greater than zero."
      });
    }

    // Validate expense category and ownership
    const [categories] = await pool.query(
      `SELECT id, name
       FROM categories
       WHERE id = ?
         AND type = 'expense'
         AND (user_id IS NULL OR user_id = ?)`,
      [newCategoryId, userId]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense category or category does not belong to you."
      });
    }

    // Prevent duplicate category-month combinations
    const [duplicates] = await pool.query(
      `SELECT id
       FROM budgets
       WHERE user_id = ?
         AND category_id = ?
         AND budget_month = ?
         AND id != ?`,
      [userId, newCategoryId, newMonth, budgetId]
    );

    if (duplicates.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another budget already exists for this category and month."
      });
    }

    // Update budget
    await pool.query(
      `UPDATE budgets
       SET category_id = ?,
           amount = ?,
           budget_month = ?
       WHERE id = ? AND user_id = ?`,
      [newCategoryId, newAmount, newMonth, budgetId, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully!",
      budget: {
        id: budgetId,
        category_id: newCategoryId,
        category_name: categories[0].name,
        amount: newAmount,
        budget_month: newMonth
      }
    });

  } catch (error) {
    console.error("Update budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the budget."
    });
  }
};
