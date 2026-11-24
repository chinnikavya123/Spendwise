
import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CircleCheck,
  AlertTriangle,
  Lightbulb,
  Target,
  RefreshCw
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import api from "../services/api";

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0
  })}`;

const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const SmartInsights = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = getMonthKey(currentDate);

  const currentMonthLabel = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError("");

      try {
        const [summaryResponse, monthlyResponse, categoryResponse] =
          await Promise.all([
            api.get("/dashboard/summary"),
            api.get("/dashboard/monthly-analytics"),
            api.get("/dashboard/category-analytics")
          ]);

        setSummary(summaryResponse.data.summary);
        setMonthlyData(monthlyResponse.data.monthly_data || []);
        setCategoryData(categoryResponse.data.expense_categories || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load your smart insights. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const insights = useMemo(() => {
    const currentIndex = monthlyData.findIndex(
      (item) => item.month === currentMonth
    );

    const current = currentIndex >= 0
      ? monthlyData[currentIndex]
      : null;

    const previous = currentIndex > 0
      ? monthlyData[currentIndex - 1]
      : null;

    const currentExpenses = Number(current?.expenses || 0);
    const previousExpenses = Number(previous?.expenses || 0);
    const currentIncome = Number(current?.income || 0);

    const currentDailySpend =
      currentExpenses / Math.max(currentDate.getDate(), 1);

    const previousMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    const previousDailySpend =
      previousExpenses / previousMonthDate.getDate();

    const dailyDifference = currentDailySpend - previousDailySpend;

    const spendingChange = previousDailySpend > 0
      ? (dailyDifference / previousDailySpend) * 100
      : null;

    const savings = currentIncome - currentExpenses;

    const highestCategory = [...categoryData].sort(
      (a, b) => Number(b.amount) - Number(a.amount)
    )[0];

    const recommendations = [];

    if (currentExpenses === 0 && currentIncome === 0) {
      recommendations.push({
        icon: Lightbulb,
        type: "info",
        title: "Start tracking your finances",
        message:
          "Add your income and expenses to receive useful insights about your financial habits."
      });
    } else {
      if (savings < 0) {
        recommendations.push({
          icon: AlertTriangle,
          type: "warning",
          title: "Expenses are higher than income",
          message:
            "Your expenses are exceeding your income this month. Review non-essential spending and try to reduce it."
        });
      } else if (currentIncome > 0 && savings > 0) {
        recommendations.push({
          icon: CircleCheck,
          type: "success",
          title: "You're maintaining positive savings",
          message:
            `You have saved ${formatCurrency(savings)} from this month's recorded income. Keep it up!`
        });
      }

      if (spendingChange !== null && spendingChange > 10) {
        recommendations.push({
          icon: TrendingUp,
          type: "warning",
          title: "Daily spending has increased",
          message:
            `Your average daily spending is ${spendingChange.toFixed(1)}% higher than last month. Review recent expenses.`
        });
      } else if (spendingChange !== null && spendingChange < -10) {
        recommendations.push({
          icon: TrendingDown,
          type: "success",
          title: "Your spending is improving",
          message:
            `Your average daily spending is ${Math.abs(spendingChange).toFixed(1)}% lower than last month. Keep maintaining this habit.`
        });
      }

      if (highestCategory) {
        recommendations.push({
          icon: Target,
          type: "info",
          title: "Review your top spending category",
          message:
            `${highestCategory.category_name} is your highest expense category this month, accounting for ${Number(highestCategory.percentage).toFixed(1)}% of your expenses.`
        });
      }

      if (recommendations.length === 0) {
        recommendations.push({
          icon: Lightbulb,
          type: "info",
          title: "Keep tracking your habits",
          message:
            "Continue recording transactions regularly to discover more spending patterns."
        });
      }
    }

    return {
      currentExpenses,
      currentIncome,
      previousExpenses,
      savings,
      spendingChange,
      highestCategory,
      recommendations
    };
  }, [monthlyData, categoryData, currentMonth, currentDate]);

  const chartData = monthlyData.map((item) => ({
    month: item.month_name,
    Income: Number(item.income),
    Expenses: Number(item.expenses)
  }));

  const hasFinancialData = summary &&
    (Number(summary.total_income) > 0 ||
      Number(summary.total_expenses) > 0);

  if (loading) {
    return (
      <div className="smart-insights-page">
        <div className="smart-insights-loading">
          <RefreshCw size={25} className="spin-icon" />
          <h3>Analyzing your finances...</h3>
          <p>Finding useful patterns in your transactions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smart-insights-page">
        <div className="smart-insights-error">
          <AlertTriangle size={28} />
          <h3>Insights unavailable</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-insights-page">
      <div className="smart-insights-heading">
        <div>
          <div className="smart-insights-eyebrow">
            <Sparkles size={15} /> PERSONAL FINANCE INTELLIGENCE
          </div>
          <h1>Smart Insights</h1>
          <p>
            Understand your money habits and discover ways to make smarter
            financial decisions.
          </p>
        </div>

        <div className="insights-period">
          <span>ANALYSIS PERIOD</span>
          <strong>{currentMonthLabel}</strong>
        </div>
      </div>

      {!hasFinancialData ? (
        <div className="smart-insights-empty">
          <BrainCircuit size={38} />
          <h2>Your financial insights are waiting</h2>
          <p>
            Start adding transactions to see spending patterns,
            monthly comparisons and personalized recommendations.
          </p>
        </div>
      ) : (
        <>
          <section className="insights-summary-grid">
            <div className="insights-summary-card">
              <div className="insights-summary-icon income-icon">
                <TrendingUp size={20} />
              </div>
              <span>Total Income</span>
              <h2>{formatCurrency(summary.total_income)}</h2>
              <p>All recorded income</p>
            </div>

            <div className="insights-summary-card">
              <div className="insights-summary-icon expense-icon">
                <TrendingDown size={20} />
              </div>
              <span>Total Expenses</span>
              <h2>{formatCurrency(summary.total_expenses)}</h2>
              <p>All recorded expenses</p>
            </div>

            <div className="insights-summary-card">
              <div className="insights-summary-icon savings-icon">
                <PiggyBank size={20} />
              </div>
              <span>Current Month Savings</span>
              <h2>{formatCurrency(insights.savings)}</h2>
              <p>Income minus expenses this month</p>
            </div>

            <div className="insights-summary-card">
              <div className="insights-summary-icon balance-icon">
                <Wallet size={20} />
              </div>
              <span>Available Balance</span>
              <h2>{formatCurrency(summary.balance)}</h2>
              <p>Overall recorded balance</p>
            </div>
          </section>

          <section className="insights-content-grid">
            <div className="insights-panel insights-trend-panel">
              <div className="insights-panel-heading">
                <div>
                  <h3>Income vs Expenses</h3>
                  <p>Your financial activity over the last six months</p>
                </div>
                <div className="panel-heading-icon">
                  <TrendingUp size={19} />
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="insights-chart">
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `₹${Number(value).toLocaleString("en-IN")}`
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar
                        dataKey="Income"
                        fill="#16a085"
                        radius={[5, 5, 0, 0]}
                      />
                      <Bar
                        dataKey="Expenses"
                        fill="#e67e72"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="insights-empty-text">
                  No monthly data available yet.
                </p>
              )}
            </div>

            <div className="insights-panel insights-comparison-panel">
              <div className="insights-panel-heading">
                <div>
                  <h3>Spending Comparison</h3>
                  <p>Daily spending compared with last month</p>
                </div>
                <div className="panel-heading-icon">
                  <BrainCircuit size={19} />
                </div>
              </div>

              {insights.spendingChange === null ? (
                <div className="comparison-empty">
                  <Lightbulb size={25} />
                  <p>
                    More previous-month expense data is needed
                    to calculate a spending comparison.
                  </p>
                </div>
              ) : (
                <>
                  <div className="comparison-value">
                    {insights.spendingChange > 0 ? (
                      <ArrowUpRight size={23} />
                    ) : (
                      <ArrowDownRight size={23} />
                    )}
                    <strong>
                      {Math.abs(insights.spendingChange).toFixed(1)}%
                    </strong>
                  </div>

                  <p>
                    {insights.spendingChange > 0
                      ? "Higher average daily spending than last month."
                      : insights.spendingChange < 0
                        ? "Lower average daily spending than last month."
                        : "Your average daily spending is unchanged."}
                  </p>

                  <div className="comparison-details">
                    <div>
                      <span>This month</span>
                      <strong>
                        {formatCurrency(
                          insights.currentExpenses /
                          Math.max(currentDate.getDate(), 1)
                        )}
                        <small> / day</small>
                      </strong>
                    </div>

                    <div>
                      <span>Last month</span>
                      <strong>
                        {formatCurrency(
                          insights.previousExpenses /
                          new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            0
                          ).getDate()
                        )}
                        <small> / day</small>
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="insights-content-grid">
            <div className="insights-panel category-insights-panel">
              <div className="insights-panel-heading">
                <div>
                  <h3>Top Spending Categories</h3>
                  <p>Where your money goes this month</p>
                </div>
                <div className="panel-heading-icon">
                  <Wallet size={19} />
                </div>
              </div>

              {categoryData.length === 0 ? (
                <p className="insights-empty-text">
                  No expense categories recorded this month.
                </p>
              ) : (
                <div className="category-insights-list">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div
                      className="category-insight-item"
                      key={category.category_name}
                    >
                      <div className="category-insight-top">
                        <span>
                          <strong>{index + 1}.</strong>{" "}
                          {category.category_name}
                        </span>
                        <strong>{formatCurrency(category.amount)}</strong>
                      </div>
                      <div className="category-insight-track">
                        <div
                          style={{
                            width: `${Math.min(
                              Number(category.percentage),
                              100
                            )}%`
                          }}
                        />
                      </div>
                      <span className="category-insight-percentage">
                        {Number(category.percentage).toFixed(1)}% of expenses
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="insights-panel recommendations-panel">
              <div className="insights-panel-heading">
                <div>
                  <h3>Personalized Recommendations</h3>
                  <p>Suggestions based on your financial activity</p>
                </div>
                <div className="panel-heading-icon">
                  <Lightbulb size={19} />
                </div>
              </div>

              <div className="recommendations-list">
                {insights.recommendations.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className={`recommendation-item recommendation-${item.type}`}
                      key={index}
                    >
                      <div className="recommendation-icon">
                        <Icon size={19} />
                      </div>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="insights-disclaimer">
            <BrainCircuit size={17} />
            <p>
              These insights are generated from your recorded transactions.
              They are informational suggestions, not financial advice.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SmartInsights;
