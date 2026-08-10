import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const VendorRegister = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState({
    fullname: "", mobile: "", email: "", password: "",
    businessname: "", businesstype: "", compregno: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setVendorData({ ...vendorData, [e.target.name]: e.target.value });

  const handleVendorRegister = async (e) => {
    e.preventDefault();
    const { fullname, mobile, email, password, businessname, businesstype } = vendorData;
    if (!fullname || !mobile || !email || !password || !businessname || !businesstype) {
      toast.error("All required fields must be filled."); return;
    }
    setLoading(true);
    try {
      const requestData = {
        fullname,
        mobile,
        email,
        password,
        companyName: vendorData.businessname,
        companyType: vendorData.businesstype,
        companyRegistrationNumber: vendorData.compregno,
      };
      await api.post("/api/vendor/auth/register", requestData);
      toast.success("Registration successful! Please wait for admin approval.");
      navigate("/loginvendor");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const businessTypes = [
    "Elevator Service Provider",
    "Manufacturer",
    "Contractor",
    "Maintenance Company",
    "Modernization Specialist",
  ];

  return (
    <div className="ll-auth-page">
      <div className="ll-auth-left">
        <div className="ll-auth-left-content">
          <Link to="/" className="ll-auth-brand">
            <span className="ll-auth-brand-icon">🛗</span>
            LiftLink
          </Link>
          <h2>List your business on LiftLink</h2>
          <p>Reach thousands of potential clients looking for elevator services across India.</p>
          <ul className="ll-auth-features">
            <li><span className="ll-check">✓</span> Free business profile</li>
            <li><span className="ll-check">✓</span> Receive direct quote requests</li>
            <li><span className="ll-check">✓</span> Showcase your portfolio</li>
            <li><span className="ll-check">✓</span> Build your online reputation</li>
          </ul>
        </div>
      </div>

      <div className="ll-auth-right" style={{ alignItems: "flex-start", paddingTop: "40px" }}>
        <div className="ll-auth-form-box">
          <div className="ll-auth-form-header">
            <h1>Register your business</h1>
            <p>Create a vendor account — it's free</p>
          </div>

          <form onSubmit={handleVendorRegister}>
            {/* Owner Info */}
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ll-text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>Owner Information</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="ll-form-group" style={{ marginBottom: 0 }}>
                <label className="ll-label" htmlFor="vr-fullname">Full Name *</label>
                <input id="vr-fullname" name="fullname" className="ll-input" type="text" placeholder="Your name" value={vendorData.fullname} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="ll-form-group" style={{ marginBottom: 0 }}>
                <label className="ll-label" htmlFor="vr-mobile">Mobile *</label>
                <input id="vr-mobile" name="mobile" className="ll-input" type="tel" placeholder="9876543210" value={vendorData.mobile} onChange={handleChange} required disabled={loading} />
              </div>
            </div>

            <div className="ll-form-group" style={{ marginTop: "14px" }}>
              <label className="ll-label" htmlFor="vr-email">Business Email *</label>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">📧</span>
                <input id="vr-email" name="email" className="ll-input" type="email" placeholder="business@company.com" value={vendorData.email} onChange={handleChange} required disabled={loading} />
              </div>
            </div>

            <div className="ll-form-group">
              <label className="ll-label" htmlFor="vr-password">Password *</label>
              <div className="ll-input-wrapper">
                <span className="ll-input-icon">🔒</span>
                <input id="vr-password" name="password" className="ll-input" style={{ paddingRight: "2.75rem" }} type={showPw ? "text" : "password"} placeholder="Create a strong password" value={vendorData.password} onChange={handleChange} required disabled={loading} />
                <button type="button" className="ll-input-icon-right" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">{showPw ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {/* Business Info */}
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ll-text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px", marginTop: "8px" }}>Business Information</p>

            <div className="ll-form-group">
              <label className="ll-label" htmlFor="vr-bname">Company Name *</label>
              <input id="vr-bname" name="businessname" className="ll-input" type="text" placeholder="Your company name" value={vendorData.businessname} onChange={handleChange} required disabled={loading} />
            </div>

            <div className="ll-form-group">
              <label className="ll-label" htmlFor="vr-btype">Business Type *</label>
              <select id="vr-btype" name="businesstype" className="ll-select" value={vendorData.businesstype} onChange={handleChange} required disabled={loading}>
                <option value="">Select business type</option>
                {businessTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="ll-form-group">
              <label className="ll-label" htmlFor="vr-regno">Registration Number <span style={{ color: "var(--ll-text-3)", fontWeight: 400 }}>(optional)</span></label>
              <input id="vr-regno" name="compregno" className="ll-input" type="text" placeholder="Company registration number" value={vendorData.compregno} onChange={handleChange} disabled={loading} />
            </div>

            <button type="submit" className="ll-btn ll-btn-primary ll-btn-lg ll-btn-block" disabled={loading}>
              {loading ? "Registering…" : "Register business"}
            </button>

            <div className="ll-alert ll-alert-info" style={{ marginTop: "16px" }}>
              <span className="ll-alert-icon">ℹ️</span>
              <span>Your listing will be reviewed and approved within 24 hours.</span>
            </div>
          </form>

          <div className="ll-auth-form-footer">
            <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
              Already registered?{" "}<Link to="/loginvendor" className="ll-auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
