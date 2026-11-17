
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PiggyBank,
  ArrowUpRight
} from "lucide-react";

const icons = {
  wallet: Wallet,
  "trending-up": TrendingUp,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank
};

export default function StatCard({ stat }) {
  const Icon = icons[stat.icon];

  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-title">{stat.title}</span>
        <div className={`stat-icon ${stat.color}`}>
          <Icon size={20} />
        </div>
      </div>

      <h2 className="stat-amount">
        ₹{stat.amount.toLocaleString("en-IN")}
      </h2>

      <div className="stat-footer">
        <span className="stat-change">
          <ArrowUpRight size={14} />
          {stat.change}
        </span>
        <span className="stat-description">{stat.description}</span>
      </div>
    </div>
  );
}
