
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut
} from "lucide-react";

import { useAuth } from "../context/useAuth";

export default function Header({ activePage }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userName = user?.name || "User";

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="breadcrumb">
          <span>Workspace</span>
          <span>/</span>
          <strong>{activePage}</strong>
        </div>
        <div className="mobile-brand">SpendWise</div>
      </div>

      <div className="header-actions">
        <button className="header-icon search-button" title="Search">
          <Search size={19} />
        </button>

        <button className="header-icon notification-button" title="Notifications">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <div className="profile-menu-wrapper">
          <button
            className="profile-button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
          >
            <div className="avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>{userName}</strong>
              <span>Personal Account</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-info">
                <strong>{userName}</strong>
                <span>{user?.email}</span>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
