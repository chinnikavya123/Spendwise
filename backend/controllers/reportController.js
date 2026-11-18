
import pool from "../config/db.js";

export const getTransactionReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { start_date, end_date, type, category_id } = req.query;

    const isValidDate = (date) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
      }

      const parsedDate = new Date(`${date}T00:00:00Z`);

      return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
    };

    if (start_date && !isValidDate(start_date)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid start date in YYYY-MM-DD format."
      });
    }

    if (end_date && !isValidDate(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid end date in YYYY-MM-DD format."
      });
    }

    if (start_date && end_date && start_date > end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date."
      });
    }

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be income or expense."
      });
    }

    if (
      category_id !== undefined &&
      (!Number.isInteger(Number(category_id)) || Number(category_id) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid category ID."
      });
    }

    let query = `
      SELECT
        t.id,
        t.category_id,
        c.name AS category_name,
        t.type,
        t.amount,
        t.description,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
        t.payment_method
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;

    const params = [userId];

    if (start_date) {
      query += " AND t.transaction_date >= ?";
      params.push(start_date);
    }

    if (end_date) {
      query += " AND t.transaction_date <= ?";
      params.push(end_date);
    }

    if (type) {
      query += " AND t.type = ?";
      params.push(type);
    }

    if (category_id !== undefined) {
      query += " AND t.category_id = ?";
      params.push(Number(category_id));
    }

    query += " ORDER BY t.transaction_date DESC, t.created_at DESC, t.id DESC";

    const [transactions] = await pool.query(query, params);

    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const totalExpenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    return res.status(200).json({
      success: true,
      message: "Transaction report generated successfully!",
      filters: {
        start_date: start_date || null,
        end_date: end_date || null,
        type: type || null,
        category_id: category_id ? Number(category_id) : null
      },
      summary: {
        total_transactions: transactions.length,
        total_income: Number(totalIncome.toFixed(2)),
        total_expenses: Number(totalExpenses.toFixed(2)),
        net_savings: Number((totalIncome - totalExpenses).toFixed(2))
      },
      transactions
    });
  } catch (error) {
    console.error("Generate transaction report error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating the transaction report."
    });
  }
};
