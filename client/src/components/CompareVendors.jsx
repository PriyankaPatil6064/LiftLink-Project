import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import Footer from "./Footer";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const StarDisplay = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.15)", fontSize: "1rem" }}>★</span>
    ))}
  </span>
);

const CompareVendors = () => {
  const [searchParams] = useSearchParams();
  const [vendors, setVendors] = useState([null, null]);
  const [search, setSearch] = useState(["", ""]);
  const [results, setResults] = useState([[], []]);
  const [searching, setSearching] = useState([false, false]);

  // Pre-load vendors from URL params (e.g., /compare?a=id1&b=id2)
  useEffect(() => {
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    const loadVendor = async (id, idx) => {
      try {
        const res = await api.get(`/api/vendor/${id}`);
        setVendors((prev) => { const n = [...prev]; n[idx] = res.data; return n; });
      } catch {}
    };
    if (a) loadVendor(a, 0);
    if (b) loadVendor(b, 1);
  }, [searchParams]);

  const handleSearch = async (idx, q) => {
    if (!q.trim()) { setResults((prev) => { const n = [...prev]; n[idx] = []; return n; }); return; }
    setSearching((prev) => { const n = [...prev]; n[idx] = true; return n; });
    try {
      const res = await api.get(`/api/vendor/all?search=${encodeURIComponent(q)}&limit=5`);
      setResults((prev) => { const n = [...prev]; n[idx] = res.data.vendors; return n; });
    } catch {
      toast.error("Search failed.");
    } finally {
      setSearching((prev) => { const n = [...prev]; n[idx] = false; return n; });
    }
  };

  const selectVendor = (idx, vendor) => {
    setVendors((prev) => { const n = [...prev]; n[idx] = vendor; return n; });
    setSearch((prev) => { const n = [...prev]; n[idx] = ""; return n; });
    setResults((prev) => { const n = [...prev]; n[idx] = []; return n; });
  };

  const removeVendor = (idx) => {
    setVendors((prev) => { const n = [...prev]; n[idx] = null; return n; });
  };

  const rows = [
    { label: "Company Name", key: "companyName" },
    { label: "Type", key: "companyType" },
    { label: "Location", key: "location" },
    { label: "Experience", render: (v) => v.experience ? `${v.experience} years` : "—" },
    { label: "Team Size", key: "teamSize" },
    { label: "Average Rating", render: (v) => v.averageRating ? <><StarDisplay rating={v.averageRating} /> {v.averageRating}/5</> : "No reviews" },
    { label: "Total Reviews", key: "totalReviews" },
    { label: "Lift Categories", render: (v) => v.liftCategories?.join(", ") || "—" },
    { label: "Service Cities", render: (v) => v.serviceCities?.slice(0, 3).join(", ") + (v.serviceCities?.length > 3 ? "..." : "") || "—" },
    { label: "Services Count", render: (v) => v.services?.length || 0 },
    { label: "Projects", render: (v) => v.projects?.length || 0 },
    { label: "Verified", render: (v) => v.isVerified ? <span style={{ color: "#6ef08a" }}>✓ Verified</span> : <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span> },
  ];

  return (
    <>
      <div style={{ minHeight: "calc(100vh - 56px)", background: "#0A192F", padding: "2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h1 style={{ color: "#f8e3a1", fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", fontWeight: 700 }}>
              Compare Vendors
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
              Select two vendors to compare them side by side.
            </p>
          </div>

          {/* Vendor Selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            {[0, 1].map((idx) => (
              <div key={idx}>
                {!vendors[idx] ? (
                  <div style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1.5rem",
                    border: "2px dashed rgba(212,175,55,0.25)",
                  }}>
                    <p style={{ color: "#d4af37", fontWeight: 600, marginBottom: "1rem", textAlign: "center" }}>
                      Select Vendor {idx + 1}
                    </p>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Search by company name..."
                        value={search[idx]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearch((prev) => { const n = [...prev]; n[idx] = val; return n; });
                          handleSearch(idx, val);
                        }}
                        style={{
                          width: "100%", padding: "0.65rem 1rem",
                          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(212,175,55,0.25)",
                          borderRadius: "8px", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
                        }}
                      />
                      {searching[idx] && <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#d4af37", fontSize: "0.75rem" }}>...</span>}
                      {results[idx].length > 0 && (
                        <div style={{
                          position: "absolute", top: "100%", left: 0, right: 0,
                          background: "#0d2137", border: "1px solid rgba(212,175,55,0.2)",
                          borderRadius: "8px", zIndex: 50, maxHeight: "200px", overflowY: "auto",
                        }}>
                          {results[idx].map((v) => (
                            <button key={v._id} onClick={() => selectVendor(idx, v)} style={{
                              display: "block", width: "100%", textAlign: "left",
                              padding: "0.65rem 1rem", background: "transparent",
                              border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)",
                              color: "#f8e3a1", cursor: "pointer", fontSize: "0.875rem",
                            }}>
                              {v.companyName}
                              <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: "0.5rem", fontSize: "0.75rem" }}>
                                {v.location}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1.25rem",
                    border: "1px solid rgba(212,175,55,0.25)", textAlign: "center",
                  }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "10px", background: "#1F4068", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", margin: "0 auto 0.75rem" }}>
                      {vendors[idx].logo
                        ? <img src={`${API_BASE}/uploads/${vendors[idx].logo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                        : "🏢"}
                    </div>
                    <p style={{ color: "#f8e3a1", fontWeight: 700, margin: "0 0 0.25rem" }}>{vendors[idx].companyName}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 0.75rem", fontSize: "0.8rem" }}>📍 {vendors[idx].location || "—"}</p>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <Link to={`/vendor/${vendors[idx]._id}`} style={{
                        padding: "0.4rem 0.9rem", background: "rgba(212,175,55,0.15)",
                        border: "1px solid rgba(212,175,55,0.35)", color: "#d4af37",
                        borderRadius: "6px", textDecoration: "none", fontSize: "0.8rem",
                      }}>View Profile</Link>
                      <button onClick={() => removeVendor(idx)} style={{
                        padding: "0.4rem 0.75rem", background: "rgba(255,107,107,0.1)",
                        border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b",
                        borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem",
                      }}>✕ Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          {vendors[0] && vendors[1] && (
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: "12px",
              border: "1px solid rgba(212,175,55,0.1)", overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(212,175,55,0.1)", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
                    <th style={{ padding: "1rem 1.5rem", color: "#d4af37", fontSize: "0.85rem", fontWeight: 600, textAlign: "left", width: "30%" }}>Attribute</th>
                    <th style={{ padding: "1rem 1.5rem", color: "#f8e3a1", fontSize: "0.9rem", fontWeight: 700, textAlign: "center" }}>{vendors[0].companyName}</th>
                    <th style={{ padding: "1rem 1.5rem", color: "#f8e3a1", fontSize: "0.9rem", fontWeight: 700, textAlign: "center" }}>{vendors[1].companyName}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ label, key, render }, i) => (
                    <tr key={label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td style={{ padding: "0.85rem 1.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>{label}</td>
                      {[0, 1].map((idx) => (
                        <td key={idx} style={{ padding: "0.85rem 1.5rem", color: "rgba(255,255,255,0.85)", fontSize: "0.875rem", textAlign: "center" }}>
                          {render ? render(vendors[idx]) : (vendors[idx][key] || "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
                {vendors.map((v, idx) => v && (
                  <Link key={idx} to={`/vendor/${v._id}`} style={{
                    padding: "0.7rem 1.75rem", background: "linear-gradient(135deg, #d4af37, #f8e3a1)",
                    color: "#0a192f", borderRadius: "8px", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem",
                  }}>View {v.companyName}</Link>
                ))}
              </div>
            </div>
          )}

          {(!vendors[0] || !vendors[1]) && (
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: "12px",
              border: "1px dashed rgba(212,175,55,0.15)", padding: "4rem",
              textAlign: "center", color: "rgba(255,255,255,0.35)",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚖️</div>
              <p>Select both vendors above to see a comparison.</p>
              <Link to="/Explore" style={{ color: "#d4af37", textDecoration: "none" }}>Browse vendors →</Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompareVendors;
