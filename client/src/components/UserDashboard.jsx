import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";
import api from "../api";

/* ── Shared utilities ── */
const StatusBadge = ({ status }) => {
  const map = {
    pending:       "dash-badge dash-badge-warning",
    accepted:      "dash-badge dash-badge-success",
    rejected:      "dash-badge dash-badge-danger",
    completed:     "dash-badge dash-badge-success",
    cancelled:     "dash-badge dash-badge-neutral",
    viewed:        "dash-badge dash-badge-info",
    info_requested:"dash-badge dash-badge-purple",
    contacted:     "dash-badge dash-badge-info",
  };
  return <span className={map[status] || "dash-badge dash-badge-warning"}>{status?.replace(/_/g, " ")}</span>;
};

const Spinner = () => (
  <div className="dash-spinner-wrap">
    <div className="dash-spinner" />
    <p className="dash-spinner-text">Loading…</p>
  </div>
);

const EmptyState = ({ icon, title, message, link, linkText }) => (
  <div className="dash-empty">
    <div className="dash-empty-icon">{icon}</div>
    <h4 className="dash-empty-title">{title}</h4>
    <p className="dash-empty-text">{message}</p>
    {link && <Link to={link} className="ll-btn ll-btn-primary">{linkText}</Link>}
  </div>
);

