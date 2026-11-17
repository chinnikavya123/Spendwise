
import pool from "../config/db.js";

export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      category_id,
      type,
      amount,
      description,
      transaction_date,
      payment_method
    } = req.body;

    if (!category_id || !type || amount === undefined || !transaction_date) {
      return res.status(400).json({
        success: false,
        message: "Category, type, amount and transaction date are required."
      });
    }

    const categoryId = Number(category_id);
    const transactionAmount = Number(amount);

    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID."
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be income or expense."
      });
    }

    if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero."
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)) {
      return res.status(400).json({
        success: false,
        message: "Transaction date must be in YYYY-MM-DD format."
      });
    }

    const parsedDate = new Date(`${transaction_date}T00:00:00Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== transaction_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid transaction date."
      });
    }

    const [categories] = await pool.query(
      `SELECT id, name, type
       FROM categories
       WHERE id = ?
       AND (user_id IS NULL OR user_id = ?)`,
      [categoryId, userId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found or unavailable."
      });
    }

    const category = categories[0];

    if (category.type !== type) {
      return res.status(400).json({
        success: false,
        message: "Transaction type does not match the selected category."
      });
    }

    const [result] = await pool.query(
      `INSERT INTO transactions
       (user_id, category_id, category_name, type, amount,
        description, transaction_date, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        categoryId,
        category.name,
        type,
        transactionAmount,
        description?.trim() || null,
        transaction_date,
        payment_method?.trim() || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully!",
      transaction: {
        id: result.insertId,
        user_id: userId,
        category_id: categoryId,
        category_name: category.name,
        type,
        amount: transactionAmount,
        description: description?.trim() || null,
        transaction_date,
        payment_method: payment_method?.trim() || null
      }
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the transaction."
    });
  }
};
