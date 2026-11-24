
import { useEffect, useState } from "react";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Filter,
  RefreshCw,
  ReceiptText
} from "lucide-react";

import api from "../services/api";

const formatAmount = (amount) =>
  `\u20B9${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const formatDate = (date) => {
  if (!date) return "—";

  const [year, month, day] = String(date)
    .split("T")[0]
    .split("-");

  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }

  return new Date(date).toLocaleDateString("en-IN");
};

const emptySummary = {
  total_income: 0,
  total_expenses: 0,
  net_savings: 0,
  total_transactions: 0
};

export default function Reports() {
  const [summary, setSummary] = useState(emptySummary);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports/transactions", {
        params: filters
      });

      setSummary(response.data.summary || emptySummary);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load report data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const [reportResponse, categoryResponse] = await Promise.all([
          api.get("/reports/transactions"),
          api.get("/categories")
        ]);

        if (!cancelled) {
          setSummary(reportResponse.data.summary || emptySummary);
          setTransactions(reportResponse.data.transactions || []);
          setCategories(categoryResponse.data.categories || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            "Unable to load report data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleApplyFilters = () => {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    const filters = {};

    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (type) filters.type = type;
    if (categoryId) filters.category_id = categoryId;

    fetchReport(filters);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setType("");
    setCategoryId("");
    fetchReport();
  };

  const summaryCards = [
    {
      title: "Total Income",
      value: formatAmount(summary.total_income),
      icon: TrendingUp,
      color: "income"
    },
    {
      title: "Total Expenses",
      value: formatAmount(summary.total_expenses),
      icon: TrendingDown,
      color: "expense"
    },
    {
      title: "Net Savings",
      value: formatAmount(summary.net_savings),
      icon: Wallet,
      color: "savings"
    },
    {
      title: "Total Transactions",
      value: summary.total_transactions || 0,
      icon: FileText,
      color: "count"
    }
  ];

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <div>
          <h1>Reports</h1>
          <p>
            Review your financial activity and track your money.
          </p>
        </div>
      </div>

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      <div className="reports-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="reports-summary-card" key={card.title}>
              <div className={`reports-summary-icon ${card.color}`}>
                <Icon size={21} />
              </div>

              <div>
                <p>{card.title}</p>
                <h2>
                  {loading ? "Loading..." : card.value}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="reports-filter-card">
        <div className="reports-section-heading">
          <Filter size={19} />
          <h3>Filter Report</h3>
        </div>

        <div className="reports-filter-grid">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Transaction Type</label>
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              className="form-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={String(category.id)}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="reports-filter-actions">
          <button
            className="primary-button"
            onClick={handleApplyFilters}
            disabled={loading}
          >
            <Filter size={16} />
            Apply Filters
          </button>

          <button
            className="secondary-button"
            onClick={handleResetFilters}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="reports-table-card">
        <div className="reports-table-heading">
          <div>
            <div className="reports-section-heading">
              <ReceiptText size={19} />
              <h3>Transaction Details</h3>
            </div>
            <p>Your transactions based on the selected filters.</p>
          </div>

          <span className="reports-count">
            {transactions.length} Transactions
          </span>
        </div>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Payment Method</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="reports-empty">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="reports-empty">
                    No transactions found for the selected filters.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {formatDate(transaction.transaction_date)}
                    </td>

                    <td>
                      {transaction.description || "—"}
                    </td>

                    <td>
                      {transaction.category_name || "—"}
                    </td>

                    <td>
                      <span className={`reports-type ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>

                    <td>
                      {transaction.payment_method || "—"}
                    </td>

                    <td>
                      <span
                        className={`reports-amount ${
                          transaction.type === "income"
                            ? "reports-income"
                            : "reports-expense"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatAmount(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
