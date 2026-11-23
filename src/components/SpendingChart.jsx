
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const formatAmount = (value) => `₹${value / 1000}k`;

export default function SpendingChart({ data = [] }) {
  return (
    <div className="chart-card">
      <div className="section-heading">
        <div>
          <h3>Cash Flow Overview</h3>
          <p>Track your income and expenses over time</p>
        </div>

        <span className="chart-select">Last 6 months</span>
      </div>

      <div className="chart-legend">
        <span><i className="legend-dot income-dot" /> Income</span>
        <span><i className="legend-dot expense-dot" /> Expenses</span>
      </div>

      <div className="chart-container">
        {data.length === 0 ? (
          <p>No cash flow data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 5" stroke="#E9EEF2" vertical={false} />

              <XAxis
                dataKey="month_name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                tickFormatter={formatAmount}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                width={48}
              />

              <Tooltip
                formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E9EEF2",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)"
                }}
              />

              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
              />

              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#F59E0B"
                strokeWidth={2.5}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
