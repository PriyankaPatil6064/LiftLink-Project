import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post(`/api/users/reset-password/${token}`, { password });
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is invalid or expired.");
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
          <h2>Set a new password</h2>
          <p>Choose a strong, unique password to keep your account secure.</p>
          <ul className="ll-auth-features">
            <li><span className="ll-check">✓</span> At least 6 characters</li>
            <li><span className="ll-check">✓</span> Mix of letters & numbers recommended</li>
            <li><span className="ll-check">✓</span> You'll be logged in after reset</li>
          </ul>
        </div>
      </div>

      <div className="ll-auth-right">
        <div className="ll-auth-form-box">
          {!done ? (
            <>
              <div className="ll-auth-form-header">
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔐</div>
                <h1>Reset password</h1>
                <p>Enter and confirm your new password below</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="ll-form-group">
                  <label className="ll-label" htmlFor="rp-password">New password</label>
                  <div className="ll-input-wrapper">
                    <span className="ll-input-icon">🔒</span>
                    <input
                      id="rp-password"
                      className="ll-input"
                      style={{ paddingRight: "2.75rem" }}
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button type="button" className="ll-input-icon-right" onClick={() => setShowPw(!showPw)} aria-label="Toggle">{showPw ? "🙈" : "👁️"}</button>
                  </div>
                </div>

                <div className="ll-form-group">
                  <label className="ll-label" htmlFor="rp-confirm">Confirm new password</label>
                  <div className="ll-input-wrapper">
                    <span className="ll-input-icon">🔒</span>
                    <input
                      id="rp-confirm"
                      className="ll-input"
                      type={showPw ? "text" : "password"}
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block" disabled={loading}>
                  {loading ? "Resetting…" : "Reset password"}
                </button>
              </form>

              <div className="ll-auth-form-footer">
                <Link to="/login" className="ll-auth-link">← Back to login</Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>✅</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px", color: "var(--ll-text-1)" }}>Password changed!</h2>
              <p style={{ color: "var(--ll-text-2)", marginBottom: "24px" }}>Redirecting you to login in a moment…</p>
              <button onClick={() => navigate("/login")} className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block">Go to Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
