import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("All fields are required."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/api/users/login", { email, password });
      loginUser({ ...data.user, token: data.token });
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="ll-auth-page">
      {/* Left Panel */}
      <div className="ll-auth-left">
        <div className="ll-auth-left-content">
          <Link to="/" className="ll-auth-brand">
            <span className="ll-auth-brand-icon">🛗</span>
            LiftLink
          </Link>
          <h2>Find the right elevator partner</h2>
          <p>Connect with verified elevator vendors across India. Compare, quote, and decide — all in one place.</p>
          <ul className="ll-auth-features">
            <li><span className="ll-check">✓</span> 500+ verified vendors</li>
            <li><span className="ll-check">✓</span> Instant quote requests</li>
            <li><span className="ll-check">✓</span> Trusted reviews</li>
            <li><span className="ll-check">✓</span> Free to use</li>
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div className="ll-auth-right">
        <div className="ll-auth-form-box">
          <div className="ll-auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your LiftLink account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="login-email">Email address</label>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">📧</span>
                <input
                  id="login-email"
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

            <div className="ll-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="ll-label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="ll-auth-link" style={{ fontSize: "0.8rem" }}>Forgot password?</Link>
              </div>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">🔒</span>
                <input
                  id="login-password"
                  className="ll-input"
                  style={{ paddingRight: "2.75rem" }}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button type="button" className="ll-input-icon-right" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="ll-auth-form-footer">
            <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
              Don't have an account?{" "}
              <Link to="/signup" className="ll-auth-link">Create account</Link>
            </p>
            <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
              Are you a vendor?{" "}
              <Link to="/loginvendor" className="ll-auth-link">Vendor login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
