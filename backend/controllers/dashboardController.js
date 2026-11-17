
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


export const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [transactions] = await pool.query(
      `SELECT
        id,
        category_id,
        category_name,
        type,
        amount,
        description,
        transaction_date,
        payment_method
      FROM transactions
      WHERE user_id = ?
      ORDER BY transaction_date DESC, created_at DESC, id DESC
      LIMIT 5`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Recent transactions retrieved successfully!",
      total: transactions.length,
      transactions
    });
  } catch (error) {
    console.error("Recent transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving recent transactions."
    });
  }
};


export const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startDate = new Date(
      currentYear,
      currentMonth - 5,
      1
    );

    const endDate = new Date(
      currentYear,
      currentMonth + 1,
      1
    );

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const [rows] = await pool.query(
      `SELECT
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,

        COALESCE(SUM(CASE
          WHEN type = 'income' THEN amount
          ELSE 0
        END), 0) AS income,

        COALESCE(SUM(CASE
          WHEN type = 'expense' THEN amount
          ELSE 0
        END), 0) AS expenses

      FROM transactions
      WHERE user_id = ?
        AND transaction_date >= ?
        AND transaction_date < ?

      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month ASC`,
      [userId, start, end]
    );

    const monthlyData = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(
        currentYear,
        currentMonth - 5 + i,
        1
      );

      const monthKey =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const monthRow = rows.find(
        (row) => row.month === monthKey
      );

      const income = monthRow ? Number(monthRow.income) : 0;
      const expenses = monthRow ? Number(monthRow.expenses) : 0;

      monthlyData.push({
        month: monthKey,
        month_name: date.toLocaleString("en-US", {
          month: "short"
        }),
        income,
        expenses,
        savings: income - expenses
      });
    }

    const totalIncome = monthlyData.reduce(
      (sum, item) => sum + item.income,
      0
    );

    const totalExpenses = monthlyData.reduce(
      (sum, item) => sum + item.expenses,
      0
    );

    return res.status(200).json({
      success: true,
      message: "Monthly analytics retrieved successfully!",
      period: {
        from: start,
        to: formatDate(new Date(endDate.getTime() - 86400000))
      },
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses
      },
      monthly_data: monthlyData
    });
  } catch (error) {
    console.error("Monthly analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving monthly analytics."
    });
  }
};


export const getCategoryAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const [rows] = await pool.query(
      `SELECT
        type,
        category_name,
        COUNT(*) AS transaction_count,
        SUM(amount) AS total_amount

      FROM transactions

      WHERE user_id = ?
        AND transaction_date >= ?
        AND transaction_date < ?

      GROUP BY type, category_name
      ORDER BY type ASC, total_amount DESC`,
      [userId, start, end]
    );

    const incomeRows = rows.filter(
      (row) => row.type === "income"
    );

    const expenseRows = rows.filter(
      (row) => row.type === "expense"
    );

    const totalIncome = incomeRows.reduce(
      (sum, row) => sum + Number(row.total_amount),
      0
    );

    const totalExpenses = expenseRows.reduce(
      (sum, row) => sum + Number(row.total_amount),
      0
    );

    const formatCategories = (categoryRows, total) => {
      return categoryRows.map((row) => {
        const amount = Number(row.total_amount);

        return {
          category_name: row.category_name,
          amount,
          transaction_count: Number(row.transaction_count),
          percentage: total > 0
            ? Number(((amount / total) * 100).toFixed(2))
            : 0
        };
      });
    };

    return res.status(200).json({
      success: true,
      message: "Category analytics retrieved successfully!",
      period: {
        from: start,
        to: formatDate(new Date(endDate.getTime() - 86400000))
      },
      totals: {
        income: totalIncome,
        expenses: totalExpenses
      },
      income_categories: formatCategories(
        incomeRows,
        totalIncome
      ),
      expense_categories: formatCategories(
        expenseRows,
        totalExpenses
      )
    });

  } catch (error) {
    console.error("Category analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving category analytics."
    });
  }
};
