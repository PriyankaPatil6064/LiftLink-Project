import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Admin-specific API instance (uses adminToken)
const adminApi = axios.create({ baseURL: API_BASE });
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Components ──────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="dash-spinner-wrap">
    <div className="dash-spinner" />
    <p className="dash-spinner-text">Loading…</p>
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="dash-empty">
    <div className="dash-empty-icon">{icon}</div>
    <p className="dash-empty-text">{text}</p>
  </div>
);

const Badge = ({ text, type = "info" }) => {
  const map = { success: "dash-badge-success", danger: "dash-badge-danger", warning: "dash-badge-warning", info: "dash-badge-info" };
  return <span className={`dash-badge ${map[type] || "dash-badge-info"}`}>{text}</span>;
};

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/api/admin/stats").then((r) => setStats(r.data)).catch(() => toast.error("Failed to load stats.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const statCards = [
    { icon: "🏢", label: "Total Vendors", value: stats?.totalVendors, color: "var(--ll-primary)", bg: "var(--ll-primary-light)" },
    { icon: "⏳", label: "Pending Approval", value: stats?.pendingVendors, color: "#F59E0B", bg: "var(--ll-warning-bg)" },
    { icon: "✅", label: "Approved Vendors", value: stats?.approvedVendors, color: "var(--ll-success)", bg: "var(--ll-success-bg)" },
    { icon: "👥", label: "Total Users", value: stats?.totalUsers, color: "#0EA5E9", bg: "#F0F9FF" },
    { icon: "⭐", label: "Total Reviews", value: stats?.totalReviews, color: "#7C3AED", bg: "#FAF5FF" },
    { icon: "📩", label: "Inquiries", value: stats?.totalInquiries, color: "#059669", bg: "#ECFDF5" },
    { icon: "📋", label: "Quotes", value: stats?.totalQuotes, color: "#F97316", bg: "#FFF7ED" },
  ];

  return (
    <div>
      <h2 className="dash-page-title">Admin Dashboard</h2>
      <p className="dash-page-subtitle">Platform overview and management tools.</p>

      <div className="dash-stats-grid">
        {statCards.map(({ icon, label, value, color, bg }) => (
          <div key={label} className="dash-stat-card" style={{ "--stat-accent": color }}>
            <div className="dash-stat-icon" style={{ background: bg }}>{icon}</div>
            <div className="dash-stat-value" style={{ color }}>{value ?? "—"}</div>
            <div className="dash-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Quote Status Distribution */}
      {stats?.quoteTrend?.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-header">
            <h4 className="dash-card-title">Quote Status Distribution</h4>
          </div>
          <div className="dash-card-body">
            <div className="dash-chip-grid">
              {stats.quoteTrend.map(({ _id, count }) => (
                <div key={_id} className="dash-chip">
                  <div className="dash-chip-value">{count}</div>
                  <div className="dash-chip-label">{_id?.replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h4 className="dash-card-title">Quick Actions</h4>
        </div>
        <div className="dash-card-body">
          <div className="dash-quick-grid">
            {[
              { to: "/admin/vendors?approved=false", label: "⏳ Pending Approvals" },
              { to: "/admin/vendors", label: "🏢 All Vendors" },
              { to: "/admin/users", label: "👥 All Users" },
              { to: "/admin/reviews?reported=true", label: "🚨 Reported Reviews" },
              { to: "/admin/quotes", label: "📋 All Quotes" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="dash-quick-link">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── VENDOR MANAGEMENT ────────────────────────────────────────────────────────
const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvedFilter, setApprovedFilter] = useState("");
  // Read URL query for approved filter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get("approved");
    if (a !== null) setApprovedFilter(a);
  }, []);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/vendors?page=${page}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (approvedFilter !== "") url += `&approved=${approvedFilter}`;
      const res = await adminApi.get(url);
      setVendors(res.data.vendors);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, [page, search, approvedFilter]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleApprove = async (id, approved) => {
    try {
      await adminApi.patch(`/api/admin/vendors/${id}/approve`, { approved });
      toast.success(approved ? "Vendor approved!" : "Vendor rejected.");
      fetchVendors();
    } catch {
      toast.error("Action failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor? This cannot be undone.")) return;
    try {
      await adminApi.delete(`/api/admin/vendors/${id}`);
      toast.success("Vendor deleted.");
      fetchVendors();
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div>
      <div className="dash-toolbar">
        <h2 className="dash-page-title" style={{ marginBottom: 0 }}>Vendor Management</h2>
        <div className="dash-toolbar-right">
          <select value={approvedFilter} onChange={(e) => { setApprovedFilter(e.target.value); setPage(1); }} className="dash-filter-select">
            <option value="">All Status</option>
            <option value="false">Pending</option>
            <option value="true">Approved</option>
          </select>
          <input type="text" placeholder="Search vendors..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="dash-search-input" />
        </div>
      </div>

      {loading ? <Spinner /> : vendors.length === 0 ? <EmptyState icon="🏢" text="No vendors found." /> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                {["Company", "Email", "Location", "Status", "Actions"].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{v.companyName}</span>
                    {v.isVerified && <> <Badge text="✓ Verified" type="success" /></>}
                  </td>
                  <td>{v.email}</td>
                  <td>{v.location || "—"}</td>
                  <td>
                    {v.isApproved ? <Badge text="Approved" type="success" /> : <Badge text="Pending" type="warning" />}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {!v.isApproved && <button className="dash-action-btn dash-action-approve" onClick={() => handleApprove(v._id, true)}>✓ Approve</button>}
                      {v.isApproved && <button className="dash-action-btn dash-action-warn" onClick={() => handleApprove(v._id, false)}>⊘ Revoke</button>}
                      <button className="dash-action-btn dash-action-reject" onClick={() => handleDelete(v._id)}>✕ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="dash-table-footer">
            <span className="dash-table-total">{total} vendors total</span>
            <div className="dash-pagination">
              <button className="dash-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span className="dash-page-indicator">Page {page}</span>
              <button className="dash-page-btn" onClick={() => setPage((p) => p + 1)} disabled={vendors.length < 15}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/api/admin/users?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch { toast.error("Failed to load users."); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await adminApi.delete(`/api/admin/users/${id}`);
      toast.success("User deleted.");
      fetchUsers();
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div>
      <div className="dash-toolbar">
        <h2 className="dash-page-title" style={{ marginBottom: 0 }}>User Management</h2>
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="dash-search-input" />
      </div>
      {loading ? <Spinner /> : users.length === 0 ? <EmptyState icon="👥" text="No users found." /> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr>{["Name", "Email", "Mobile", "Joined", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><span style={{ fontWeight: 600 }}>{u.fullName}</span> <span style={{ color: "var(--ll-text-3)", fontSize: "0.75rem" }}>@{u.username}</span></td>
                  <td>{u.email}</td>
                  <td>{u.mobile || "—"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td><button className="dash-action-btn dash-action-reject" onClick={() => handleDelete(u._id)}>✕ Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="dash-table-footer">
            <span className="dash-table-total">{total} users total</span>
            <div className="dash-pagination">
              <button className="dash-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span className="dash-page-indicator">Page {page}</span>
              <button className="dash-page-btn" onClick={() => setPage((p) => p + 1)} disabled={users.length < 15}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── REVIEW MODERATION ────────────────────────────────────────────────────────
const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reported, setReported] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/api/admin/reviews?page=${page}${reported ? "&reported=true" : ""}`);
      setReviews(res.data.reviews);
    } catch { toast.error("Failed to load reviews."); } finally { setLoading(false); }
  }, [page, reported]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleHide = async (id, hidden) => {
    try {
      await adminApi.patch(`/api/admin/reviews/${id}/hide`, { hidden });
      toast.success(hidden ? "Review hidden." : "Review restored.");
      fetchReviews();
    } catch { toast.error("Action failed."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await adminApi.delete(`/api/admin/reviews/${id}`);
      toast.success("Review deleted.");
      fetchReviews();
    } catch { toast.error("Delete failed."); }
  };

  return (
    <div>
      <div className="dash-toolbar">
        <h2 className="dash-page-title" style={{ marginBottom: 0 }}>Review Moderation</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ll-text-2)", fontSize: "0.875rem", cursor: "pointer" }}>
          <input type="checkbox" checked={reported} onChange={(e) => { setReported(e.target.checked); setPage(1); }} />
          Reported only
        </label>
      </div>
      {loading ? <Spinner /> : reviews.length === 0 ? <EmptyState icon="⭐" text="No reviews found." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ll-sp-4)" }}>
          {reviews.map((r) => (
            <div key={r._id} className="dash-card">
              <div className="dash-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ll-text-1)" }}>{r.userName}</span>
                      <span style={{ color: "#F59E0B" }}>{"★".repeat(r.rating)}</span>
                      {r.reportedBy?.length > 0 && <Badge text={`${r.reportedBy.length} reports`} type="danger" />}
                      {r.isHidden && <Badge text="Hidden" type="warning" />}
                    </div>
                    <p style={{ color: "var(--ll-text-2)", margin: "0 0 0.35rem", fontSize: "0.875rem" }}>{r.comment}</p>
                    {r.vendorId && <p style={{ color: "var(--ll-text-3)", margin: 0, fontSize: "0.75rem" }}>For: {r.vendorId.companyName}</p>}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button className={`dash-action-btn ${r.isHidden ? "dash-action-approve" : "dash-action-warn"}`} onClick={() => handleHide(r._id, !r.isHidden)}>
                      {r.isHidden ? "Restore" : "Hide"}
                    </button>
                    <button className="dash-action-btn dash-action-reject" onClick={() => handleDelete(r._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="dash-pagination">
            <button className="dash-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <button className="dash-page-btn" onClick={() => setPage((p) => p + 1)} disabled={reviews.length < 15}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── QUOTES MANAGEMENT ────────────────────────────────────────────────────────
const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/api/admin/quotes?page=${page}${status ? `&status=${status}` : ""}`);
      setQuotes(res.data.quotes);
      setTotal(res.data.total);
    } catch { toast.error("Failed."); } finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const QuoteStatusBadge = ({ s }) => {
    const map = {
      pending: "dash-badge-warning", accepted: "dash-badge-success", rejected: "dash-badge-danger",
      completed: "dash-badge-success", cancelled: "dash-badge-neutral", viewed: "dash-badge-info",
      info_requested: "dash-badge-purple",
    };
    return <span className={`dash-badge ${map[s] || "dash-badge-warning"}`}>{s?.replace(/_/g, " ")}</span>;
  };

  return (
    <div>
      <div className="dash-toolbar">
        <h2 className="dash-page-title" style={{ marginBottom: 0 }}>Quote Management</h2>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="dash-filter-select">
          <option value="">All Status</option>
          {["pending", "viewed", "accepted", "rejected", "info_requested", "contacted", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      {loading ? <Spinner /> : quotes.length === 0 ? <EmptyState icon="📋" text="No quotes found." /> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr>{["User", "Vendor", "Lift Type", "Status", "Date"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q._id}>
                  <td>{q.userName} <span style={{ color: "var(--ll-text-3)", fontSize: "0.75rem" }}>{q.userEmail}</span></td>
                  <td>{q.vendorId?.companyName || "—"}</td>
                  <td>{q.liftType}</td>
                  <td><QuoteStatusBadge s={q.status} /></td>
                  <td>{new Date(q.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="dash-table-footer">
            <span className="dash-table-total">{total} quotes total</span>
            <div className="dash-pagination">
              <button className="dash-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span className="dash-page-indicator">Page {page}</span>
              <button className="dash-page-btn" onClick={() => setPage((p) => p + 1)} disabled={quotes.length < 15}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem("adminData") || "null");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
    toast.info("Admin logged out.");
  };

  const navLinks = [
    { to: "/admin",         label: "Dashboard",  icon: "📊", exact: true },
    { to: "/admin/vendors",  label: "Vendors",    icon: "🏢" },
    { to: "/admin/users",    label: "Users",      icon: "👥" },
    { to: "/admin/reviews",  label: "Reviews",    icon: "⭐" },
    { to: "/admin/quotes",   label: "Quotes",     icon: "📋" },
  ];

  return (
    <div className="dash-layout">
      {/* Admin Sidebar */}
      <nav className="dash-sidebar">
        <div className="dash-sidebar-profile">
          <div className="dash-sidebar-avatar admin">🛡️</div>
          <p className="dash-sidebar-name">{admin?.name || "Admin"}</p>
          <p className="dash-sidebar-email">{admin?.role || "administrator"}</p>
        </div>
        <ul className="dash-nav">
          {navLinks.map(({ to, label, icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : (location.pathname.startsWith(to) && to !== "/admin") || location.pathname === to;
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
        <div className="dash-sidebar-bottom">
          <button onClick={handleLogout} className="dash-logout-btn">🚪 Logout</button>
        </div>
      </nav>

      {/* Content */}
      <main className="dash-main">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="quotes" element={<AdminQuotes />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
