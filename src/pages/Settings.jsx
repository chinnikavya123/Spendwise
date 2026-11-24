
import { useState } from "react";
import {
  UserRound,
  ShieldCheck,
  CalendarDays,
  Save,
  LockKeyhole
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import api from "../services/api";

export default function Settings() {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPassword((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!profile.name.trim() || !profile.email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }

    try {
      setProfileLoading(true);

      const response = await updateProfile(
        profile.name.trim(),
        profile.email.trim()
      );

      setProfile(response.user);

      setProfileMessage("Your profile has been updated successfully.");
    } catch (error) {
      setProfileError(
        error.response?.data?.message ||
        "Unable to update your profile. Please try again."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await api.put("/auth/change-password", password);

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setPasswordMessage(response.data.message);
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
        "Unable to change your password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not available";

    const dateString = String(value).slice(0, 10);
    const [year, month, day] = dateString.split("-").map(Number);

    if (!year || !month || !day) return "Not available";

    return new Date(year, month - 1, day).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );
  };

  return (
    <div className="settings-page">
      <div className="settings-page-heading">
        <div>
          <h2>Account Settings</h2>
          <p>Manage your personal information and account security.</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-main">

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-section-icon">
                <UserRound size={20} />
              </div>

              <div>
                <h3>Profile Information</h3>
                <p>Update your personal account details.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="settings-form-grid">
                <label className="transaction-form-label">
                  Full Name
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your name"
                    maxLength={100}
                    required
                  />
                </label>

                <label className="transaction-form-label">
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    maxLength={150}
                    required
                  />
                </label>
              </div>

              {profileError && (
                <div className="settings-alert settings-alert-error">
                  {profileError}
                </div>
              )}

              {profileMessage && (
                <div className="settings-alert settings-alert-success">
                  {profileMessage}
                </div>
              )}

              <div className="settings-form-actions">
                <button
                  type="submit"
                  className="settings-save-button"
                  disabled={profileLoading}
                >
                  <Save size={16} />
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-section-icon security-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3>Account Security</h3>
                <p>Keep your account secure with a strong password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="settings-password-fields">

                <label className="transaction-form-label">
                  Current Password
                  <input
                    type="password"
                    name="currentPassword"
                    value={password.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    required
                  />
                </label>

                <label className="transaction-form-label">
                  New Password
                  <input
                    type="password"
                    name="newPassword"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>

                <label className="transaction-form-label">
                  Confirm New Password
                  <input
                    type="password"
                    name="confirmPassword"
                    value={password.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
              </div>

              {passwordError && (
                <div className="settings-alert settings-alert-error">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="settings-alert settings-alert-success">
                  {passwordMessage}
                </div>
              )}

              <div className="settings-form-actions">
                <button
                  type="submit"
                  className="settings-save-button"
                  disabled={passwordLoading}
                >
                  <LockKeyhole size={16} />
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </section>

        </div>

        <aside className="settings-sidebar">
          <section className="settings-card account-card">
            <div className="settings-account-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>

            <h3>{user?.name || "User"}</h3>
            <p>{user?.email}</p>

            <div className="settings-account-divider" />

            <div className="settings-account-detail">
              <CalendarDays size={17} />
              <div>
                <span>Member Since</span>
                <strong>{formatDate(user?.created_at)}</strong>
              </div>
            </div>

            <div className="settings-account-detail">
              <ShieldCheck size={17} />
              <div>
                <span>Account Status</span>
                <strong className="settings-account-active">
                  Active
                </strong>
              </div>
            </div>
          </section>

          <section className="settings-privacy-card">
            <ShieldCheck size={22} />
            <h3>Your Privacy Matters</h3>
            <p>
              Your financial information is associated with your
              account and protected through authenticated access.
            </p>
          </section>
        </aside>

      </div>
    </div>
  );
}
