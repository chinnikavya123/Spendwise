
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

const categoryColors = {
  food: "#F59E0B",
  shopping: "#8B5CF6",
  transport: "#3B82F6",
  transportation: "#3B82F6",
  entertainment: "#EC4899",
  bills: "#14B8A6",
  healthcare: "#EF4444",
  health: "#EF4444",
  education: "#6366F1",
  groceries: "#84CC16",
  travel: "#06B6D4",
  others: "#94A3B8"
};

const fallbackColors = [
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#3B82F6",
  "#EC4899",
  "#14B8A6"
];

export default function CategoryChart({ data = [], loading, error }) {
  const categoryData = data.map((item, index) => ({
    name: item.category_name,
    value: Number(item.amount),
    color:
      categoryColors[item.category_name?.toLowerCase()] ||
      fallbackColors[index % fallbackColors.length]
  }));

  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card category-card">
      <div className="section-heading">
        <div>
          <h3>Expense Breakdown</h3>
          <p>Your spending by category</p>
        </div>
      </div>

      {loading ? (
        <p>Loading expense breakdown...</p>
      ) : error ? (
        <p>{error}</p>
      ) : categoryData.length === 0 ? (
        <p>No expense data available yet.</p>
      ) : (
        <>
          <div className="donut-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  stroke="none"
                >
                  {categoryData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-center">
              <span>Total spent</span>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div className="category-legend">
            {categoryData.map((item) => (
              <div className="category-row" key={item.name}>
                <span className="category-name">
                  <i style={{ background: item.color }} />
                  {item.name}
                </span>

                <strong>
                  ₹{item.value.toLocaleString("en-IN")}
                </strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
