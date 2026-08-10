import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", fullName: "", mobile: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    const { username, fullName, mobile, email, password } = form;
    if (!username || !fullName || !mobile || !email || !password) { toast.error("All fields are required."); return; }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) { toast.error("Please enter a valid email address."); return; }
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile)) { toast.error("Mobile must start with 6–9 and be 10 digits."); return; }
    setLoading(true);
    try {
      await api.post("/api/users/signup", { username, fullName, mobile, email, password });
      setSignupSuccess(true);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed.");
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
          <h2>Your elevator search starts here</h2>
          <p>Join thousands of property owners and builders who use LiftLink to find trusted elevator vendors.</p>
          <ul className="ll-auth-features">
            <li><span className="ll-check">✓</span> Explore 500+ verified vendors</li>
            <li><span className="ll-check">✓</span> Request quotes in seconds</li>
            <li><span className="ll-check">✓</span> Compare prices & reviews</li>
            <li><span className="ll-check">✓</span> 100% free for users</li>
          </ul>
        </div>
      </div>

      <div className="ll-auth-right">
        <div className="ll-auth-form-box">
          {!signupSuccess ? (
            <>
              <div className="ll-auth-form-header">
                <h1>Create your account</h1>
                <p>Get started with LiftLink in under a minute</p>
              </div>

              <form onSubmit={handleSignup}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="ll-form-group" style={{ marginBottom: 0 }}>
                    <label className="ll-label" htmlFor="su-username">Username</label>
                    <input id="su-username" name="username" className="ll-input" type="text" placeholder="johndoe" value={form.username} onChange={handleChange} required disabled={loading} />
                  </div>
                  <div className="ll-form-group" style={{ marginBottom: 0 }}>
                    <label className="ll-label" htmlFor="su-fullname">Full Name</label>
                    <input id="su-fullname" name="fullName" className="ll-input" type="text" placeholder="John Doe" value={form.fullName} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>

                <div className="ll-form-group" style={{ marginTop: "16px" }}>
                  <label className="ll-label" htmlFor="su-mobile">Mobile Number</label>
                  <div className="ll-input-wrapper">
                    <span className="ll-input-icon">📱</span>
                    <input id="su-mobile" name="mobile" className="ll-input" type="tel" placeholder="9876543210" value={form.mobile} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>

                <div className="ll-form-group">
                  <label className="ll-label" htmlFor="su-email">Email address</label>
                  <div className="ll-input-wrapper">
                    <span className="ll-input-icon">📧</span>
                    <input id="su-email" name="email" className="ll-input" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>

                <div className="ll-form-group">
                  <label className="ll-label" htmlFor="su-password">Password</label>
                  <div className="ll-input-wrapper">
                    <span className="ll-input-icon">🔒</span>
                    <input id="su-password" name="password" className="ll-input" style={{ paddingRight: "2.75rem" }} type={showPw ? "text" : "password"} placeholder="Create a strong password" value={form.password} onChange={handleChange} required disabled={loading} />
                    <button type="button" className="ll-input-icon-right" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">{showPw ? "🙈" : "👁️"}</button>
                  </div>
                </div>

                <button type="submit" className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block" disabled={loading}>
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>

              <div className="ll-auth-form-footer">
                <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
                  Already have an account?{" "}<Link to="/login" className="ll-auth-link">Sign in</Link>
                </p>
                <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
                  Registering a business?{" "}<Link to="/vendor_register" className="ll-auth-link">Vendor sign up</Link>
                </p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px", color: "var(--ll-text-1)" }}>Account created!</h2>
              <p style={{ color: "var(--ll-text-2)", marginBottom: "24px" }}>You're all set. Sign in to explore vendors.</p>
              <button onClick={() => navigate("/login")} className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block">Go to Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
