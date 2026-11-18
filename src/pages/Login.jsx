
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wallet, ArrowRight, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const successMessage = location.state?.message;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-form-panel">
        <Link to="/login" className="auth-brand">
          <span className="auth-brand-icon">
            <Wallet size={22} />
          </span>
          <span>SpendWise</span>
        </Link>

        <div className="auth-form-wrapper">
          <div className="auth-heading">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h1>Sign in to your account</h1>
            <p>Take control of your finances, one step at a time.</p>
          </div>

          {successMessage && (
            <div className="auth-success-message">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
              </div>

              <div className="auth-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch-text">
            Don't have an account? <Link to="/signup">Create an account</Link>
          </p>

          <div className="auth-security-note">
            <ShieldCheck size={16} />
            Your financial information is protected and secure.
          </div>
        </div>

        <p className="auth-copyright">
          © 2026 SpendWise. All rights reserved.
        </p>
      </section>

      <aside className="auth-visual-panel">
        <div className="auth-visual-content">
          <div className="auth-visual-tag">
            <span />
            YOUR FINANCIAL SPACE
          </div>

          <h2>
            Make smarter
            <br />
            money moves.
          </h2>

          <p>
            Track your spending, manage your budgets, and build better
            financial habits — all in one place.
          </p>

          <div className="auth-visual-card">
            <div className="auth-visual-card-top">
              <span>YOUR FINANCIAL OVERVIEW</span>
              <Wallet size={19} />
            </div>

            <div className="auth-visual-balance">
              <span>Manage with confidence</span>
              <strong>Every rupee counts.</strong>
            </div>

            <div className="auth-visual-bars">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="auth-visual-card-footer">
              <span>Track your progress</span>
              <span>Build your future</span>
            </div>
          </div>

          <div className="auth-visual-footer">
            <ShieldCheck size={17} />
            Your finances. Your control.
          </div>
        </div>
      </aside>
    </div>
  );
}
