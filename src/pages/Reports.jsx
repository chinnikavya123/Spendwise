import { useEffect, useState } from "react";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet
} from "lucide-react";

import api from "../services/api";

const formatAmount = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

export default function Reports() {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    net_savings: 0,
    total_transactions: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);

        const response = await api.get("/reports/transactions");

        setSummary(response.data.summary || {
          total_income: 0,
          total_expenses: 0,
          net_savings: 0,
          total_transactions: 0
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load report summary."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const summaryCards = [
    {
      title: "Total Income",
      value: formatAmount(summary.total_income),
      icon: TrendingUp,
      color: "income"
    },
    {
      title: "Total Expenses",
      value: formatAmount(summary.total_expenses),
      icon: TrendingDown,
      color: "expense"
    },
    {
      title: "Net Savings",
      value: formatAmount(summary.net_savings),
      icon: Wallet,
      color: "savings"
    },
    {
      title: "Total Transactions",
      value: summary.total_transactions || 0,
      icon: FileText,
      color: "count"
    }
  ];

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <div>
          <h1>Reports</h1>
          <p>
            Review your financial activity and track your money.
          </p>
        </div>
      </div>

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      <div className="reports-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="reports-summary-card" key={card.title}>
              <div className={`reports-summary-icon ${card.color}`}>
                <Icon size={21} />
              </div>

              <div>
                <p>{card.title}</p>
                <h2>
                  {loading ? "Loading..." : card.value}
                </h2>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}