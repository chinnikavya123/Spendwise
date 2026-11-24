
import {
  ArrowUpRight,
  ArrowRight,
  Wallet,
  ShoppingBag,
  Sparkles,
  CalendarDays
} from "lucide-react";

import { useEffect, useState } from "react";
import { dashboardStats } from "../data/dashboardData";

import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import CategoryChart from "../components/CategoryChart";

import api from "../services/api";
import { useAuth } from "../context/useAuth";

export default function Overview() {
  const { user } = useAuth();
  const currentDate = new Date();

const currentMonth = `${currentDate.getFullYear()}-${String(
  currentDate.getMonth() + 1
).padStart(2, "0")}`;

const currentMonthLabel = currentDate.toLocaleDateString("en-IN", {
  month: "long",
  year: "numeric"
});
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
const [transactionsLoading, setTransactionsLoading] = useState(true);
const [transactionsError, setTransactionsError] = useState("");
const [monthlyData, setMonthlyData] = useState([]);
const [monthlyLoading, setMonthlyLoading] = useState(true);
const [monthlyError, setMonthlyError] = useState("");
const [categoryData, setCategoryData] = useState([]);
const [categoryLoading, setCategoryLoading] = useState(true);
const [categoryError, setCategoryError] = useState("");
const [budgets, setBudgets] = useState([]);
const [budgetsLoading, setBudgetsLoading] = useState(true);
const [budgetsError, setBudgetsError] = useState("");
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("/dashboard/summary");
        setSummary(response.data.summary);
      } catch (error) {
        setSummaryError(
          error.response?.data?.message ||
          "Unable to load dashboard summary."
        );
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get("/dashboard/recent-transactions");
      setRecentTransactions(response.data.transactions);
    } catch (error) {
      setTransactionsError(
        error.response?.data?.message ||
        "Unable to load recent transactions."
      );
    } finally {
      setTransactionsLoading(false);
    }
  };

  fetchRecentTransactions();
}, []);
useEffect(() => {
  const fetchMonthlyAnalytics = async () => {
    try {
      const response = await api.get("/dashboard/monthly-analytics");
      setMonthlyData(response.data.monthly_data);
    } catch (error) {
      setMonthlyError(
        error.response?.data?.message ||
        "Unable to load monthly analytics."
      );
    } finally {
      setMonthlyLoading(false);
    }
  };

  fetchMonthlyAnalytics();
}, []);

