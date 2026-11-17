
import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header({ activePage }) {
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

        <button className="profile-button">
          <div className="avatar">K</div>
          <div className="profile-info">
            <strong>Kavya</strong>
            <span>Personal Account</span>
          </div>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
