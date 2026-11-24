
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  CircleCheck,
  AlertTriangle,
  X,
  CalendarDays
} from "lucide-react";
import api from "../services/api";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const Budgets = () => {
  const [month, setMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    total_budget: 0,
    total_spent: 0,
    remaining_budget: 0,
    percentage_used: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    category_id: "",
    amount: ""
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      const expenseCategories = response.data.categories.filter(
        (category) => category.type === "expense"
      );
      setCategories(expenseCategories);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load categories."
      );
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
        await Promise.resolve();
      setLoading(true);
      setError("");

      const response = await api.get("/budgets", {
        params: { month }
      });

      setBudgets(response.data.budgets || []);
      setSummary(
        response.data.summary || {
          total_budget: 0,
          total_spent: 0,
          remaining_budget: 0,
          percentage_used: 0
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load budgets."
      );
    } finally {
      setLoading(false);
    }
    }, [month]);

  useEffect(() => {
  Promise.resolve().then(() => fetchCategories());
}, [fetchCategories]);

useEffect(() => {
  Promise.resolve().then(() => fetchBudgets());
}, [fetchBudgets]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      category_id: "",
      amount: ""
    });
    setShowModal(true);
  };

  const openEditModal = (budget) => {
    setEditingId(budget.id);
    setFormData({
      category_id: String(budget.category_id),
      amount: String(budget.budget_amount)
    });
    setShowModal(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSaveBudget = async (event) => {
    event.preventDefault();

    if (!formData.category_id || !formData.amount) {
      setError("Please select a category and enter a budget amount.");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError("Budget amount must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        category_id: Number(formData.category_id),
        amount: Number(formData.amount),
        budget_month: month
      };

      if (editingId !== null) {
        await api.put(`/budgets/${editingId}`, payload);
      } else {
        await api.post("/budgets", payload);
      }

      setShowModal(false);
      setEditingId(null);
      await fetchBudgets();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save budget."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (budget) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${budget.category_name} budget?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/budgets/${budget.id}`);
      await fetchBudgets();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete budget."
      );
    }
  };

  const getStatusDetails = (status) => {
    if (status === "Exceeded") {
      return {
        className: "budget-status-exceeded",
        icon: <AlertTriangle size={14} />,
        label: "Exceeded"
      };
    }

    if (status === "Warning") {
      return {
        className: "budget-status-warning",
        icon: <AlertTriangle size={14} />,
        label: "Warning"
      };
    }

    return {
      className: "budget-status-safe",
      icon: <CircleCheck size={14} />,
      label: "Safe"
    };
  };

  return (
    <div className="budget-page">
      <div className="budget-page-header">
        <div>
          <h1>Budgets</h1>
          <p>Plan your spending and stay in control of your finances.</p>
        </div>

        <button className="budget-add-button" onClick={openAddModal}>
          <Plus size={17} />
          Add Budget
        </button>
      </div>

      {error && (
        <div className="budget-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Close error">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="budget-month-filter">
        <CalendarDays size={18} />
        <label htmlFor="budget-month">Select Month</label>
        <input
          id="budget-month"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
      </div>

      <div className="budget-summary-grid">
        <div className="budget-summary-card">
          <div className="budget-summary-icon budget-icon-purple">
            <Wallet size={20} />
          </div>
          <p>Total Budget</p>
          <h2>{formatCurrency(summary.total_budget)}</h2>
          <span>Planned spending</span>
        </div>

        <div className="budget-summary-card">
          <div className="budget-summary-icon budget-icon-orange">
            <TrendingUp size={20} />
          </div>
          <p>Total Spent</p>
          <h2>{formatCurrency(summary.total_spent)}</h2>
          <span>Amount used so far</span>
        </div>

        <div className="budget-summary-card">
          <div className="budget-summary-icon budget-icon-green">
            <TrendingDown size={20} />
          </div>
          <p>Remaining Budget</p>
          <h2>{formatCurrency(summary.remaining_budget)}</h2>
          <span>Available to spend</span>
        </div>

        <div className="budget-summary-card">
          <div className="budget-summary-icon budget-icon-blue">
            <CalendarDays size={20} />
          </div>
          <p>Budget Used</p>
          <h2>{Number(summary.percentage_used || 0).toFixed(1)}%</h2>
          <span>Overall usage</span>
        </div>
      </div>

      <div className="budget-section">
        <div className="budget-section-heading">
          <div>
            <h2>Category Budgets</h2>
            <p>Track how much you spend in each category.</p>
          </div>
          <span>{budgets.length} budgets</span>
        </div>

        {loading ? (
          <div className="budget-empty-state">
            Loading your budgets...
          </div>
        ) : budgets.length === 0 ? (
          <div className="budget-empty-state">
            <Wallet size={35} />
            <h3>No budgets for this month</h3>
            <p>Create a category budget to start tracking your spending.</p>
            <button className="budget-add-button" onClick={openAddModal}>
              <Plus size={16} />
              Create Your First Budget
            </button>
          </div>
        ) : (
          <div className="budget-grid">
            {budgets.map((budget) => {
              const percentage = Number(budget.percentage_used || 0);
              const status = getStatusDetails(budget.status);

              return (
                <div className="budget-item" key={budget.id}>
                  <div className="budget-top">
                    <div>
                      <h3>{budget.category_name}</h3>
                      <span>{budget.transaction_count} transactions</span>
                    </div>

                    <div className={`budget-status ${status.className}`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  <div className="budget-amounts">
                    <strong>{formatCurrency(budget.spent_amount)}</strong>
                    <span>of {formatCurrency(budget.budget_amount)}</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${
                        budget.status === "Exceeded"
                          ? "budget-progress-exceeded"
                          : budget.status === "Warning"
                            ? "budget-progress-warning"
                            : ""
                      }`}
                      style={{
                        width: `${Math.min(Math.max(percentage, 0), 100)}%`
                      }}
                    />
                  </div>

                  <div className="budget-card-footer">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span>
                      {formatCurrency(budget.remaining_amount)} remaining
                    </span>
                  </div>

                  <div className="budget-card-actions">
                    <button onClick={() => openEditModal(budget)}>
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      className="budget-delete-button"
                      onClick={() => handleDeleteBudget(budget)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="transaction-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <form className="transaction-modal" onSubmit={handleSaveBudget}>
            <div className="modal-heading">
              <div>
                <h2>{editingId !== null ? "Edit Budget" : "Add Budget"}</h2>
                <p>Set a monthly spending limit for a category.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <label className="transaction-form-label">
              Expense Category
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="transaction-form-label">
              Monthly Budget Amount (₹)
              <input
                type="number"
                name="amount"
                placeholder="Enter budget amount"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="transaction-form-label">
              Budget Month
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                required
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-modal-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="budget-add-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Budget"
                    : "Save Budget"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Budgets;