useEffect(() => {
  const fetchCategoryAnalytics = async () => {
    try {
      const response = await api.get("/dashboard/category-analytics");
      setCategoryData(response.data.expense_categories || []);
    } catch (error) {
      setCategoryError(
        error.response?.data?.message ||
        "Unable to load expense breakdown."
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  fetchCategoryAnalytics();
}, []);

useEffect(() => {
  const fetchBudgets = async () => {
    try {
      const response = await api.get("/budgets", {
        params: { month: currentMonth }
      });

      setBudgets(response.data.budgets || []);
    } catch (error) {
      setBudgetsError(
        error.response?.data?.message ||
        "Unable to load budget progress."
      );
    } finally {
      setBudgetsLoading(false);
    }
  };

  fetchBudgets();
}, [currentMonth]);

const currentMonthAnalytics = monthlyData.find(
  (item) => item.month === currentMonth
);

const previousMonthDate = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 1,
  1
);

const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(
  previousMonthDate.getMonth() + 1
).padStart(2, "0")}`;

const previousMonthAnalytics = monthlyData.find(
  (item) => item.month === previousMonthKey
);

const currentMonthExpenses = Number(
  currentMonthAnalytics?.expenses || 0
);

const previousMonthExpenses = Number(
  previousMonthAnalytics?.expenses || 0
);

const daysElapsed = currentDate.getDate();

const previousMonthDays = new Date(
  previousMonthDate.getFullYear(),
  previousMonthDate.getMonth() + 1,
  0
).getDate();

const currentDailySpending = currentMonthExpenses / daysElapsed;

const previousDailySpending =
  previousMonthExpenses / previousMonthDays;

const spendingDifference =
  previousDailySpending - currentDailySpending;

const spendingChangePercentage =
  previousDailySpending > 0
    ? Math.abs(
        (spendingDifference / previousDailySpending) * 100
      )
    : 0;

const formatInsightAmount = (amount) =>
  `₹${Math.round(amount).toLocaleString("en-IN")}`;

let insight;

if (previousMonthExpenses === 0 && currentMonthExpenses === 0) {
  insight = {
    title: "Start tracking your spending!",
    message:
      "Add your expenses to receive personalized insights about your spending habits.",
    amount: "No spending data yet",
    label: "Your financial insights will appear here."
  };
} else if (previousMonthExpenses === 0) {
  insight = {
    title: "Your spending journey has started!",
    message:
      "Continue recording your transactions. Once you have previous month data, we can compare your spending habits.",
    amount: formatInsightAmount(currentMonthExpenses),
    label: "Expenses recorded this month"
  };
} else if (spendingDifference > 0.01) {
  insight = {
    title: "Great progress with your spending!",
    message:
      `Your average daily spending is ${spendingChangePercentage.toFixed(1)}% lower than last month's daily average.`,
    amount: formatInsightAmount(
      spendingDifference * daysElapsed
    ),
    label: "Estimated lower spending at your current rate"
  };
} else if (spendingDifference < -0.01) {
  insight = {
    title: "Keep an eye on your spending!",
    message:
      `Your average daily spending is ${spendingChangePercentage.toFixed(1)}% higher than last month's daily average.`,
    amount: formatInsightAmount(
      Math.abs(spendingDifference) * daysElapsed
    ),
    label: "Estimated additional spending at your current rate"
  };
} else {
  insight = {
    title: "Your spending is consistent!",
    message:
      "Your average daily spending is almost the same as last month's daily average. Keep maintaining your habits.",
    amount: formatInsightAmount(currentDailySpending),
    label: "Average daily spending"
  };
}

  const summaryValues = {
    "Total Balance": summary?.balance ?? 0,
    "Monthly Income": summary?.monthly_income ?? 0,
    "Monthly Expenses": summary?.monthly_expenses ?? 0,
    "Total Savings": summary
      ? Number(summary.total_income) - Number(summary.total_expenses)
      : 0
  };

  return (
    <div className="overview-page">
      <div className="welcome-section">
        <div>
          <div className="welcome-tag">
            <Sparkles size={14} /> YOUR FINANCIAL SPACE
          </div>

          <h1>
            Good evening, {user?.name || "User"} <span>✦</span>
          </h1>

          <p>Here's what's happening with your money today.</p>
        </div>

        <button className="date-button">
          <CalendarDays size={17} />
          {currentMonthLabel}
        </button>
      </div>

      <section className="stats-grid">
        {summaryLoading ? (
          <p>Loading your financial summary...</p>
        ) : summaryError ? (
          <p>{summaryError}</p>
        ) : (
          dashboardStats.map((stat) => (
            <StatCard
              key={stat.title}
              stat={{
                ...stat,
                amount: Number(summaryValues[stat.title]),
                change: "",
                description: "Live account data"
              }}
            />
          ))
        )}
      </section>

      <section className="charts-grid">
        {monthlyLoading ? (
  <div className="chart-card">
    <p>Loading cash flow data...</p>
  </div>
) : monthlyError ? (
  <div className="chart-card">
    <p>{monthlyError}</p>
  </div>
) : (
  <SpendingChart data={monthlyData} />
)}
        <CategoryChart
  data={categoryData}
  loading={categoryLoading}
  error={categoryError}
/>
      </section>

      <section className="bottom-grid">
        <div className="transactions-card">
          <div className="section-heading">
            <div>
              <h3>Recent Transactions</h3>
              <p>Your latest financial activity</p>
            </div>

            <button className="text-button">
              View all <ArrowRight size={15} />
            </button>
          </div>

          <div className="transaction-list">
  {transactionsLoading ? (
    <p>Loading recent transactions...</p>
  ) : transactionsError ? (
    <p>{transactionsError}</p>
  ) : recentTransactions.length === 0 ? (
    <p>No transactions yet. Add your first transaction!</p>
  ) : (
    recentTransactions.map((item) => {
      const isIncome = item.type === "income";
      const Icon = isIncome ? Wallet : ShoppingBag;
      const amount = Number(item.amount);

      const transactionDate = item.transaction_date
        ? new Date(
            String(item.transaction_date).slice(0, 10) + "T00:00:00"
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
          })
        : "";

      return (
        <div className="transaction-row" key={item.id}>
          <div className="transaction-icon">
            <Icon size={19} />
          </div>

          <div className="transaction-details">
            <strong>{item.description || item.category_name}</strong>
            <span>{item.category_name} · {transactionDate}</span>
          </div>

          <strong
            className={`transaction-amount ${isIncome ? "positive" : ""}`}
          >
            {isIncome ? "+" : "-"}₹
            {amount.toLocaleString("en-IN")}
          </strong>
        </div>
      );
    })
  )}
</div>
        </div>

        <div className="insight-card">
  <div className="insight-header">
    <div className="insight-icon">
      <Sparkles size={19} />
    </div>
    <span>SMART INSIGHT</span>
  </div>

  <h3>
    {monthlyLoading
      ? "Analyzing your spending..."
      : monthlyError
        ? "Insights unavailable"
        : insight.title}
  </h3>

  <p>
    {monthlyLoading
      ? "We're reviewing your recent transactions to find useful patterns."
      : monthlyError || insight.message}
  </p>

  <div className="insight-highlight">
    <ArrowUpRight size={20} />
    <div>
      <strong>
        {monthlyLoading || monthlyError ? "—" : insight.amount}
      </strong>
      <span>
        {monthlyLoading
          ? "Calculating your insights"
          : monthlyError
            ? "Please try again later."
            : insight.label}
      </span>
    </div>
  </div>

  <button
    className="insight-button"
    onClick={() => window.location.href = "/analytics"}
  >
    Explore analytics <ArrowRight size={15} />
  </button>
</div>

  <div className="budget-grid">
    {budgetsLoading ? (
      <p>Loading budget progress...</p>
    ) : budgetsError ? (
      <p>{budgetsError}</p>
    ) : budgets.length === 0 ? (
      <p>No budgets created for this month yet.</p>
    ) : (
      budgets.map((budget) => {
        const percentage = Math.min(
          Number(budget.percentage_used || 0),
          100
        );

        return (
          <div className="budget-item" key={budget.id}>
            <div className="budget-top">
              <strong>{budget.category_name}</strong>
              <span>{Math.round(Number(budget.percentage_used || 0))}%</span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="budget-amounts">
              <strong>
                ₹{Number(budget.spent_amount).toLocaleString("en-IN")}
              </strong>
              <span>
                of ₹{Number(budget.budget_amount).toLocaleString("en-IN")}
              </span>
            </div>

            <span>{budget.status}</span>
          </div>
        );
      })
    )}
  </div>
</section>
    </div>
  );
}
