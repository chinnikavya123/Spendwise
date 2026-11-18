
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wallet, ArrowRight, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/useAuth";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await register(name.trim(), email.trim(), password);

      navigate("/login", {
        replace: true,
        state: {
          message: response.message || "Account created successfully! Please sign in."
        }
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-form-panel">
        <Link to="/signup" className="auth-brand">
          <span className="auth-brand-icon">
            <Wallet size={22} />
          </span>
          <span>SpendWise</span>
        </Link>

        <div className="auth-form-wrapper">
          <div className="auth-heading">
            <span className="auth-eyebrow">GET STARTED</span>
            <h1>Create your account</h1>
            <p>Start your journey towards smarter money management.</p>
          </div>

          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-password-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
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

            <div className="auth-field">
              <label htmlFor="signup-confirm-password">Confirm password</label>
              <div className="auth-password-wrapper">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Sign in</Link>
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
            A BETTER FINANCIAL FUTURE
          </div>

          <h2>
            Your goals.
            <br />
            Your money.
            <br />
            Your future.
          </h2>

          <p>
            Understand your spending, set meaningful savings goals,
            and make every financial decision count.
          </p>

          <div className="auth-visual-card">
            <div className="auth-visual-card-top">
              <span>THE SMARTER WAY TO MANAGE MONEY</span>
              <Wallet size={19} />
            </div>

            <div className="auth-visual-balance">
              <span>Small steps lead to</span>
              <strong>Big financial goals.</strong>
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
              <span>Plan wisely</span>
              <span>Save consistently</span>
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
