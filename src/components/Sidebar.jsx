
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  FileText,
  Wallet,
  PiggyBank,
  BrainCircuit,
  Settings,
  CircleHelp,
  Sparkles,
  ChevronLeft
} from "lucide-react";

const navigation = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "Budgets", path: "/budgets", icon: Wallet },
  { name: "Savings Goals", path: "/goals", icon: PiggyBank },
  { name: "Smart Insights", path: "/smart-insights", icon: BrainCircuit }
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-icon">
          <Wallet size={22} />
        </div>

        {!collapsed && (
          <div className="brand-name">
            <h2>SpendWise</h2>
            <span>FINANCE INTELLIGENCE</span>
          </div>
        )}
      </div>

      <div className="sidebar-label">
        {!collapsed && "WORKSPACE"}
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              title={collapsed ? item.name : ""}
            >
              <Icon size={19} strokeWidth={1.8} />

              {!collapsed && <span>{item.name}</span>}

              {item.name === "Smart Insights" && !collapsed && (
                <span className="nav-new">AI</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Sparkles size={18} />
            </div>

            <h4>Smarter money habits</h4>
            <p>
              Small changes today can create a better financial future.
            </p>
          </div>
        )}

        <button className="nav-item">
          <CircleHelp size={19} />
          {!collapsed && <span>Help & Support</span>}
        </button>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Settings" : ""}
        >
          <Settings size={19} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button className="collapse-button" onClick={onToggle}>
          <ChevronLeft size={17} />
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
