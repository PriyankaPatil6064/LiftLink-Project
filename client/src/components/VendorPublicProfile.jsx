import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";
import Footer from "./Footer";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ── Star components ── */
const StarDisplay = ({ rating, size = "1rem" }) => (
  <span style={{ fontSize: size, letterSpacing: "2px" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= Math.round(rating) ? "#F59E0B" : "#E2E8F0" }}>★</span>
    ))}
  </span>
);

const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          style={{ fontSize: "1.75rem", cursor: "pointer", color: s <= (hover || value) ? "#F59E0B" : "#E2E8F0", transition: "color 0.15s, transform 0.15s", transform: s <= (hover || value) ? "scale(1.15)" : "scale(1)" }}
        >★</span>
      ))}
    </div>
  );
};

/* ── Main component ── */
const VendorPublicProfile = () => {
  const { vendorId } = useParams();
  const { user, isUser } = useAuth();

  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ userName: "", userEmail: "", message: "" });
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const [showQuote, setShowQuote] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    liftType: "", buildingType: "", floors: "", installationType: "", description: "", budget: "", timeline: "", userPhone: ""
  });
  const [sendingQuote, setSendingQuote] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // Project detail modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [vendorRes, reviewRes] = await Promise.all([
        api.get(`/api/vendor/${vendorId}`),
        api.get(`/api/reviews/${vendorId}?limit=20`),
      ]);
      setVendor(vendorRes.data);
      setReviews(reviewRes.data.reviews || []);
      if (user) {
        const mine = reviewRes.data.reviews.find((r) => r.userId?.toString() === user._id?.toString());
        if (mine) setUserReview(mine);
      }
    } catch {
      toast.error("Failed to load vendor profile.");
    } finally {
      setLoading(false);
    }
    if (isUser) api.post(`/api/users/track-view/${vendorId}`).catch(() => {});
  }, [vendorId, user, isUser]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (user) setInquiryForm((f) => ({ ...f, userName: user.fullName || user.username || "", userEmail: user.email || "" }));
  }, [user]);

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    setSendingInquiry(true);
    try {
      await api.post("/api/inquiries/send", { vendorId, ...inquiryForm });
      toast.success("Inquiry sent successfully!");
      setShowInquiry(false);
      setInquiryForm((f) => ({ ...f, message: "" }));
    } catch (err) {
      toast.error(err.response?.status === 401 ? "Please log in to send an inquiry." : err.response?.data?.error || "Failed to send inquiry.");
    } finally { setSendingInquiry(false); }
  };

  const handleRequestQuote = async (e) => {
    e.preventDefault();
    if (!isUser) { toast.error("Please log in to request a quote."); return; }
    setSendingQuote(true);
    try {
      await api.post("/api/quotes", { vendorId, ...quoteForm });
      toast.success("Quote request sent!");
      setShowQuote(false);
      setQuoteForm({ liftType: "", buildingType: "", floors: "", installationType: "", description: "", budget: "", timeline: "", userPhone: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send quote request.");
    } finally { setSendingQuote(false); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isUser) { toast.error("Please log in to submit a review."); return; }
    if (reviewForm.rating === 0) { toast.error("Please select a rating."); return; }
    setSubmittingReview(true);
    try {
      await api.post("/api/reviews", { vendorId, ...reviewForm });
      toast.success("Review submitted!");
      setReviewForm({ rating: 0, title: "", comment: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally { setSubmittingReview(false); }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) { toast.error("Please log in to vote."); return; }
    try {
      const res = await api.patch(`/api/reviews/${reviewId}/helpful`);
      setReviews((prev) => prev.map((r) => r._id === reviewId ? { ...r, helpfulVotes: { length: res.data.helpful } } : r));
    } catch {}
  };

  const handleSaveVendor = async () => {
    if (!isUser) { toast.error("Please log in to save vendors."); return; }
    try {
      const res = await api.post(`/api/users/save-vendor/${vendorId}`);
      toast.success(res.data.saved ? "Vendor saved!" : "Vendor unsaved.");
    } catch { toast.error("Failed to save vendor."); }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="vp-loading">
        <div className="vp-spinner" />
        <p className="ll-body" style={{ color: "var(--ll-text-2)" }}>Loading profile…</p>
      </div>
    );
  }

  // ── Not found ──
  if (!vendor) {
    return (
      <div className="vp-notfound">
        <div className="vp-notfound-icon">🔍</div>
        <h2 className="ll-heading-4">Vendor Not Found</h2>
        <p className="ll-body" style={{ marginBottom: "var(--ll-sp-4)" }}>The vendor you're looking for doesn't exist or has been removed.</p>
        <Link to="/Explore" className="ll-btn ll-btn-primary">← Back to Explore</Link>
      </div>
    );
  }

  const logoUrl = vendor.logo ? `${API_BASE}/uploads/${vendor.logo}` : null;
  const bannerUrl = vendor.coverBanner ? `${API_BASE}/uploads/${vendor.coverBanner}` : null;
  const avgRating = vendor.averageRating || 0;
  const initials = vendor.companyName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "V";
  const foundedYear = vendor.experience ? new Date().getFullYear() - vendor.experience : null;

  /* Compute a unique deterministic hue per vendor from company name (curated SaaS blue/indigo/teal/cyan/violet palette) */
  const PROFESSIONAL_HUES = [215, 195, 235, 180, 225, 205, 245, 175, 220, 240, 190, 210];
  const charHash = (vendor.companyName || "").split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) & 0xFFFF, 0);
  const nameHue = PROFESSIONAL_HUES[Math.abs(charHash) % PROFESSIONAL_HUES.length];

  /* ── Trust badges derived from vendor data ── */
  const trustBadges = [];
  if (vendor.isVerified) trustBadges.push({ label: "✓ Verified", cls: "vp-badge-verified" });
  if (avgRating >= 4.5 && reviews.length >= 3) trustBadges.push({ label: "⭐ Top Rated", cls: "vp-badge-toprated" });
  if (vendor.experience >= 15) trustBadges.push({ label: "🏗 " + vendor.experience + "+ Yrs", cls: "vp-badge-experience" });
  if (vendor.certifications?.some(c => c.name?.toLowerCase().includes("iso"))) trustBadges.push({ label: "🏅 ISO Certified", cls: "vp-badge-iso" });
  if (vendor.projects?.length >= 4) trustBadges.push({ label: "🏆 Premium", cls: "vp-badge-premium" });

  /* ── Service icon map ── */
  const svcIcon = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("passenger") || n.includes("home") || n.includes("villa") || n.includes("residential")) return "🏠";
    if (n.includes("freight") || n.includes("cargo") || n.includes("goods")) return "📦";
    if (n.includes("hospital") || n.includes("bed") || n.includes("stretcher")) return "🏥";
    if (n.includes("escalator") || n.includes("moving walk")) return "🔝";
    if (n.includes("hydraulic")) return "💧";
    if (n.includes("glass") || n.includes("panoramic") || n.includes("capsule")) return "🔮";
    if (n.includes("dumbwaiter") || n.includes("kitchen")) return "🍽️";
    if (n.includes("car") || n.includes("vehicle") || n.includes("parking")) return "🚗";
    if (n.includes("maintenance") || n.includes("amc") || n.includes("repair")) return "🔧";
    if (n.includes("moderniz") || n.includes("upgrade")) return "⚡";
    if (n.includes("install")) return "🏗️";
    if (n.includes("iot") || n.includes("smart") || n.includes("automation")) return "📡";
    if (n.includes("solar") || n.includes("green") || n.includes("eco")) return "🌿";
    return "🛠️";
  };

  /* ── Project helpers ── */
  const getProjectImage = (project) => {
    if (project.images?.length > 0) return `${API_BASE}/uploads/${project.images[0]}`;
    if (project.image) return `${API_BASE}/uploads/${project.image}`;
    return null;
  };
  const getProjectImages = (project) => {
    if (project.images?.length > 0) return project.images.map((img) => `${API_BASE}/uploads/${img}`);
    if (project.image) return [`${API_BASE}/uploads/${project.image}`];
    return [];
  };
  const openProjectDetail = (project) => {
    setSelectedProject(project);
    setGalleryIndex(0);
  };

  const tabs = [
    { id: "overview",  label: "Overview",  icon: "📋" },
    ...(vendor.projects?.length > 0 ? [{ id: "projects", label: `Projects (${vendor.projects.length})`, icon: "🏗" }] : []),
    { id: "services",  label: "Services",  icon: "🛠️" },
    { id: "reviews",   label: `Reviews${reviews.length ? ` (${reviews.length})` : ""}`, icon: "⭐" },
    { id: "contact",   label: "Contact",   icon: "📞" },
  ];

  return (
    <>
      <div style={{ minHeight: "100vh", background: "var(--ll-bg)" }}>
        {/* ── Cover Banner ── */}
        <div className={`vp-cover${bannerUrl ? ' vp-cover--has-image' : ''}`} style={{ '--vp-hue': nameHue }}>
          {bannerUrl ? (
            <img src={bannerUrl} alt="Cover" className="vp-cover-img" />
          ) : (
            <>
              <div className="vp-cover-overlay" />
              <div className="vp-cover-pattern" />
            </>
          )}
          <div className="vp-cover-gradient" />
          {/* Company name ON the banner */}
          <div className="vp-banner-text">
            <h1 className="vp-banner-name">{vendor.companyName}</h1>
            {vendor.tagline && <p className="vp-banner-tagline">{vendor.tagline}</p>}
            {vendor.location && <p className="vp-banner-location">📍 {vendor.location}</p>}
          </div>
        </div>

        {/* ── Profile Header ── */}
        <div className="vp-header-wrap">
          <div className="vp-header">
            {/* Logo */}
            <div className="vp-logo" style={{ '--vp-hue': nameHue }}>
              {logoUrl
                ? <img src={logoUrl} alt={vendor.companyName} />
                : <div className="vp-logo-initials">{initials}</div>
              }
            </div>

            {/* Name + meta */}
            <div className="vp-info">
              <div className="vp-name-row">
                <h1 className="vp-name">{vendor.companyName}</h1>
                {trustBadges.map((b, i) => <span key={i} className={`vp-badge ${b.cls}`}>{b.label}</span>)}
                {vendor.isApproved && !vendor.isVerified && <span className="vp-badge vp-badge-approved">APPROVED</span>}
              </div>
              {vendor.tagline && <p className="vp-tagline">{vendor.tagline}</p>}
              <div className="vp-meta-row">
                {avgRating > 0 && (
                  <div className="vp-meta-item">
                    <StarDisplay rating={avgRating} size="0.95rem" />
                    <span><span className="vp-rating-value">{avgRating.toFixed(1)}</span> ({reviews.length} reviews)</span>
                  </div>
                )}
                {vendor.location && <span className="vp-meta-item"><span className="vp-meta-icon">📍</span> {vendor.location}</span>}
                {vendor.companyType && <span className="vp-meta-item"><span className="vp-meta-icon">🏢</span> {vendor.companyType}</span>}
              </div>
              {/* ── Metrics Row ── */}
              <div className="vp-metrics-row">
                {vendor.projects?.length > 0 && <span className="vp-metric-chip"><span className="vp-metric-chip-icon">🏗</span> <span className="vp-metric-chip-value">{vendor.projects.length}</span> Projects</span>}
                {vendor.teamSize && <span className="vp-metric-chip"><span className="vp-metric-chip-icon">👷</span> {vendor.teamSize} Team</span>}
                {foundedYear && <span className="vp-metric-chip"><span className="vp-metric-chip-icon">📅</span> Since {foundedYear}</span>}
                {vendor.serviceCities?.length > 0 && <span className="vp-metric-chip"><span className="vp-metric-chip-icon">📍</span> <span className="vp-metric-chip-value">{vendor.serviceCities.length}</span> Cities</span>}
                {vendor.services?.length > 0 && <span className="vp-metric-chip"><span className="vp-metric-chip-icon">🛠️</span> <span className="vp-metric-chip-value">{vendor.services.length}</span> Services</span>}
              </div>
            </div>

            {/* Action buttons */}
            <div className="vp-actions">
              <button onClick={handleSaveVendor} className="vp-action-btn vp-action-save" title="Save Vendor">🔖 Save</button>
              <button onClick={() => setShowInquiry(true)} className="vp-action-btn vp-action-enquire">📩 Contact</button>
              <button onClick={() => setShowQuote(true)} className="ll-btn ll-btn-primary vp-action-quote">📋 Get Quote</button>
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <div className="vp-tabs">
            {tabs.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`vp-tab${activeTab === id ? " active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* ── TAB: Overview ──                           */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="vp-content-grid">
              <div>
                {/* About */}
                <div className="vp-section-card">
                  <h2 className="vp-section-title">
                    <span className="vp-section-title-icon">🏢</span>
                    About the Company
                  </h2>
                  <p className="vp-section-desc">
                    {vendor.description || "No description provided yet."}
                  </p>
                </div>

                {/* Business Details */}
                <div className="vp-section-card">
                  <h2 className="vp-section-title">
                    <span className="vp-section-title-icon">📋</span>
                    Business Details
                  </h2>
                  <div className="vp-details-grid">
                    {[
                      { label: "Company Type", value: vendor.companyType },
                      { label: "Location", value: vendor.location },
                      { label: "Experience", value: vendor.experience ? `${vendor.experience} years` : null },
                      { label: "Founded", value: vendor.foundedYear },
                      { label: "Team Size", value: vendor.teamSize },
                      { label: "Reg. No.", value: vendor.companyRegistrationNumber },
                    ].filter(item => item.value).map(({ label, value }) => (
                      <div key={label} className="vp-detail-item">
                        <p className="vp-detail-label">{label}</p>
                        <p className="vp-detail-value">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Projects on Overview */}
              {vendor.projects?.length > 0 && (
                <div className="vp-section-card" style={{ gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 className="vp-section-title" style={{ marginBottom: 0 }}>
                      <span className="vp-section-title-icon">🏗</span>
                      Featured Projects
                    </h2>
                    {vendor.projects.length > 3 && (
                      <button onClick={() => setActiveTab("projects")} className="vp-view-all-link">View All ({vendor.projects.length}) →</button>
                    )}
                  </div>
                  <div className="vp-projects-grid">
                    {vendor.projects.slice(0, 3).map((p) => {
                      const imgUrl = getProjectImage(p);
                      const hue = (p.title || "").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xFFFF, 0) % 360;
                      return (
                        <div key={p._id} className="vp-project-card" onClick={() => openProjectDetail(p)}>
                          <div className="vp-project-card-img" style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : { background: `linear-gradient(135deg, hsl(${hue},45%,88%), hsl(${hue + 40},40%,82%))` }}>
                            {!imgUrl && <div className="vp-project-card-placeholder">🏗</div>}
                            {p.videoUrl && <span className="vp-project-badge">🎬 Video</span>}
                            {p.images?.length > 1 && <span className="vp-project-badge vp-project-badge-bottom">📷 {p.images.length}</span>}
                          </div>
                          <div className="vp-project-card-body">
                            <h4 className="vp-project-card-title">{p.title || "Project"}</h4>
                            {p.description && <p className="vp-project-card-desc">{p.description}</p>}
                            <div className="vp-project-card-meta">
                              {p.location && <span>📍 {p.location}</span>}
                              {p.year && <span>📅 {p.year}</span>}
                              {p.projectType && <span>{p.projectType}</span>}
                              {p.elevatorType && <span>{p.elevatorType}</span>}
                            </div>
                            <span className="vp-project-card-link">View Project →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Sidebar Wrapper ── */}
              <aside className="vp-sidebar-sticky">
                {/* Quick stats */}
                <div className="vp-sidebar-card">
                  <h3 className="vp-sidebar-title">Quick Stats</h3>
                  {[
                    { label: "Reviews", value: reviews.length, icon: "⭐" },
                    { label: "Avg. Rating", value: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : "—", icon: "📊" },
                    { label: "Services", value: vendor.services?.length || 0, icon: "🛠️" },
                    { label: "Projects", value: vendor.projects?.length || 0, icon: "📁" },
                    { label: "Cities Served", value: vendor.serviceCities?.length || "—", icon: "🌐" },
                    { label: "Experience", value: vendor.experience ? `${vendor.experience} yrs` : "—", icon: "🏗" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="vp-stat-row">
                      <span className="vp-stat-label">
                        <span className="vp-stat-label-icon">{icon}</span>
                        {label}
                      </span>
                      <span className="vp-stat-value">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Contact sidebar */}
                {(vendor.mobile || vendor.email || vendor.socialLinks?.website) && (
                  <div className="vp-sidebar-card">
                    <h3 className="vp-sidebar-title">📞 Quick Contact</h3>
                    {vendor.mobile && (
                      <div className="vp-stat-row">
                        <span className="vp-stat-label"><span className="vp-stat-label-icon">📞</span> Phone</span>
                        <a href={`tel:${vendor.mobile}`} style={{ color: "var(--ll-primary)", fontWeight: 600, fontSize: "var(--ll-text-sm)", textDecoration: "none" }}>{vendor.mobile}</a>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="vp-stat-row">
                        <span className="vp-stat-label"><span className="vp-stat-label-icon">✉️</span> Email</span>
                        <a href={`mailto:${vendor.email}`} style={{ color: "var(--ll-primary)", fontWeight: 600, fontSize: "var(--ll-text-sm)", textDecoration: "none" }}>{vendor.email.split("@")[0]}@…</a>
                      </div>
                    )}
                    {vendor.socialLinks?.website && (
                      <div className="vp-stat-row">
                        <span className="vp-stat-label"><span className="vp-stat-label-icon">🌐</span> Website</span>
                        <a href={vendor.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ll-primary)", fontWeight: 600, fontSize: "var(--ll-text-sm)", textDecoration: "none" }}>Visit →</a>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Card */}
                <div className="vp-cta-card">
                  <div className="vp-cta-icon">📋</div>
                  <h3 className="vp-cta-title">Get a free quote</h3>
                  <p className="vp-cta-desc">Tell us your requirements and get a quote in 24 hours.</p>
                  <button onClick={() => setShowQuote(true)} className="vp-cta-btn">
                    Request Quote →
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* ── TAB: Projects ──                           */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "projects" && (
            <div className="vp-content-full">
              {vendor.projects?.length > 0 ? (
                <div className="vp-projects-grid vp-projects-grid--full">
                  {vendor.projects.map((p) => {
                    const imgUrl = getProjectImage(p);
                    const hue = (p.title || "").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xFFFF, 0) % 360;
                    return (
                      <div key={p._id} className="vp-project-card" onClick={() => openProjectDetail(p)}>
                        <div className="vp-project-card-img" style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : { background: `linear-gradient(135deg, hsl(${hue},45%,88%), hsl(${hue + 40},40%,82%))` }}>
                          {!imgUrl && <div className="vp-project-card-placeholder">🏗</div>}
                          {p.videoUrl && <span className="vp-project-badge">🎬 Video</span>}
                          {p.images?.length > 1 && <span className="vp-project-badge vp-project-badge-bottom">📷 {p.images.length}</span>}
                        </div>
                        <div className="vp-project-card-body">
                          <h4 className="vp-project-card-title">{p.title || "Project"}</h4>
                          {p.description && <p className="vp-project-card-desc">{p.description}</p>}
                          <div className="vp-project-card-meta">
                            {p.location && <span>📍 {p.location}</span>}
                            {p.year && <span>📅 {p.year}</span>}
                            {p.projectType && <span>{p.projectType}</span>}
                            {p.elevatorType && <span>{p.elevatorType}</span>}
                          </div>
                          <span className="vp-project-card-link">View Project →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="vp-empty">
                  <div className="vp-empty-icon">🏗</div>
                  <p className="vp-empty-text">No projects showcased yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* ── TAB: Services ──                           */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "services" && (
            <div className="vp-content-full">
              {vendor.services && vendor.services.length > 0 ? (
                <div className="vp-services-grid">
                  {vendor.services.map((s, i) => (
                    <div key={i} className="vp-service-card">
                      <div className="vp-service-icon">{svcIcon(s.serviceName || s.category)}</div>
                      <h3 className="vp-service-name">{s.serviceName || s.category}</h3>
                      {s.category && s.serviceName && <span className="vp-service-category">{s.category}</span>}
                      {s.description && <p className="vp-service-desc">{s.description}</p>}
                      {s.price && <p className="vp-service-price">₹{s.price.toLocaleString("en-IN")}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="vp-empty">
                  <div className="vp-empty-icon">🛠️</div>
                  <p className="vp-empty-text">No services listed yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* ── TAB: Reviews ──                            */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "reviews" && (
            <div className="vp-content-grid">
              {/* Review list */}
              <div>
                {reviews.length > 0 ? (
                  <div className="vp-review-list">
                    {reviews.map((r) => (
                      <div key={r._id} className="vp-review-card">
                        <div className="vp-review-header">
                          <div>
                            <p className="vp-review-title">{r.title || "Review"}</p>
                            <StarDisplay rating={r.rating} size="0.95rem" />
                          </div>
                          <span className="vp-review-date">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        <p className="vp-review-body">{r.comment}</p>
                        {r.vendorReply?.text && (
                          <div className="vp-review-vendor-reply">
                            <p className="vp-review-vendor-reply-label">🏢 Vendor Response</p>
                            <p className="vp-review-vendor-reply-text">{r.vendorReply.text}</p>
                          </div>
                        )}
                        <div className="vp-review-footer">
                          <span className="vp-review-author">
                            — {r.userName || "Anonymous"}
                            <span className="vp-review-verified-badge">✓ Verified</span>
                          </span>
                          <button onClick={() => handleHelpful(r._id)} className="vp-helpful-btn">
                            👍 Helpful ({r.helpfulVotes?.length || 0})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="vp-empty">
                    <div className="vp-empty-icon">⭐</div>
                    <p className="vp-empty-text">No reviews yet. Be the first!</p>
                  </div>
                )}
              </div>

              {/* Write review sidebar */}
              <aside className="vp-sidebar-sticky">
                <div className="vp-review-sidebar">
                  {userReview ? (
                    <div className="vp-review-done">
                      <div className="vp-review-done-icon">✅</div>
                      <p style={{ fontWeight: 600, color: "var(--ll-text-1)", marginBottom: "4px" }}>You've reviewed this vendor</p>
                      <p className="ll-body-sm">Thank you for your feedback!</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="vp-sidebar-title">Write a review</h3>
                      {!isUser && <div className="ll-alert ll-alert-info" style={{ marginBottom: "16px" }}><span>Please <Link to="/login" className="ll-auth-link">log in</Link> to review.</span></div>}
                      <form onSubmit={handleSubmitReview}>
                        <div style={{ marginBottom: "14px" }}>
                          <label className="ll-label">Your Rating</label>
                          <StarInput value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                        </div>
                        <div className="ll-form-group">
                          <label className="ll-label" htmlFor="rev-title">Title</label>
                          <input id="rev-title" className="ll-input" type="text" placeholder="Summary of your experience" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} disabled={!isUser || submittingReview} />
                        </div>
                        <div className="ll-form-group">
                          <label className="ll-label" htmlFor="rev-comment">Review</label>
                          <textarea id="rev-comment" className="ll-input" rows={4} placeholder="Tell others about your experience…" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} disabled={!isUser || submittingReview} style={{ resize: "vertical", minHeight: "80px" }} />
                        </div>
                        <button type="submit" className="ll-btn ll-btn-primary ll-btn-block" disabled={!isUser || submittingReview}>
                          {submittingReview ? "Submitting…" : "Submit Review"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </aside>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* ── TAB: Contact ──                            */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "contact" && (
            <div className="vp-contact-wrap">
              <div className="vp-contact-card">
                <h2 className="vp-section-title">
                  <span className="vp-section-title-icon">📞</span>
                  Contact Information
                </h2>
                {[
                  { icon: "📍", label: "Address", value: vendor.address || vendor.location },
                  { icon: "📞", label: "Phone", value: vendor.mobile, href: vendor.mobile ? `tel:${vendor.mobile}` : null },
                  { icon: "📧", label: "Email", value: vendor.email, href: vendor.email ? `mailto:${vendor.email}` : null },
                  { icon: "🌐", label: "Website", value: vendor.socialLinks?.website, href: vendor.socialLinks?.website },
                ].filter(item => item.value).map(({ icon, label, value, href }) => (
                  <div key={label} className="vp-contact-row">
                    <div className="vp-contact-icon">{icon}</div>
                    <div>
                      <p className="vp-contact-label">{label}</p>
                      <p className="vp-contact-value">
                        {href
                          ? <a href={href} target={label === "Website" ? "_blank" : undefined} rel="noopener noreferrer">{value}</a>
                          : value
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              {vendor.businessHours?.length > 0 && (
                <div className="vp-contact-card">
                  <h2 className="vp-section-title">
                    <span className="vp-section-title-icon">🕒</span>
                    Business Hours
                  </h2>
                  {vendor.businessHours.map((bh) => (
                    <div key={bh.day} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--ll-border)", fontSize: "var(--ll-text-sm)" }}>
                      <span style={{ fontWeight: 600, color: "var(--ll-text-1)" }}>{bh.day}</span>
                      <span style={{ color: bh.closed ? "var(--ll-danger)" : "var(--ll-text-2)" }}>{bh.closed ? "Closed" : `${bh.open} – ${bh.close}`}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Social Links */}
              {vendor.socialLinks && (vendor.socialLinks.linkedin || vendor.socialLinks.instagram || vendor.socialLinks.facebook || vendor.socialLinks.googleMaps) && (
                <div className="vp-contact-card">
                  <h2 className="vp-section-title">
                    <span className="vp-section-title-icon">🔗</span>
                    Social Links
                  </h2>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {vendor.socialLinks.linkedin && <a href={vendor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="vp-action-btn vp-action-save" style={{ textDecoration: "none" }}>LinkedIn</a>}
                    {vendor.socialLinks.instagram && <a href={vendor.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="vp-action-btn vp-action-save" style={{ textDecoration: "none" }}>Instagram</a>}
                    {vendor.socialLinks.facebook && <a href={vendor.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="vp-action-btn vp-action-save" style={{ textDecoration: "none" }}>Facebook</a>}
                    {vendor.socialLinks.googleMaps && <a href={vendor.socialLinks.googleMaps} target="_blank" rel="noopener noreferrer" className="vp-action-btn vp-action-save" style={{ textDecoration: "none" }}>📍 Maps</a>}
                  </div>
                </div>
              )}

              <div className="vp-contact-buttons">
                <button onClick={() => setShowInquiry(true)} className="ll-btn ll-btn-secondary" style={{ flex: 1, padding: "13px" }}>📩 Send Inquiry</button>
                <button onClick={() => setShowQuote(true)} className="ll-btn ll-btn-primary" style={{ flex: 1, padding: "13px" }}>📋 Request Quote</button>
              </div>
            </div>
          )}

          <div style={{ height: "48px" }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* ── Inquiry Modal ──                           */}
      {/* ══════════════════════════════════════════════ */}
      {showInquiry && (
        <div className="vp-modal-backdrop" onClick={() => setShowInquiry(false)}>
          <div className="vp-modal" onClick={e => e.stopPropagation()}>
            <div className="vp-modal-header">
              <div>
                <h2 className="vp-modal-title">Send Inquiry</h2>
                <p className="vp-modal-subtitle">to {vendor.companyName}</p>
              </div>
              <button onClick={() => setShowInquiry(false)} className="vp-modal-close">✕</button>
            </div>
            <form onSubmit={handleSendInquiry}>
              <div className="ll-form-group">
                <label className="ll-label" htmlFor="mi-name">Your Name</label>
                <input id="mi-name" className="ll-input" type="text" placeholder="Full name" value={inquiryForm.userName} onChange={(e) => setInquiryForm({ ...inquiryForm, userName: e.target.value })} required disabled={sendingInquiry} />
              </div>
              <div className="ll-form-group">
                <label className="ll-label" htmlFor="mi-email">Email</label>
                <input id="mi-email" className="ll-input" type="email" placeholder="your@email.com" value={inquiryForm.userEmail} onChange={(e) => setInquiryForm({ ...inquiryForm, userEmail: e.target.value })} required disabled={sendingInquiry} />
              </div>
              <div className="ll-form-group">
                <label className="ll-label" htmlFor="mi-msg">Message</label>
                <textarea id="mi-msg" className="ll-input" rows={4} placeholder="Describe your requirement…" value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} required disabled={sendingInquiry} style={{ resize: "vertical" }} />
              </div>
              <div className="vp-modal-actions">
                <button type="button" onClick={() => setShowInquiry(false)} className="vp-modal-cancel" disabled={sendingInquiry}>Cancel</button>
                <button type="submit" className="ll-btn ll-btn-primary" style={{ flex: 2, padding: "12px" }} disabled={sendingInquiry}>{sendingInquiry ? "Sending…" : "Send Inquiry"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── Quote Modal ──                             */}
      {/* ══════════════════════════════════════════════ */}
      {showQuote && (
        <div className="vp-modal-backdrop" onClick={() => setShowQuote(false)}>
          <div className="vp-modal" onClick={e => e.stopPropagation()}>
            <div className="vp-modal-header">
              <div>
                <h2 className="vp-modal-title">Request Quote</h2>
                <p className="vp-modal-subtitle">from {vendor.companyName}</p>
              </div>
              <button onClick={() => setShowQuote(false)} className="vp-modal-close">✕</button>
            </div>
            <form onSubmit={handleRequestQuote}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Lift Type</label>
                  <select className="ll-input ll-select" value={quoteForm.liftType} onChange={(e) => setQuoteForm({ ...quoteForm, liftType: e.target.value })} required disabled={sendingQuote}>
                    <option value="">Select…</option>
                    {["Passenger Lift", "Freight Elevator", "Hospital Lift", "Home Elevator", "Glass/Capsule Elevator", "Hydraulic Lift"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Building Type</label>
                  <select className="ll-input ll-select" value={quoteForm.buildingType} onChange={(e) => setQuoteForm({ ...quoteForm, buildingType: e.target.value })} disabled={sendingQuote}>
                    <option value="">Select…</option>
                    {["Residential", "Commercial", "Industrial", "Hospital", "Hotel"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "14px" }}>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">No. of Floors</label>
                  <input className="ll-input" type="number" min="1" placeholder="e.g. 10" value={quoteForm.floors} onChange={(e) => setQuoteForm({ ...quoteForm, floors: e.target.value })} disabled={sendingQuote} />
                </div>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Your Phone</label>
                  <input className="ll-input" type="tel" placeholder="9876543210" value={quoteForm.userPhone} onChange={(e) => setQuoteForm({ ...quoteForm, userPhone: e.target.value })} disabled={sendingQuote} />
                </div>
              </div>
              <div className="ll-form-group" style={{ marginTop: "14px" }}>
                <label className="ll-label">Budget (₹)</label>
                <input className="ll-input" type="text" placeholder="Approximate budget" value={quoteForm.budget} onChange={(e) => setQuoteForm({ ...quoteForm, budget: e.target.value })} disabled={sendingQuote} />
              </div>
              <div className="ll-form-group">
                <label className="ll-label">Additional Details</label>
                <textarea className="ll-input" rows={3} placeholder="Any specific requirements…" value={quoteForm.description} onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })} disabled={sendingQuote} style={{ resize: "vertical" }} />
              </div>
              <div className="vp-modal-actions">
                <button type="button" onClick={() => setShowQuote(false)} className="vp-modal-cancel" disabled={sendingQuote}>Cancel</button>
                <button type="submit" className="ll-btn ll-btn-primary" style={{ flex: 2, padding: "12px" }} disabled={sendingQuote}>{sendingQuote ? "Sending…" : "Send Quote Request"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── Project Detail Modal ──                    */}
      {/* ══════════════════════════════════════════════ */}
      {selectedProject && (() => {
        const p = selectedProject;
        const imgs = getProjectImages(p);
        const hue = (p.title || "").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xFFFF, 0) % 360;
        return (
          <div className="vp-modal-backdrop" onClick={() => setSelectedProject(null)}>
            <div className="vp-modal vp-project-modal" onClick={(e) => e.stopPropagation()}>
              <div className="vp-modal-header">
                <div>
                  <h2 className="vp-modal-title">{p.title || "Project Details"}</h2>
                  <p className="vp-modal-subtitle">{vendor.companyName}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="vp-modal-close">✕</button>
              </div>

              {/* Gallery */}
              <div className="vp-project-gallery" style={imgs.length === 0 ? { background: `linear-gradient(135deg, hsl(${hue},45%,88%), hsl(${hue + 40},40%,82%))` } : {}}>
                {imgs.length > 0 ? (
                  <>
                    <img src={imgs[galleryIndex]} alt={p.title} className="vp-project-gallery-img" />
                    {imgs.length > 1 && (
                      <>
                        <button className="vp-gallery-nav vp-gallery-prev" onClick={() => setGalleryIndex((i) => (i - 1 + imgs.length) % imgs.length)}>‹</button>
                        <button className="vp-gallery-nav vp-gallery-next" onClick={() => setGalleryIndex((i) => (i + 1) % imgs.length)}>›</button>
                        <div className="vp-gallery-dots">
                          {imgs.map((_, i) => (
                            <span key={i} className={`vp-gallery-dot${i === galleryIndex ? " active" : ""}`} onClick={() => setGalleryIndex(i)} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "4rem", color: `hsl(${hue},30%,65%)` }}>🏗</div>
                )}
              </div>

              {/* Details */}
              <div style={{ padding: "24px" }}>
                <div className="vp-project-detail-meta">
                  {p.location && <span className="vp-project-detail-chip">📍 {p.location}</span>}
                  {p.year && <span className="vp-project-detail-chip">📅 {p.year}</span>}
                  {p.projectType && <span className="vp-project-detail-chip">{p.projectType}</span>}
                  {p.elevatorType && <span className="vp-project-detail-chip">{p.elevatorType}</span>}
                </div>
                {p.description && <p style={{ color: "var(--ll-text-2)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "20px" }}>{p.description}</p>}

                {/* Video */}
                {p.videoUrl && (
                  <div style={{ marginBottom: "20px" }}>
                    <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="vp-action-btn vp-action-save" style={{ textDecoration: "none" }}>🎬 Watch Project Video →</a>
                  </div>
                )}

                {/* CTA */}
                <div className="vp-contact-buttons" style={{ marginTop: "20px" }}>
                  <button onClick={() => { setSelectedProject(null); setShowInquiry(true); }} className="ll-btn ll-btn-secondary" style={{ flex: 1, padding: "13px" }}>📩 Contact Vendor</button>
                  <button onClick={() => { setSelectedProject(null); setShowQuote(true); }} className="ll-btn ll-btn-primary" style={{ flex: 1, padding: "13px" }}>📋 Get a Quote</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <Footer />
    </>
  );
};

export default VendorPublicProfile;
