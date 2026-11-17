
import pool from "../config/db.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [summaryRows] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE
          WHEN type = 'income' THEN amount
          ELSE 0
        END), 0) AS total_income,

        COALESCE(SUM(CASE
          WHEN type = 'expense' THEN amount
          ELSE 0
        END), 0) AS total_expenses,

        COALESCE(SUM(CASE
          WHEN type = 'income'
          AND transaction_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND transaction_date < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
          THEN amount
          ELSE 0
        END), 0) AS monthly_income,

        COALESCE(SUM(CASE
          WHEN type = 'expense'
          AND transaction_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND transaction_date < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
          THEN amount
          ELSE 0
        END), 0) AS monthly_expenses

      FROM transactions
      WHERE user_id = ?`,
      [userId]
    );

    const summary = summaryRows[0];

    const totalIncome = Number(summary.total_income);
    const totalExpenses = Number(summary.total_expenses);

    return res.status(200).json({
      success: true,
      message: "Dashboard summary retrieved successfully!",
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        monthly_income: Number(summary.monthly_income),
        monthly_expenses: Number(summary.monthly_expenses)
      }
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving the dashboard summary."
    });
  }
};
