import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/admin/login", form);
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminData", JSON.stringify(res.data.admin));
      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid admin credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--ll-bg)" }}>
      {/* Left — dark admin panel */}
      <div style={{
        width: "420px", flexShrink: 0,
        background: "var(--ll-nav)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 40px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 20% 30%, rgba(239,68,68,.15) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "1.125rem", marginBottom: "40px", justifyContent: "center" }}>
            <span style={{ width: 32, height: 32, background: "var(--ll-primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🛗</span>
            LiftLink
          </Link>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🛡️</div>
          <h2 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>Admin Portal</h2>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Restricted access. Authorised personnel only.
          </p>
          <ul style={{ listStyle: "none", marginTop: "32px", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}>
            {["Vendor approval & management", "User oversight", "Review moderation", "Platform analytics"].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,255,255,.75)", fontSize: "0.875rem", fontWeight: 500 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,.25)", color: "#F87171", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "var(--ll-text-1)", letterSpacing: "-0.02em", marginBottom: "8px" }}>Admin login</h1>
            <p style={{ color: "var(--ll-text-2)" }}>Enter your administrator credentials</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="al-email">Admin email</label>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">📧</span>
                <input
                  id="al-email"
                  className="ll-input"
                  type="email"
                  placeholder="admin@liftlink.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="ll-form-group">
              <label className="ll-label" htmlFor="al-password">Password</label>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">🔒</span>
                <input
                  id="al-password"
                  className="ll-input"
                  style={{ paddingRight: "2.75rem" }}
                  type={showPw ? "text" : "password"}
                  placeholder="Admin password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button type="button" className="ll-input-icon-right" onClick={() => setShowPw(!showPw)} aria-label="Toggle">{showPw ? "🙈" : "👁️"}</button>
              </div>
            </div>

            <button type="submit" className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "Authenticating…" : "Access Admin Panel"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link to="/" style={{ color: "var(--ll-text-3)", fontSize: "0.875rem", textDecoration: "none" }}>← Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
