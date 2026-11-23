
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Pencil,
  Trash2,
  X,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Utensils,
  Car,
  Briefcase,
  Heart,
  GraduationCap,
  Home,
  CircleDollarSign,
  MoreHorizontal
} from "lucide-react";

import api from "../services/api";

const categoryIcons = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  bills: Home,
  education: GraduationCap,
  health: Heart,
  salary: Briefcase,
  freelance: CircleDollarSign
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const formatDate = (date) =>
  new Date(`${String(date).slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createEmptyForm = (categoryId = "") => ({
  title: "",
  category_id: categoryId ? String(categoryId) : "",
  type: "expense",
  amount: "",
  date: getToday(),
  payment_method: ""
});

const mapTransaction = (item) => ({
  id: item.id,
  category_id: item.category_id,
  title: item.description || item.category_name,
  category: item.category_name,
  type: item.type,
  amount: Number(item.amount),
  date: String(item.transaction_date).slice(0, 10),
  payment_method: item.payment_method || ""
});

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());

  const fetchTransactions = async () => {
    const firstResponse = await api.get("/transactions", {
      params: {
        page: 1,
        limit: 100
      }
    });

    const firstPage = firstResponse.data.transactions || [];
    const totalPages = firstResponse.data.pagination?.totalPages || 1;

    let allTransactions = [...firstPage];

    if (totalPages > 1) {
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          api.get("/transactions", {
            params: {
              page: index + 2,
              limit: 100
            }
          })
        )
      );

      remainingPages.forEach((response) => {
        allTransactions.push(...(response.data.transactions || []));
      });
    }

    setTransactions(allTransactions.map(mapTransaction));
  };

  useEffect(() => {
  let isMounted = true;

  const initializeData = async () => {
    try {
      const firstResponse = await api.get("/transactions", {
        params: { page: 1, limit: 100 }
      });

      const firstPage = firstResponse.data.transactions || [];
      const totalPages = firstResponse.data.pagination?.totalPages || 1;

      let allTransactions = [...firstPage];

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            api.get("/transactions", {
              params: { page: index + 2, limit: 100 }
            })
          )
        );

        remainingPages.forEach((response) => {
          allTransactions.push(...(response.data.transactions || []));
        });
      }

      const categoryResponse = await api.get("/categories");
      const categoryList = categoryResponse.data.categories || [];

      if (!isMounted) return;

      setTransactions(allTransactions.map(mapTransaction));
      setCategories(categoryList);

      setForm((previous) => ({
        ...previous,
        category_id:
          previous.category_id ||
          String(categoryList.find((item) => item.type === "expense")?.id || "")
      }));
    } catch (err) {
      if (isMounted) {
        setError(
          err.response?.data?.message ||
          "Unable to load your transactions. Please try again."
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  initializeData();

  return () => {
    isMounted = false;
  };
}, []);

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const result = transactions.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || item.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        String(item.category_id) === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") return b.date.localeCompare(a.date);
      if (sortBy === "oldest") return a.date.localeCompare(b.date);
      if (sortBy === "highest") return b.amount - a.amount;
      return a.amount - b.amount;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortBy]);

  const availableFormCategories = categories.filter(
    (category) => category.type === form.type
  );

  const openAddModal = () => {
    const firstCategory = categories.find(
      (category) => category.type === "expense"
    );

    setEditingId(null);
    setForm(createEmptyForm(firstCategory?.id));
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingId(transaction.id);

    setForm({
      title: transaction.title,
      category_id: String(transaction.category_id),
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      payment_method: transaction.payment_method || ""
    });

    setShowModal(true);
  };

  const handleTypeChange = (type) => {
    const firstCategory = categories.find(
      (category) => category.type === type
    );

    setForm((previous) => ({
      ...previous,
      type,
      category_id: String(firstCategory?.id || "")
    }));
  };

  const saveTransaction = async (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.category_id ||
      Number(form.amount) <= 0
    ) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      category_id: Number(form.category_id),
      type: form.type,
      amount: Number(form.amount),
      description: form.title.trim(),
      transaction_date: form.date,
      payment_method: form.payment_method.trim() || null
    };

    try {
      if (editingId !== null) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      await fetchTransactions();

      setShowModal(false);
      setEditingId(null);
      setForm(createEmptyForm(categories.find(
        (item) => item.type === "expense"
      )?.id));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save the transaction. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setError("");

    try {
      await api.delete(`/transactions/${id}`);
      await fetchTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete the transaction."
      );
    }
  };

  return (
    <div className="transactions-page">
      <div className="transactions-heading">
        <div>
          <div className="transactions-eyebrow">FINANCIAL ACTIVITY</div>
          <h1>Transactions</h1>
          <p>Track, manage and understand where your money goes.</p>
        </div>

        <button className="add-transaction-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="transaction-summary">
        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Total Income</span>
            <div className="summary-icon income-bg">
              <ArrowDownRight size={19} />
            </div>
          </div>
          <h2>{formatCurrency(totals.income)}</h2>
          <span className="summary-caption">All recorded income</span>
        </div>

        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Total Expenses</span>
            <div className="summary-icon expense-bg">
              <ArrowUpRight size={19} />
            </div>
          </div>
          <h2>{formatCurrency(totals.expenses)}</h2>
          <span className="summary-caption">All recorded expenses</span>
        </div>

        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Net Balance</span>
            <div className="summary-icon balance-bg">
              <Wallet size={19} />
            </div>
          </div>
          <h2>{formatCurrency(totals.balance)}</h2>
          <span className="summary-caption">Income minus expenses</span>
        </div>

        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Transactions</span>
            <div className="summary-icon count-bg">
              <ArrowUpDown size={19} />
            </div>
          </div>
          <h2>{transactions.length}</h2>
          <span className="summary-caption">Total recorded entries</span>
        </div>
      </div>

      <section className="transaction-table-card">
        <div className="transaction-table-heading">
          <div>
            <h3>All Transactions</h3>
            <p>View and manage your financial activity</p>
          </div>

          <span className="transaction-count">
            {filteredTransactions.length} entries
          </span>
        </div>

        <div className="transaction-toolbar">
          <div className="transaction-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="transaction-filters">
            <div className="filter-control">
              <Filter size={15} />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <select
              className="category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              className="category-filter"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        <div className="transaction-table-wrapper">
          <table className="full-transaction-table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {!loading && filteredTransactions.map((transaction) => {
                const Icon =
                  categoryIcons[transaction.category.toLowerCase()] ||
                  MoreHorizontal;

                return (
                  <tr key={transaction.id}>
                    <td>
                      <div className="table-transaction-name">
                        <div className={`table-category-icon ${transaction.type}`}>
                          <Icon size={18} />
                        </div>

                        <div>
                          <strong>{transaction.title}</strong>
                          <span>
                            {transaction.payment_method || "No payment method"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-pill">
                        {transaction.category}
                      </span>
                    </td>

                    <td>{formatDate(transaction.date)}</td>

                    <td>
                      <span className={`type-pill ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>

                    <td>
                      <strong className={`table-amount ${transaction.type}`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </strong>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          title="Edit"
                          onClick={() => openEditModal(transaction)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          title="Delete"
                          className="delete-action"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading ? (
            <div className="empty-transactions">
              <p>Loading your transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-transactions">
              <Search size={28} />
              <h3>
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No transactions found"}
              </h3>
              <p>
                {transactions.length === 0
                  ? "Add your first transaction to start tracking your money."
                  : "Try changing your search or filters."}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {showModal && (
        <div
          className="transaction-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <form className="transaction-modal" onSubmit={saveTransaction}>
            <div className="modal-heading">
              <div>
                <h2>
                  {editingId !== null ? "Edit Transaction" : "Add Transaction"}
                </h2>
                <p>Enter the details of your financial activity.</p>
              </div>

              <button type="button" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="transaction-type-toggle">
              <button
                type="button"
                className={
                  form.type === "expense"
                    ? "selected expense-selected"
                    : ""
                }
                onClick={() => handleTypeChange("expense")}
              >
                <ArrowUpRight size={17} /> Expense
              </button>

              <button
                type="button"
                className={
                  form.type === "income"
                    ? "selected income-selected"
                    : ""
                }
                onClick={() => handleTypeChange("income")}
              >
                <ArrowDownRight size={17} /> Income
              </button>
            </div>

            <label className="transaction-form-label">
              Transaction Name
              <input
                required
                maxLength={255}
                placeholder="e.g. Grocery shopping"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </label>

            <label className="transaction-form-label">
              Amount (₹)
              <input
                required
                type="number"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
              />
            </label>

            <div className="transaction-form-row">
              <label className="transaction-form-label">
                Category
                <select
                  required
                  value={form.category_id}
                  onChange={(event) =>
                    setForm({ ...form, category_id: event.target.value })
                  }
                >
                  <option value="" disabled>
                    Select category
                  </option>

                  {availableFormCategories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="transaction-form-label">
                Date
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </label>
            </div>

            <label className="transaction-form-label">
              Payment Method (Optional)
              <input
                maxLength={50}
                placeholder="e.g. UPI, Cash, Card"
                value={form.payment_method}
                onChange={(event) =>
                  setForm({
                    ...form,
                    payment_method: event.target.value
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-modal-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-transaction-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
