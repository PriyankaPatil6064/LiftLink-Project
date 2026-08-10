import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";

const LoginVendor = () => {
  const navigate = useNavigate();
  const { loginVendor } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("All fields are required."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/api/vendor/auth/login", { email, password });
      loginVendor({ ...data.vendor, token: data.token });
      toast.success("Welcome back!");
      navigate("/vendorDashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
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
          <h2>Grow your elevator business</h2>
          <p>Manage your profile, respond to inquiries, and close more deals through the LiftLink vendor dashboard.</p>
          <ul className="ll-auth-features">
            <li><span className="ll-check">✓</span> Receive verified quote requests</li>
            <li><span className="ll-check">✓</span> Business analytics dashboard</li>
            <li><span className="ll-check">✓</span> Manage reviews & reputation</li>
            <li><span className="ll-check">✓</span> Showcase portfolio & services</li>
          </ul>
        </div>
      </div>

      <div className="ll-auth-right">
        <div className="ll-auth-form-box">
          <div className="ll-auth-form-header">
            <h1>Vendor portal</h1>
            <p>Sign in to manage your business listing</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="vl-email">Business email</label>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">📧</span>
                <input id="vl-email" className="ll-input" type="email" placeholder="business@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>
            </div>

            <div className="ll-form-group">
              <label className="ll-label" htmlFor="vl-password">Password</label>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">🔒</span>
                <input id="vl-password" className="ll-input" style={{ paddingRight: "2.75rem" }} type={showPw ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                <button type="button" className="ll-input-icon-right" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">{showPw ? "🙈" : "👁️"}</button>
              </div>
            </div>

            <button type="submit" className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "Signing in…" : "Sign in to dashboard"}
            </button>
          </form>

          <div className="ll-auth-form-footer">
            <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
              New vendor?{" "}<Link to="/vendor_register" className="ll-auth-link">Register your business</Link>
            </p>
            <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
              Are you a user?{" "}<Link to="/login" className="ll-auth-link">User login</Link>
            </p>
            <Link to="/logsign" className="ll-auth-link" style={{ fontSize: "0.8rem" }}>← Back to options</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginVendor;