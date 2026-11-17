
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

import { categoryData } from "../data/dashboardData";

export default function CategoryChart() {
  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card category-card">
      <div className="section-heading">
        <div>
          <h3>Expense Breakdown</h3>
          <p>Your spending by category</p>
        </div>
      </div>

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
              formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
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

            <strong>₹{item.value.toLocaleString("en-IN")}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
