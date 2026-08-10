import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/users/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email.");
    } finally { setLoading(false); }
  };

  return (
    <div className="ll-auth-page">
      <div className="ll-auth-left">
        <div className="ll-auth-left-content">
          <Link to="/" className="ll-auth-brand">
            <span className="ll-auth-brand-icon">🛗</span>
            LiftLink
          </Link>
          <h2>Account recovery</h2>
          <p>Don't worry — it happens to everyone. We'll send you a secure link to reset your password.</p>
          <ul className="ll-auth-features">
            <li><span className="ll-check">✓</span> Secure reset link via email</li>
            <li><span className="ll-check">✓</span> Link expires in 1 hour</li>
            <li><span className="ll-check">✓</span> Your data stays safe</li>
          </ul>
        </div>
      </div>

      <div className="ll-auth-right">
        <div className="ll-auth-form-box">
          {!sent ? (
            <>
              <div className="ll-auth-form-header">
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔑</div>
                <h1>Forgot password?</h1>
                <p>Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="ll-form-group">
                  <label className="ll-label" htmlFor="fp-email">Email address</label>
                  <div className="ll-input-wrapper">
                    <span className="ll-input-icon">📧</span>
                    <input
                      id="fp-email"
                      className="ll-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <div className="ll-auth-form-footer">
                <Link to="/login" className="ll-auth-link">← Back to login</Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>📬</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px", color: "var(--ll-text-1)" }}>Check your inbox</h2>
              <p style={{ color: "var(--ll-text-2)", marginBottom: "8px" }}>
                We sent a reset link to <strong style={{ color: "var(--ll-text-1)" }}>{email}</strong>
              </p>
              <p style={{ color: "var(--ll-text-3)", fontSize: "0.875rem", marginBottom: "32px" }}>
                Didn't get it? Check your spam folder.
              </p>
              <div className="ll-alert ll-alert-success">
                <span className="ll-alert-icon">✅</span>
                <span>The link expires in 1 hour for security.</span>
              </div>
              <div className="ll-auth-form-footer" style={{ marginTop: "24px" }}>
                <Link to="/login" className="ll-auth-link">← Back to login</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
