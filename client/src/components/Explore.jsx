import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";
import Footer from "./Footer";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const StarRating = ({ rating = 0, count = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ fontSize: "0.75rem", color: i <= Math.round(rating) ? "#F59E0B" : "#E2E8F0" }}>★</span>
    ))}
    <span style={{ fontSize: "0.75rem", color: "var(--ll-text-3)", marginLeft: "2px" }}>
      {rating > 0 ? `${rating.toFixed(1)} (${count})` : "No reviews"}
    </span>
  </div>
);

const Explore = () => {
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({ userName: "", userEmail: "", message: "" });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchVendors = async (retries = 2) => {
      try {
        const res = await api.get("/api/vendor/all", { timeout: 15000 });
        const data = res.data;
        const list = data?.vendors || [];
        setVendors(list);
        setFiltered(list);
        setTotalPages(data?.pages || 1);
        setCurrentPage(data?.page || 1);
        setHasMore(data?.hasMore || false);
      } catch (err) {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, retries === 2 ? 2000 : 5000));
          return fetchVendors(retries - 1);
        }
        toast.error("Failed to load vendors. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    if (user) {
      setInquiryForm((f) => ({
        ...f,
        userName: user.fullName || user.username || "",
        userEmail: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    let result = vendors;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.companyName?.toLowerCase().includes(q) ||
          v.location?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter.trim()) {
      const cat = categoryFilter.toLowerCase();
      result = result.filter((v) =>
        v.services?.some(
          (s) =>
            s.category?.toLowerCase().includes(cat) ||
            s.serviceName?.toLowerCase().includes(cat)
        )
      );
    }
    setFiltered(result);
  }, [searchQuery, categoryFilter, vendors]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter) params.category = categoryFilter;
    setSearchParams(params, { replace: true });
  }, [searchQuery, categoryFilter, setSearchParams]);

  const openInquiryModal = (vendor) => setSelectedVendor(vendor);
  const closeModal = () => { setSelectedVendor(null); setInquiryForm((f) => ({ ...f, message: "" })); };

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    const { userName, userEmail, message } = inquiryForm;
    if (!userName || !userEmail || !message) { toast.warning("All fields are required."); return; }
    setSendingInquiry(true);
    try {
      await api.post("/api/inquiries/send", { vendorId: selectedVendor._id, userName, userEmail, message });
      toast.success(`Inquiry sent to ${selectedVendor.companyName}!`);
      closeModal();
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please log in to send an inquiry.");
      } else {
        toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to send inquiry.");
      }
    } finally { setSendingInquiry(false); }
  };

  const loadMoreVendors = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await api.get(`/api/vendor/all?page=${nextPage}`, { timeout: 15000 });
      const data = res.data;
      const newVendors = data?.vendors || [];
      setVendors((prev) => [...prev, ...newVendors]);
      setCurrentPage(data?.page || nextPage);
      setHasMore(data?.hasMore || false);
      setTotalPages(data?.pages || totalPages);
    } catch {
      toast.error("Failed to load more vendors.");
    } finally {
      setLoadingMore(false);
    }
  };

  const categories = ["Elevators", "Installation", "Modernization"];

  return (
    <>
      <div style={{ minHeight: "100vh", background: "var(--ll-bg)" }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, var(--ll-nav) 0%, #1E3A5F 100%)",
          padding: "64px 24px 48px",
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,.2) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Discover Vendors</p>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: "12px", lineHeight: 1.1 }}>
              Explore Elevator Companies
            </h1>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto 32px" }}>
              Discover verified elevator service vendors across India
            </p>

            {/* Search Bar */}
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by company name, location, service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 44px",
                    background: "#fff",
                    border: "1.5px solid transparent",
                    borderRadius: "12px",
                    fontSize: "0.95rem",
                    fontFamily: "var(--ll-font)",
                    color: "var(--ll-text-1)",
                    boxShadow: "var(--ll-shadow-md)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--ll-primary)"}
                  onBlur={e => e.target.style.borderColor = "transparent"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ background: "#fff", borderBottom: "1px solid var(--ll-border)", padding: "16px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ll-text-3)", marginRight: "4px" }}>Filter:</span>
            {["All", ...categories].map((cat) => {
              const isActive = cat === "All" ? categoryFilter === "" : categoryFilter === cat;
              return (
                <button key={cat} onClick={() => setCategoryFilter(cat === "All" ? "" : cat)} style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: isActive ? "none" : "1.5px solid var(--ll-border)",
                  background: isActive ? "var(--ll-primary)" : "#fff",
                  color: isActive ? "#fff" : "var(--ll-text-2)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--ll-font)",
                  transition: "all 150ms",
                }}>
                  {cat}
                </button>
              );
            })}
            {(searchQuery || categoryFilter) && (
              <button onClick={() => { setSearchQuery(""); setCategoryFilter(""); }} style={{
                padding: "6px 14px", borderRadius: "999px",
                border: "1.5px solid var(--ll-danger)",
                background: "var(--ll-danger-bg)", color: "var(--ll-danger)",
                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--ll-font)", transition: "all 150ms",
                marginLeft: "auto",
              }}>
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
          {/* Results count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>
              {loading ? "Loading vendors…" : (
                <><strong style={{ color: "var(--ll-text-1)" }}>{filtered.length}</strong> vendor{filtered.length !== 1 ? "s" : ""} found{categoryFilter ? ` in ${categoryFilter}` : ""}{searchQuery ? ` for "${searchQuery}"` : ""}</>
              )}
            </p>
          </div>

          {/* Skeleton */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid var(--ll-border)" }}>
                  <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                    <div className="ll-skeleton" style={{ width: 56, height: 56, borderRadius: "14px" }} />
                    <div style={{ flex: 1 }}>
                      <div className="ll-skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 8, width: "60%" }} />
                      <div className="ll-skeleton" style={{ height: 14, borderRadius: 6, width: "40%" }} />
                    </div>
                  </div>
                  <div className="ll-skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 8 }} />
                  <div className="ll-skeleton" style={{ height: 14, borderRadius: 6, width: "80%" }} />
                </div>
              ))}
            </div>
          )}

          {/* Vendor Cards */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {filtered.map((vendor) => {
                const logoUrl = vendor.logo
                  ? `${API_BASE}${vendor.logo}`
                  : null;
                const avgRating = vendor.averageRating || 0;
                const reviewCount = vendor.totalReviews || 0;
                const initials = vendor.companyName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "V";

                return (
                  <div key={vendor._id} style={{
                    background: "#fff",
                    border: "1px solid var(--ll-border)",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "var(--ll-shadow-sm)",
                    display: "flex", flexDirection: "column",
                    transition: "all 200ms ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "var(--ll-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-sm)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--ll-border)"; }}
                  >
                    {/* Card Header */}
                    <div style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "flex-start" }}>
                      {/* Logo */}
                      <div style={{
                        width: 56, height: 56, borderRadius: "14px",
                        background: logoUrl ? "transparent" : "var(--ll-primary-light)",
                        border: "1px solid var(--ll-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, overflow: "hidden",
                      }}>
                        {logoUrl ? (
                          <img src={logoUrl} alt={vendor.companyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ll-primary)" }}>{initials}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ll-text-1)", margin: 0, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {vendor.companyName}
                          </h3>
                          {vendor.isVerified && (
                            <span style={{ flexShrink: 0, fontSize: "0.7rem", fontWeight: 600, color: "#059669", background: "#F0FDF4", padding: "2px 8px", borderRadius: "999px", border: "1px solid #D1FAE5" }}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <StarRating rating={avgRating} count={reviewCount} />
                      </div>
                    </div>

                    {/* Details */}
                    {vendor.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "0.8rem" }}>📍</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--ll-text-2)" }}>{vendor.location}</span>
                      </div>
                    )}
                    {vendor.companyType && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "0.8rem" }}>🏢</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--ll-text-2)" }}>{vendor.companyType}</span>
                      </div>
                    )}

                    {/* Description */}
                    {vendor.description && (
                      <p style={{
                        fontSize: "0.8rem", color: "var(--ll-text-2)", lineHeight: 1.6,
                        marginBottom: "14px",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {vendor.description}
                      </p>
                    )}

                    {/* Service chips */}
                    {vendor.services && vendor.services.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                        {vendor.services.slice(0, 3).map((s, i) => (
                          <span key={i} style={{
                            fontSize: "0.7rem", fontWeight: 600,
                            color: "var(--ll-primary)", background: "var(--ll-primary-light)",
                            padding: "3px 10px", borderRadius: "999px",
                          }}>{s.category || s.serviceName || "Service"}</span>
                        ))}
                        {vendor.services.length > 3 && (
                          <span style={{ fontSize: "0.7rem", color: "var(--ll-text-3)", padding: "3px 6px" }}>+{vendor.services.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                      <Link to={`/vendor/${vendor._id}`} style={{
                        flex: 1, padding: "9px 14px", borderRadius: "9px",
                        background: "var(--ll-primary)", color: "#fff",
                        textDecoration: "none", textAlign: "center",
                        fontSize: "0.8rem", fontWeight: 600,
                        transition: "all 150ms",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--ll-primary-hover)"}
                      onMouseLeave={e => e.currentTarget.style.background = "var(--ll-primary)"}
                      >
                        View Profile
                      </Link>
                      <button onClick={() => openInquiryModal(vendor)} style={{
                        flex: 1, padding: "9px 14px", borderRadius: "9px",
                        background: "transparent", color: "var(--ll-text-2)",
                        border: "1.5px solid var(--ll-border)",
                        fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "var(--ll-font)", transition: "all 150ms",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ll-text-3)"; e.currentTarget.style.color = "var(--ll-text-1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ll-border)"; e.currentTarget.style.color = "var(--ll-text-2)"; }}
                      >
                        📩 Enquire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {!loading && hasMore && filtered.length > 0 && !searchQuery && !categoryFilter && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button
                onClick={loadMoreVendors}
                disabled={loadingMore}
                className="ll-btn ll-btn-primary"
                style={{ padding: "12px 32px", fontSize: "0.9rem" }}
              >
                {loadingMore ? "Loading…" : `Load More Vendors (Page ${currentPage} of ${totalPages})`}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div style={{
              textAlign: "center", padding: "80px 24px",
              background: "#fff", borderRadius: "20px",
              border: "1px solid var(--ll-border)",
            }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ll-text-1)", marginBottom: "10px" }}>No vendors found</h3>
              <p style={{ color: "var(--ll-text-2)", marginBottom: "24px" }}>
                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "No vendors match the selected category yet."}
              </p>
              <button onClick={() => { setSearchQuery(""); setCategoryFilter(""); }} className="ll-btn ll-btn-primary">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Modal */}
      {selectedVendor && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,.6)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }} onClick={closeModal}>
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "36px 32px",
            width: "100%", maxWidth: "480px",
            boxShadow: "var(--ll-shadow-xl)",
            maxHeight: "90vh", overflowY: "auto",
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ll-text-1)", marginBottom: "4px" }}>Send Inquiry</h2>
                <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem" }}>to {selectedVendor.companyName}</p>
              </div>
              <button onClick={closeModal} style={{ background: "var(--ll-surface-2)", border: "none", borderRadius: "8px", width: 32, height: 32, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <form onSubmit={handleSendInquiry}>
              <div className="ll-form-group">
                <label className="ll-label" htmlFor="inq-name">Your Name</label>
                <input id="inq-name" className="ll-input" type="text" placeholder="Your full name" value={inquiryForm.userName} onChange={(e) => setInquiryForm({ ...inquiryForm, userName: e.target.value })} required disabled={sendingInquiry} />
              </div>
              <div className="ll-form-group">
                <label className="ll-label" htmlFor="inq-email">Email Address</label>
                <input id="inq-email" className="ll-input" type="email" placeholder="your@email.com" value={inquiryForm.userEmail} onChange={(e) => setInquiryForm({ ...inquiryForm, userEmail: e.target.value })} required disabled={sendingInquiry} />
              </div>
              <div className="ll-form-group">
                <label className="ll-label" htmlFor="inq-msg">Message</label>
                <textarea id="inq-msg" className="ll-input" rows={4} placeholder="Describe your requirement…" value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} required disabled={sendingInquiry} style={{ resize: "vertical", minHeight: "100px" }} />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "transparent", color: "var(--ll-text-2)", border: "1.5px solid var(--ll-border)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--ll-font)" }} disabled={sendingInquiry}>Cancel</button>
                <button type="submit" className="ll-btn ll-btn-primary" style={{ flex: 2, padding: "12px 16px" }} disabled={sendingInquiry}>
                  {sendingInquiry ? "Sending…" : "Send Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Explore;