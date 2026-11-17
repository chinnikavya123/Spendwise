
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
  CalendarDays,
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

const initialTransactions = [
  { id: 1, title: "Monthly Salary", category: "Salary", type: "income", amount: 65000, date: "2026-11-01", note: "Monthly salary credited" },
  { id: 2, title: "Grocery Shopping", category: "Food", type: "expense", amount: 2450, date: "2026-11-03", note: "Weekly groceries" },
  { id: 3, title: "Electricity Bill", category: "Bills", type: "expense", amount: 1800, date: "2026-11-05", note: "Monthly electricity bill" },
  { id: 4, title: "Freelance Project", category: "Freelance", type: "income", amount: 8500, date: "2026-11-07", note: "Website development" },
  { id: 5, title: "Online Shopping", category: "Shopping", type: "expense", amount: 3200, date: "2026-11-09", note: "Personal purchases" },
  { id: 6, title: "Cab & Transport", category: "Transport", type: "expense", amount: 750, date: "2026-11-11", note: "Travel expenses" },
  { id: 7, title: "Course Subscription", category: "Education", type: "expense", amount: 1200, date: "2026-11-12", note: "Online learning" },
  { id: 8, title: "Investment Return", category: "Other", type: "income", amount: 2100, date: "2026-11-14", note: "Investment earnings" }
];

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Salary",
  "Freelance",
  "Other"
];

const categoryIcons = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Transport: Car,
  Bills: Home,
  Education: GraduationCap,
  Health: Heart,
  Salary: Briefcase,
  Freelance: CircleDollarSign
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

export default function Transactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("spendwise_transactions");
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    category: "Food",
    type: "expense",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: ""
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(
      "spendwise_transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || t.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;

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

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingId(transaction.id);
    setForm({
      title: transaction.title,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note || ""
    });
    setShowModal(true);
  };

  const saveTransaction = (e) => {
    e.preventDefault();

    if (!form.title.trim() || Number(form.amount) <= 0) return;

    if (editingId !== null) {
      setTransactions((previous) =>
        previous.map((t) =>
          t.id === editingId
            ? { ...form, amount: Number(form.amount), id: editingId }
            : t
        )
      );
    } else {
      setTransactions((previous) => [
        { ...form, amount: Number(form.amount), id: Date.now() },
        ...previous
      ]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const deleteTransaction = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions((previous) => previous.filter((t) => t.id !== id));
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

      <div className="transaction-summary">
        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Total Income</span>
            <div className="summary-icon income-bg"><ArrowDownRight size={19} /></div>
          </div>
          <h2>{formatCurrency(totals.income)}</h2>
          <span className="summary-caption">All recorded income</span>
        </div>

        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Total Expenses</span>
            <div className="summary-icon expense-bg"><ArrowUpRight size={19} /></div>
          </div>
          <h2>{formatCurrency(totals.expenses)}</h2>
          <span className="summary-caption">All recorded expenses</span>
        </div>

        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Net Balance</span>
            <div className="summary-icon balance-bg"><Wallet size={19} /></div>
          </div>
          <h2>{formatCurrency(totals.balance)}</h2>
          <span className="summary-caption">Income minus expenses</span>
        </div>

        <div className="transaction-stat">
          <div className="transaction-stat-top">
            <span>Transactions</span>
            <div className="summary-icon count-bg"><ArrowUpDown size={19} /></div>
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
              onChange={(e) => setSearch(e.target.value)}
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
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <select
              className="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className="category-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              {filteredTransactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category] || MoreHorizontal;

                return (
                  <tr key={transaction.id}>
                    <td>
                      <div className="table-transaction-name">
                        <div className={`table-category-icon ${transaction.type}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <strong>{transaction.title}</strong>
                          <span>{transaction.note || "No description"}</span>
                        </div>
                      </div>
                    </td>

                    <td><span className="category-pill">{transaction.category}</span></td>
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
                        <button title="Edit" onClick={() => openEditModal(transaction)}>
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

          {filteredTransactions.length === 0 && (
            <div className="empty-transactions">
              <Search size={28} />
              <h3>No transactions found</h3>
              <p>Try changing your search or filters.</p>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="transaction-modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}>
          <form className="transaction-modal" onSubmit={saveTransaction}>
            <div className="modal-heading">
              <div>
                <h2>{editingId !== null ? "Edit Transaction" : "Add Transaction"}</h2>
                <p>Enter the details of your financial activity.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="transaction-type-toggle">
              <button
                type="button"
                className={form.type === "expense" ? "selected expense-selected" : ""}
                onClick={() => setForm({ ...form, type: "expense" })}
              >
                <ArrowUpRight size={17} /> Expense
              </button>

              <button
                type="button"
                className={form.type === "income" ? "selected income-selected" : ""}
                onClick={() => setForm({ ...form, type: "income" })}
              >
                <ArrowDownRight size={17} /> Income
              </button>
            </div>

            <label className="transaction-form-label">
              Transaction Name
              <input
                required
                maxLength={60}
                placeholder="e.g. Grocery shopping"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>

            <label className="transaction-form-label">
              Amount (₹)
              <input
                required
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </label>

            <div className="transaction-form-row">
              <label className="transaction-form-label">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="transaction-form-label">
                Date
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
            </div>

            <label className="transaction-form-label">
              Note (Optional)
              <textarea
                rows="3"
                maxLength={150}
                placeholder="Add a short description..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
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
              <button type="submit" className="save-transaction-btn">
                {editingId !== null ? "Save Changes" : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
