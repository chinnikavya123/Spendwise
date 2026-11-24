
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  Activity,
  ArrowUpRight
} from "lucide-react";

import api from "../services/api";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#64748b",
  "#84cc16",
  "#a855f7"
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPeriodDates = (period, transactions) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);

  if (period === "thisMonth") {
    return { start, end: today };
  }

  if (period === "lastMonth") {
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0)
    };
  }

  if (period === "last3Months") {
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      end: today
    };
  }

  if (period === "thisYear") {
    return {
      start: new Date(today.getFullYear(), 0, 1),
      end: today
    };
  }

  const validDates = transactions
    .map((item) => parseDate(item.date))
    .filter(Boolean);

  return {
    start: validDates.length
      ? new Date(Math.min(...validDates.map((date) => date.getTime())))
      : start,
    end: today
  };
};

function MetricCard({ title, value, subtitle, icon: Icon, color, positive }) {
  return (
    <div className="analytics-metric-card">
      <div className="analytics-metric-top">
        <span>{title}</span>
        <div className={`analytics-metric-icon ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <h2>{value}</h2>

      <div className="analytics-metric-bottom">
        <span className={positive ? "metric-positive" : "metric-neutral"}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="analytics-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <div key={item.dataKey} className="tooltip-row">
          <span style={{ color: item.color }}>{item.name}</span>
          <strong>{currency(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
const [period, setPeriod] = useState("thisMonth");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports/transactions");

      const data = response.data.transactions || [];

      setTransactions(
        data.map((item) => ({
          ...item,
          date: item.transaction_date,
          category: item.category_name
        }))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchTransactions();
}, []);

  const filteredTransactions = useMemo(() => {
    const { start, end } = getPeriodDates(period, transactions);

    return transactions.filter((item) => {
      const date = parseDate(item.date);
      return date && date >= start && date <= end;
    });
  }, [transactions, period]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenses = filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    return {
      income,
      expenses,
      balance,
      savingsRate
    };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const categories = {};

    filteredTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const name = item.category || "Other";
        categories[name] =
          (categories[name] || 0) + Number(item.amount || 0);
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const cashFlowData = useMemo(() => {
    const grouped = {};

    filteredTransactions.forEach((item) => {
      const date = parseDate(item.date);
      if (!date) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!grouped[key]) {
        grouped[key] = {
          month: date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit"
          }),
          income: 0,
          expenses: 0
        };
      }

      if (item.type === "income") {
        grouped[key].income += Number(item.amount || 0);
      } else if (item.type === "expense") {
        grouped[key].expenses += Number(item.amount || 0);
      }
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);
  }, [filteredTransactions]);

  const topCategory = categoryData[0];

  const periodLabel = {
    thisMonth: "This month",
    lastMonth: "Last month",
    last3Months: "Last 3 months",
    thisYear: "This year",
    allTime: "All time"
  };

  return (
    <div className="analytics-page">
      <div className="analytics-heading">
        <div>
          <h1>Financial Analytics</h1>
          <p>
            Understand your spending patterns and make smarter financial
            decisions.
          </p>
        </div>

        <select
          className="analytics-period-select"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
        >
          <option value="thisMonth">This month</option>
          <option value="lastMonth">Last month</option>
          <option value="last3Months">Last 3 months</option>
          <option value="thisYear">This year</option>
          <option value="allTime">All time</option>
        </select>
      </div>

            {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#fef2f2",
            color: "#dc2626",
            fontSize: "14px"
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="analytics-empty">
          Loading your financial analytics...
        </div>
      )}
      <div className="analytics-metrics">
        <MetricCard
          title="Total Income"
          value={currency(summary.income)}
          subtitle="Money received"
          icon={TrendingUp}
          color="green"
          positive
        />

        <MetricCard
          title="Total Expenses"
          value={currency(summary.expenses)}
          subtitle="Money spent"
          icon={TrendingDown}
          color="red"
        />

        <MetricCard
          title="Net Balance"
          value={currency(summary.balance)}
          subtitle={summary.balance >= 0 ? "Positive balance" : "Expenses exceed income"}
          icon={Wallet}
          color="blue"
          positive={summary.balance >= 0}
        />

        <MetricCard
          title="Savings Rate"
          value={`${summary.savingsRate.toFixed(1)}%`}
          subtitle="Based on your income"
          icon={PiggyBank}
          color="purple"
          positive={summary.savingsRate >= 0}
        />
      </div>

      <div className="analytics-chart-grid">
        <section className="analytics-panel analytics-cashflow-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Income vs Expenses</h3>
              <p>Your monthly cash flow comparison</p>
            </div>
            <div className="analytics-panel-icon">
              <Activity size={19} />
            </div>
          </div>

          {cashFlowData.length > 0 ? (
            <div className="analytics-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cashFlowData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  barGap={8}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8eee9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7b8794", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7b8794", fontSize: 11 }}
                    tickFormatter={(value) =>
                      value >= 1000 ? `₹${value / 1000}k` : `₹${value}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10b981"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#f59e0b"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="analytics-empty">
              <Activity size={30} />
              <strong>No cash flow data yet</strong>
              <span>Add transactions for this period to see your chart.</span>
            </div>
          )}
        </section>

        <section className="analytics-panel analytics-category-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Spending Breakdown</h3>
              <p>Where your money goes</p>
            </div>
            <div className="analytics-panel-icon">
              <Target size={19} />
            </div>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className="analytics-pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => currency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="analytics-category-list">
                {categoryData.map((item, index) => {
                  const percentage =
                    summary.expenses > 0
                      ? (item.value / summary.expenses) * 100
                      : 0;

                  return (
                    <div className="analytics-category-item" key={item.name}>
                      <div className="category-item-left">
                        <span
                          className="category-dot"
                          style={{
                            background: COLORS[index % COLORS.length]
                          }}
                        />
                        <span>{item.name}</span>
                      </div>

                      <div className="category-item-right">
                        <strong>{currency(item.value)}</strong>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="analytics-empty">
              <Target size={30} />
              <strong>No spending data yet</strong>
              <span>Your expense categories will appear here.</span>
            </div>
          )}
        </section>
      </div>

      <div className="analytics-bottom-grid">
        <section className="analytics-panel analytics-insight-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Spending Highlights</h3>
              <p>A quick look at your financial activity</p>
            </div>
            <div className="analytics-panel-icon">
              <ArrowUpRight size={19} />
            </div>
          </div>

          <div className="analytics-highlight-list">
            <div className="analytics-highlight">
              <div className="highlight-icon green">
                <TrendingUp size={18} />
              </div>
              <div>
                <strong>Income received</strong>
                <span>{currency(summary.income)} during {periodLabel[period].toLowerCase()}</span>
              </div>
            </div>

            <div className="analytics-highlight">
              <div className="highlight-icon red">
                <TrendingDown size={18} />
              </div>
              <div>
                <strong>Money spent</strong>
                <span>{currency(summary.expenses)} during {periodLabel[period].toLowerCase()}</span>
              </div>
            </div>

            <div className="analytics-highlight">
              <div className="highlight-icon blue">
                <Wallet size={18} />
              </div>
              <div>
                <strong>Top spending category</strong>
                <span>
                  {topCategory
                    ? `${topCategory.name} · ${currency(topCategory.value)}`
                    : "No expense categories available"}
                </span>
              </div>
            </div>

            <div className="analytics-highlight">
              <div className="highlight-icon purple">
                <PiggyBank size={18} />
              </div>
              <div>
                <strong>Current savings</strong>
                <span>
                  {summary.balance >= 0
                    ? `${currency(summary.balance)} remaining`
                    : `${currency(Math.abs(summary.balance))} overspent`}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-panel analytics-activity-panel">
          <div className="analytics-panel-heading">
            <div>
              <h3>Activity Summary</h3>
              <p>Transaction overview for this period</p>
            </div>
            <div className="analytics-panel-icon">
              <Activity size={19} />
            </div>
          </div>

          <div className="analytics-activity-number">
            {filteredTransactions.length}
            <span>Transactions</span>
          </div>

          <div className="analytics-activity-row">
            <span>Income transactions</span>
            <strong>
              {filteredTransactions.filter((item) => item.type === "income").length}
            </strong>
          </div>

          <div className="analytics-activity-row">
            <span>Expense transactions</span>
            <strong>
              {filteredTransactions.filter((item) => item.type === "expense").length}
            </strong>
          </div>

          <div className="analytics-activity-row">
            <span>Average expense</span>
            <strong>
              {currency(
                filteredTransactions.filter((item) => item.type === "expense").length
                  ? summary.expenses /
                      filteredTransactions.filter((item) => item.type === "expense").length
                  : 0
              )}
            </strong>
          </div>
        </section>
      </div>
    </div>
  );
}
