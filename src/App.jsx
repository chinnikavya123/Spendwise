
import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import { useAuth } from "./context/useAuth";

import "./App.css";

const pageNames = {
  "/": "Overview",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
  "/budgets": "Budgets",
  "/goals": "Savings Goals",
  "/reports": "Reports",
  "/smart-insights": "Smart Insights",
  "/settings": "Settings"
};

function ComingSoon({ title }) {
  return (
    <div className="coming-soon">
      <div className="coming-icon">✦</div>
      <h2>{title}</h2>
      <p>
        We're building something useful here.
        Stay tuned for upcoming features!
      </p>
    </div>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const { isAuthenticated, loading } = useAuth();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Checking your session...</p>
      </div>
    );
  }

  if (isAuthPage) {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return location.pathname === "/login" ? <Login /> : <Signup />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const activePage = pageNames[location.pathname] || "Overview";

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <main className="main-content">
        <Header activePage={activePage} />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />

            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
            <Route
              path="/smart-insights"
              element={<ComingSoon title="Smart Insights" />}
            />

            <Route
              path="/settings"
              element={<ComingSoon title="Settings" />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <footer className="app-footer">
            <span>© 2026 SpendWise. Made for smarter money decisions.</span>
            <span>Privacy first · Your finances, your control</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
