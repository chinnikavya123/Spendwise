
import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./App.css";

const pageNames = {
  "/": "Overview",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
  "/budgets": "Budgets",
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

  const activePage = pageNames[location.pathname] || "Overview";

  if (location.pathname === "/login") {
    return <Login />;
  }

  if (location.pathname === "/signup") {
    return <Signup />;
  }

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

            <Route
              path="/budgets"
              element={<ComingSoon title="Budgets" />}
            />

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
