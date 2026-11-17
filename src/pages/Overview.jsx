
import {
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Wallet,
  Car,
  Tv,
  ShoppingBasket,
  Sparkles,
  Plus,
  CalendarDays
} from "lucide-react";

import { dashboardStats, transactions, budgetData } from "../data/dashboardData";

import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import CategoryChart from "../components/CategoryChart";

const transactionIcons = {
  "shopping-basket": ShoppingBasket,
  wallet: Wallet,
  car: Car,
  tv: Tv,
  "shopping-bag": ShoppingBag
};

export default function Overview() {
  return (
    <div className="overview-page">
      <div className="welcome-section">
        <div>
          <div className="welcome-tag">
            <Sparkles size={14} /> YOUR FINANCIAL SPACE
          </div>
          <h1>Good evening, Kavya <span>✦</span></h1>
          <p>Here's what's happening with your money today.</p>
        </div>

        <button className="date-button">
          <CalendarDays size={17} />
          November 2026
        </button>
      </div>

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      <section className="charts-grid">
        <SpendingChart />
        <CategoryChart />
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
            {transactions.map((item) => {
              const Icon = transactionIcons[item.icon];

              return (
                <div className="transaction-row" key={item.id}>
                  <div className="transaction-icon">
                    <Icon size={19} />
                  </div>

                  <div className="transaction-details">
                    <strong>{item.title}</strong>
                    <span>{item.category} · {item.date}</span>
                  </div>

                  <strong className={`transaction-amount ${item.amount > 0 ? "positive" : ""}`}>
                    {item.amount > 0 ? "+" : "-"}₹{Math.abs(item.amount).toLocaleString("en-IN")}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <div className="insight-icon">
              <Sparkles size={19} />
            </div>
            <span>SMART INSIGHT</span>
          </div>

          <h3>You're building better habits!</h3>

          <p>
            Your expenses are 5.4% lower than last month.
            Keep tracking your spending to understand where
            you can save even more.
          </p>

          <div className="insight-highlight">
            <ArrowUpRight size={20} />
            <div>
              <strong>₹1,050</strong>
              <span>Illustrative reduction in spending</span>
            </div>
          </div>

          <button className="insight-button">
            Explore insights <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <section className="budget-section">
        <div className="section-heading">
          <div>
            <h3>Budget Progress</h3>
            <p>Keep your monthly spending on track</p>
          </div>
          <button className="text-button">
            Manage budgets <ArrowRight size={15} />
          </button>
        </div>

        <div className="budget-grid">
          {budgetData.map((budget) => {
            const percentage = Math.min(
              (budget.spent / budget.limit) * 100,
              100
            );

            return (
              <div className="budget-item" key={budget.name}>
                <div className="budget-top">
                  <strong>{budget.name}</strong>
                  <span>{Math.round(percentage)}%</span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="budget-amounts">
                  <strong>₹{budget.spent.toLocaleString("en-IN")}</strong>
                  <span>of ₹{budget.limit.toLocaleString("en-IN")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
