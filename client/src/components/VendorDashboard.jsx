import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";
import api from "../api";
import ManageProfile from "./ManageProfile";
import ManageServices from "./ManageServices";
import ManageInquiries from "./ManageInquiries";
import ManageProjects from "./ManageProjects";



// ─── Analytics Home ───────────────────────────────────────────────────────────
const VendorHome = ({ vendor }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/vendor/dashboard/analytics")
      .then((res) => setAnalytics(res.data))
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dash-spinner-wrap">
        <div className="dash-spinner" />
        <p className="dash-spinner-text">Loading analytics…</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const statCards = [
    { icon: "👁️", label: "Profile Views", value: overview.profileViews || 0, color: "var(--ll-primary)", bg: "var(--ll-primary-light)" },
    { icon: "🤍", label: "Saved By", value: overview.savedBy || 0, color: "#7C3AED", bg: "#FAF5FF" },
    { icon: "⭐", label: "Avg Rating", value: overview.averageRating ? `${overview.averageRating}/5` : "—", color: "var(--ll-warning)", bg: "var(--ll-warning-bg)" },
    { icon: "💬", label: "Total Reviews", value: overview.totalReviews || 0, color: "var(--ll-success)", bg: "var(--ll-success-bg)" },
    { icon: "📩", label: "Inquiries", value: overview.totalInquiries || 0, color: "#0EA5E9", bg: "#F0F9FF" },
    { icon: "📋", label: "Quote Requests", value: overview.totalQuotes || 0, color: "#F97316", bg: "#FFF7ED" },
  ];

  return (
    <div>
      {/* Welcome */}
      <h2 className="dash-page-title">{vendor?.companyName || "Your Dashboard"} 🏢</h2>
      {!overview.isVerified && (
        <div className="dash-alert-warning">
          ⏳ Your profile is pending admin verification. Once approved, your listing will be visible to users.
        </div>
      )}
      {overview.isVerified && (
        <div className="dash-alert-success">✓ Verified Business</div>
      )}

      {/* Stats Grid */}
      <div className="dash-stats-grid" style={{ marginTop: "var(--ll-sp-8)" }}>
        {statCards.map(({ icon, label, value, color, bg }) => (
          <div key={label} className="dash-stat-card" style={{ "--stat-accent": color }}>
            <div className="dash-stat-icon" style={{ background: bg }}>{icon}</div>
            <div className="dash-stat-value" style={{ color }}>{value}</div>
            <div className="dash-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Quote Status Summary */}
      {analytics?.quoteStatusSummary?.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h4 className="dash-card-title">Quote Status Overview</h4>
          </div>
          <div className="dash-card-body">
            <div className="dash-chip-grid">
              {analytics.quoteStatusSummary.map(({ _id, count }) => (
                <div key={_id} className="dash-chip">
                  <div className="dash-chip-value">{count}</div>
                  <div className="dash-chip-label">{_id?.replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Inquiries */}
      {analytics?.recentInquiries?.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h4 className="dash-card-title">Recent Inquiries</h4>
            <Link to="/vendorDashboard/inquiries" className="dash-card-link">View all →</Link>
          </div>
          <div className="dash-card-body">
            {analytics.recentInquiries.map((inq) => (
              <div key={inq._id} className="dash-list-item">
                <div>
                  <p style={{ fontWeight: 600, color: "var(--ll-text-1)", margin: "0 0 2px", fontSize: "0.9rem" }}>{inq.userName}</p>
                  <p style={{ color: "var(--ll-text-3)", margin: 0, fontSize: "0.8rem" }}>{inq.message?.substring(0, 80)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h4 className="dash-card-title">Quick Actions</h4>
        </div>
        <div className="dash-card-body">
          <div className="dash-quick-grid">
            {[
              { to: "/vendorDashboard/profile", label: "✏️ Update Profile" },
              { to: "/vendorDashboard/projects", label: "🏗 Manage Projects" },
              { to: "/vendorDashboard/services", label: "🔧 Manage Services" },
              { to: "/vendorDashboard/inquiries", label: "📩 View Inquiries" },
              { to: "/vendorDashboard/quotes", label: "📋 Manage Quotes" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="dash-quick-link">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Manage Quotes (Vendor View) ──────────────────────────────────────────────
const ManageQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [responding, setResponding] = useState(null);
  const [responseForm, setResponseForm] = useState({ vendorResponse: "", quotedAmount: "" });

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/quotes/vendor?page=${page}${statusFilter ? `&status=${statusFilter}` : ""}`);
      setQuotes(res.data.quotes);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const handleStatus = async (id, status) => {
    setResponding(null);
    try {
      await api.patch(`/api/quotes/${id}/status`, { status, ...responseForm });
      toast.success(`Quote marked as ${status.replace(/_/g, " ")}`);
      setResponseForm({ vendorResponse: "", quotedAmount: "" });
      fetchQuotes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    }
  };

  const QuoteStatusBadge = ({ s }) => {
    const map = {
      pending: "dash-badge-warning", accepted: "dash-badge-success", rejected: "dash-badge-danger",
      completed: "dash-badge-success", cancelled: "dash-badge-neutral", viewed: "dash-badge-info",
      info_requested: "dash-badge-purple", contacted: "dash-badge-info",
    };
    return <span className={`dash-badge ${map[s] || "dash-badge-warning"}`}>{s?.replace(/_/g, " ")}</span>;
  };

  if (loading) return <div className="dash-spinner-wrap"><div className="dash-spinner" /><p className="dash-spinner-text">Loading…</p></div>;

  return (
    <div>
      <div className="dash-toolbar">
        <h2 className="dash-page-title" style={{ marginBottom: 0 }}>Quote Requests <span style={{ color: "var(--ll-text-3)", fontSize: "1rem", fontWeight: 400 }}>({total})</span></h2>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="dash-filter-select">
          <option value="">All Status</option>
          {["pending", "viewed", "accepted", "rejected", "info_requested", "contacted", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {quotes.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">📋</div>
          <p className="dash-empty-text">No quote requests yet. They'll appear here when users request quotations from your profile.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ll-sp-4)" }}>
          {quotes.map((q) => (
            <div key={q._id} className="dash-card">
              <div className="dash-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--ll-text-1)", fontSize: "1rem" }}>{q.userName}</span>
                      <QuoteStatusBadge s={q.status} />
                      <span style={{ color: "var(--ll-text-3)", fontSize: "0.75rem" }}>
                        {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <span className="dash-tag">🏗️ {q.liftType}</span>
                      {q.buildingType && <span className="dash-tag dash-tag-muted">{q.buildingType}</span>}
                      {q.floors && <span className="dash-tag dash-tag-muted">{q.floors} floors</span>}
                      {q.installationType && <span className="dash-tag dash-tag-muted">{q.installationType}</span>}
                    </div>
                    <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem", margin: "0 0 0.5rem" }}>{q.description}</p>
                    {q.budget && <p style={{ color: "var(--ll-text-3)", fontSize: "0.8rem", margin: "0 0 0.25rem" }}>💰 Budget: {q.budget}</p>}
                    {q.userPhone && <p style={{ color: "var(--ll-text-3)", fontSize: "0.8rem", margin: "0 0 0.25rem" }}>📞 {q.userPhone}</p>}
                    <p style={{ color: "var(--ll-text-3)", fontSize: "0.75rem", margin: 0 }}>✉️ {q.userEmail}</p>
                  </div>
                </div>

                {/* Response form */}
                {responding === q._id && (
                  <div className="dash-response-form">
                    <textarea placeholder="Your response to the client..." value={responseForm.vendorResponse} onChange={(e) => setResponseForm({ ...responseForm, vendorResponse: e.target.value })} rows={3} className="dash-response-input" style={{ resize: "vertical" }} />
                    <input type="text" placeholder="Quoted amount (optional, e.g. ₹5-8 Lakhs)" value={responseForm.quotedAmount} onChange={(e) => setResponseForm({ ...responseForm, quotedAmount: e.target.value })} className="dash-response-input" />
                  </div>
                )}

                {/* Actions */}
                {!["completed", "cancelled"].includes(q.status) && (
                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {q.status === "pending" && <button className="dash-action-btn dash-action-info" onClick={() => handleStatus(q._id, "viewed")}>👁️ Mark Viewed</button>}
                    <button className="dash-action-btn dash-action-approve" onClick={() => { setResponding(responding === q._id ? null : q._id); }}>💬 Respond</button>
                    {responding === q._id && (
                      <>
                        <button className="dash-action-btn dash-action-approve" onClick={() => handleStatus(q._id, "accepted")}>✓ Accept</button>
                        <button className="dash-action-btn dash-action-reject" onClick={() => handleStatus(q._id, "rejected")}>✕ Reject</button>
                        <button className="dash-action-btn dash-action-purple" onClick={() => handleStatus(q._id, "info_requested")}>❓ Request Info</button>
                      </>
                    )}
                    {q.status === "accepted" && (
                      <>
                        <button className="dash-action-btn dash-action-info" onClick={() => handleStatus(q._id, "contacted")}>📞 Mark Contacted</button>
                        <button className="dash-action-btn dash-action-approve" onClick={() => handleStatus(q._id, "completed")}>✅ Mark Completed</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="dash-pagination">
            <button className="dash-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span className="dash-page-indicator">Page {page}</span>
            <button className="dash-page-btn" onClick={() => setPage((p) => p + 1)} disabled={quotes.length < 15}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN VENDOR DASHBOARD ────────────────────────────────────────────────────
const VendorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor, isVendor, logout } = useAuth();

  useEffect(() => {
    if (!isVendor) navigate("/loginvendor");
  }, [isVendor, navigate]);

  if (!isVendor) return null;

  const navLinks = [
    { to: "/vendorDashboard",           label: "Dashboard",       icon: "📊", exact: true },
    { to: "/vendorDashboard/profile",   label: "Manage Profile",  icon: "👤" },
    { to: "/vendorDashboard/projects",  label: "Projects",        icon: "🏗" },
    { to: "/vendorDashboard/services",  label: "Services",        icon: "🔧" },
    { to: "/vendorDashboard/inquiries", label: "Inquiries",       icon: "📩" },
    { to: "/vendorDashboard/quotes",    label: "Quotes",          icon: "📋" },
  ];

  const displayName = vendor?.companyName || vendor?.fullname || "Vendor";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <nav className="dash-sidebar">
        {/* Vendor Info */}
        <div className="dash-sidebar-profile">
          <div className="dash-sidebar-avatar vendor">{initials}</div>
          <p className="dash-sidebar-name">{displayName}</p>
          <p className="dash-sidebar-email">{vendor?.email}</p>
        </div>

        {/* Nav Links */}
        <ul className="dash-nav">
          {navLinks.map(({ to, label, icon, exact }) => {
            const isActive = exact ? location.pathname === to : location.pathname === to || (to !== "/vendorDashboard" && location.pathname.startsWith(to));
            return (
              <li key={to}>
                <Link to={to} className={`dash-nav-link${isActive ? " active" : ""}`}>
                  <span className="dash-nav-icon">{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Public Profile & Logout */}
        <div className="dash-sidebar-bottom">
          {vendor?._id && (
            <Link to={`/vendor/${vendor._id}`} className="dash-bottom-link">🌐 View Public Profile</Link>
          )}
          <button onClick={() => { logout(); navigate("/"); }} className="dash-logout-btn">🚪 Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dash-main">
        <Routes>
          <Route index element={<VendorHome vendor={vendor} />} />
          <Route path="profile" element={<ManageProfile />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="inquiries" element={<ManageInquiries />} />
          <Route path="quotes" element={<ManageQuotes />} />
        </Routes>
      </main>
    </div>
  );
};

export default VendorDashboard;
