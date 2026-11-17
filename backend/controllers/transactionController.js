
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


export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      type,
      category_id,
      start_date,
      end_date,
      page = 1,
      limit = 10
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isSafeInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isSafeInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100."
      });
    }

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be income or expense."
      });
    }

    let categoryId = null;

    if (category_id !== undefined) {
      categoryId = Number(category_id);

      if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID."
        });
      }
    }

    const isValidDate = (date) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
      }

      const parsedDate = new Date(`${date}T00:00:00Z`);

      return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
      );
    };

    if (
      (start_date && !isValidDate(start_date)) ||
      (end_date && !isValidDate(end_date))
    ) {
      return res.status(400).json({
        success: false,
        message: "Dates must be valid and use YYYY-MM-DD format."
      });
    }

    if (start_date && end_date && start_date > end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date."
      });
    }

    let query = "WHERE user_id = ?";
    const params = [userId];

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    if (categoryId !== null) {
      query += " AND category_id = ?";
      params.push(categoryId);
    }

    if (start_date) {
      query += " AND transaction_date >= ?";
      params.push(start_date);
    }

    if (end_date) {
      query += " AND transaction_date <= ?";
      params.push(end_date);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions ${query}`,
      params
    );

    const total = Number(countResult[0].total);
    const totalPages = Math.ceil(total / limitNumber);
    const offset = (pageNumber - 1) * limitNumber;

    const [transactions] = await pool.query(
      `SELECT id, category_id, category_name, type, amount,
              description, transaction_date, payment_method,
              created_at, updated_at
       FROM transactions
       ${query}
       ORDER BY transaction_date DESC, created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNumber, offset]
    );

    return res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully!",
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages
      },
      transactions
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving transactions."
    });
  }
};