/* ── Sub-pages ── */
const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/users/dashboard").then((res) => setStats(res.data)).catch(() => toast.error("Failed to load dashboard.")).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Inquiries",  value: stats.stats.totalInquiries, icon: "📩", color: "var(--ll-primary)",  bg: "var(--ll-primary-light)" },
    { label: "Quote Requests",   value: stats.stats.totalQuotes,    icon: "📋", color: "#7C3AED",            bg: "#FAF5FF" },
    { label: "Reviews Written",  value: stats.stats.totalReviews,   icon: "⭐", color: "var(--ll-warning)",  bg: "var(--ll-warning-bg)" },
    { label: "Saved Vendors",    value: stats.stats.savedVendors,   icon: "🔖", color: "var(--ll-success)",  bg: "var(--ll-success-bg)" },
  ] : [];

  if (loading) return <Spinner />;
  return (
    <div>
      <h2 className="dash-page-title">Welcome back, {user?.fullName || user?.username}! 👋</h2>
      <p className="dash-page-subtitle">Here's an overview of your LiftLink activity.</p>

      <div className="dash-stats-grid">
        {statCards.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="dash-stat-card" style={{ "--stat-accent": color }}>
            <div className="dash-stat-icon" style={{ background: bg }}>{icon}</div>
            <div className="dash-stat-value" style={{ color }}>{value}</div>
            <div className="dash-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {stats?.recentQuotes?.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h4 className="dash-card-title">Recent Quote Requests</h4>
          </div>
          <div className="dash-card-body">
            {stats.recentQuotes.map((q) => (
              <div key={q._id} className="dash-list-item">
                <div>
                  <p style={{ fontWeight: 600, color: "var(--ll-text-1)", margin: "0 0 3px", fontSize: "0.9rem" }}>{q.vendorId?.companyName || "Vendor"}</p>
                  <p style={{ color: "var(--ll-text-3)", margin: 0, fontSize: "0.8rem" }}>{q.liftType}</p>
                </div>
                <StatusBadge status={q.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.savedVendors?.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h4 className="dash-card-title">Saved Vendors</h4>
            <Link to="/userDashboard/saved" className="dash-card-link">View all →</Link>
          </div>
          <div className="dash-card-body">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {stats.savedVendors.slice(0, 4).map((v) => (
                <Link key={v._id} to={`/vendor/${v._id}`} className="dash-vendor-chip">
                  <div className="dash-vendor-chip-icon">🏢</div>
                  <span className="dash-vendor-chip-name">{v.companyName}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/quotes/user").then((res) => setQuotes(res.data.quotes)).catch(() => toast.error("Failed to load quotes.")).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.patch(`/api/quotes/${id}/cancel`);
      setQuotes((prev) => prev.map((q) => q._id === id ? { ...q, status: "cancelled" } : q));
      toast.success("Quote cancelled.");
    } catch (err) { toast.error(err.response?.data?.message || "Cannot cancel."); }
  };

  if (loading) return <Spinner />;
  return (
    <div>
      <h2 className="dash-page-title">My Quote Requests</h2>
      {quotes.length === 0 ? (
        <EmptyState icon="📋" title="No Quotes Yet" message="Request a quotation from a vendor's profile page." />
      ) : (
        quotes.map((q) => (
          <div key={q._id} className="dash-card">
            <div className="dash-card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <p style={{ fontWeight: 700, color: "var(--ll-text-1)", margin: 0, fontSize: "1rem" }}>{q.vendorId?.companyName || "Vendor"}</p>
                    <StatusBadge status={q.status} />
                  </div>
                  <p style={{ color: "var(--ll-text-2)", margin: "0 0 4px", fontSize: "0.875rem" }}>🏗️ {q.liftType}{q.buildingType && ` · ${q.buildingType}`}{q.floors && ` · ${q.floors} floors`}</p>
                  <p style={{ color: "var(--ll-text-3)", margin: 0, fontSize: "0.8rem" }}>{new Date(q.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  {q.vendorResponse && (
                    <div style={{ marginTop: "12px", background: "var(--ll-success-bg)", border: "1px solid var(--ll-success-border)", borderRadius: "10px", padding: "14px" }}>
                      <p style={{ color: "var(--ll-success)", fontWeight: 700, fontSize: "0.8rem", margin: "0 0 4px" }}>Vendor Response:</p>
                      <p style={{ color: "var(--ll-text-1)", margin: 0, fontSize: "0.875rem" }}>{q.vendorResponse}</p>
                      {q.quotedAmount && <p style={{ color: "var(--ll-success)", fontWeight: 700, margin: "8px 0 0" }}>💰 Quoted: {q.quotedAmount}</p>}
                    </div>
                  )}
                </div>
                {["pending", "viewed", "info_requested"].includes(q.status) && (
                  <button onClick={() => handleCancel(q._id)} className="dash-action-btn dash-action-reject" style={{ flexShrink: 0 }}>Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const MyInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;
    api.get("/api/users/dashboard").then((res) => setInquiries(res.data.recentInquiries || [])).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;
  return (
    <div>
      <h2 className="dash-page-title">My Inquiries</h2>
      {inquiries.length === 0 ? (
        <EmptyState icon="📩" title="No Inquiries" message="Send an inquiry from a vendor's profile page." />
      ) : (
        inquiries.map((inq) => (
          <div key={inq._id} className="dash-card">
            <div className="dash-card-body">
              <p style={{ fontWeight: 700, color: "var(--ll-text-1)", marginBottom: "4px" }}>To: {inq.vendorId?.companyName || "Vendor"}</p>
              <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem", fontStyle: "italic", marginBottom: "6px" }}>"{inq.message}"</p>
              <p style={{ color: "var(--ll-text-3)", fontSize: "0.75rem", margin: 0 }}>{new Date(inq.date).toLocaleDateString("en-IN")}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const SavedVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/users/saved-vendors").then((res) => setVendors(res.data)).catch(() => toast.error("Failed to load saved vendors.")).finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (vendorId) => {
    try {
      await api.post(`/api/users/save-vendor/${vendorId}`);
      setVendors((prev) => prev.filter((v) => v._id !== vendorId));
      toast.success("Vendor removed from saved.");
    } catch {}
  };

  if (loading) return <Spinner />;
  return (
    <div>
      <h2 className="dash-page-title">Saved Vendors</h2>
      {vendors.length === 0 ? (
        <EmptyState icon="🔖" title="No Saved Vendors" message="Save vendors from the Explore page or vendor profiles." link="/Explore" linkText="Browse Vendors" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {vendors.map((v) => (
            <div key={v._id} className="dash-saved-card">
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "10px", background: "var(--ll-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>🏢</div>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--ll-text-1)", margin: "0 0 2px" }}>{v.companyName}</p>
                  <p style={{ color: "var(--ll-text-3)", margin: 0, fontSize: "0.8rem" }}>📍 {v.location || "—"}</p>
                </div>
              </div>
              {v.averageRating > 0 && (
                <p style={{ color: "var(--ll-warning)", fontSize: "0.8rem", marginBottom: "14px" }}>
                  {"★".repeat(Math.round(v.averageRating))} <span style={{ color: "var(--ll-text-2)" }}>{v.averageRating}/5</span>
                </p>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <Link to={`/vendor/${v._id}`} className="dash-action-btn dash-action-info" style={{ flex: 1, justifyContent: "center", padding: "8px" }}>View Profile</Link>
                <button onClick={() => handleUnsave(v._id)} className="dash-action-btn dash-action-reject">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditProfile = () => {
  const { user, loginUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || "", username: user?.username || "", mobile: user?.mobile || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put("/api/users/profile", form);
      loginUser({ ...user, ...res.data.user });
      toast.success("Profile updated!");
    } catch (err) { toast.error(err.response?.data?.message || "Update failed."); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Passwords do not match."); return; }
    if (pwForm.newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setSavingPw(true);
    try {
      await api.put("/api/users/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed to change password."); }
    finally { setSavingPw(false); }
  };

  return (
    <div style={{ maxWidth: "560px" }}>
      <h2 className="dash-page-title">Edit Profile</h2>

      <div className="dash-card">
        <div className="dash-card-header">
          <h4 className="dash-card-title">Personal Information</h4>
        </div>
        <div className="dash-card-body">
          <p style={{ color: "var(--ll-text-3)", fontSize: "0.8rem", marginBottom: "16px" }}>📧 {user?.email}</p>
          <form onSubmit={handleProfileSave}>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="ep-fullname">Full Name</label>
              <input id="ep-fullname" className="ll-input" type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="ep-username">Username</label>
              <input id="ep-username" className="ll-input" type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="ep-mobile">Mobile</label>
              <input id="ep-mobile" className="ll-input" type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <button type="submit" className="ll-btn ll-btn-primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save Changes"}</button>
          </form>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h4 className="dash-card-title">Change Password</h4>
        </div>
        <div className="dash-card-body">
          <form onSubmit={handlePasswordChange}>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="pw-curr">Current Password</label>
              <input id="pw-curr" className="ll-input" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="pw-new">New Password</label>
              <input id="pw-new" className="ll-input" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            </div>
            <div className="ll-form-group">
              <label className="ll-label" htmlFor="pw-confirm">Confirm New Password</label>
              <input id="pw-confirm" className="ll-input" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="ll-btn ll-btn-secondary" disabled={savingPw}>{savingPw ? "Changing…" : "Change Password"}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Main Dashboard Shell ── */
const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isUser, logout } = useAuth();

  useEffect(() => { if (!isUser) navigate("/login"); }, [isUser, navigate]);
  if (!isUser) return null;

  const navLinks = [
    { to: "/userDashboard",            label: "Overview",      icon: "📊", exact: true },
    { to: "/userDashboard/quotes",     label: "My Quotes",     icon: "📋" },
    { to: "/userDashboard/inquiries",  label: "My Inquiries",  icon: "📩" },
    { to: "/userDashboard/saved",      label: "Saved Vendors", icon: "🔖" },
    { to: "/userDashboard/profile",    label: "Edit Profile",  icon: "✏️" },
  ];

  const displayName = user?.fullName || user?.username || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <nav className="dash-sidebar">
        {/* User Profile */}
        <div className="dash-sidebar-profile">
          <div className="dash-sidebar-avatar">{initials}</div>
          <p className="dash-sidebar-name">{displayName}</p>
          <p className="dash-sidebar-email">{user?.email}</p>
        </div>

        {/* Nav */}
        <ul className="dash-nav">
          {navLinks.map(({ to, label, icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname === to || (to !== "/userDashboard" && location.pathname.startsWith(to));
            return (
              <li key={to}>
                <Link to={to} className={`dash-nav-link${active ? " active" : ""}`}>
                  <span className="dash-nav-icon">{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom Actions */}
        <div className="dash-sidebar-bottom">
          <Link to="/Explore" className="dash-bottom-link">🔍 Explore Vendors</Link>
          <button onClick={() => { logout(); navigate("/"); }} className="dash-logout-btn">🚪 Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dash-main">
        <Routes>
          <Route index element={<DashboardHome user={user} />} />
          <Route path="quotes" element={<MyQuotes />} />
          <Route path="inquiries" element={<MyInquiries />} />
          <Route path="saved" element={<SavedVendors />} />
          <Route path="profile" element={<EditProfile />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserDashboard;
