import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, vendor, logout, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const servicesRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    navigate("/");
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/Explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const displayName = isVendor
    ? vendor?.companyName || vendor?.fullname
    : user?.username || user?.fullName;

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const isActive = (path) => location.pathname === path;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) setServicesOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid var(--ll-border)",
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "var(--ll-shadow-xs)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
        }}>
          {/* Brand */}
          <Link to="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "var(--ll-text-1)",
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}>
            <span style={{
              width: 32, height: 32,
              background: "var(--ll-primary)",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "1.1rem",
            }}>🛗</span>
            LiftLink
          </Link>

          {/* Desktop Nav Links */}
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            flex: 1, justifyContent: "center",
          }} className="ll-desktop-nav">
            {[
              { to: "/", label: "Home" },
              { to: "/Explore", label: "Explore" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                color: isActive(to) ? "var(--ll-primary)" : "var(--ll-text-2)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive(to) ? 600 : 500,
                padding: "6px 12px",
                borderRadius: "8px",
                transition: "all 150ms",
                background: isActive(to) ? "var(--ll-primary-light)" : "transparent",
              }}
              onMouseEnter={e => { if (!isActive(to)) e.target.style.background = "var(--ll-surface-2)"; }}
              onMouseLeave={e => { if (!isActive(to)) e.target.style.background = "transparent"; }}
              >
                {label}
              </Link>
            ))}

            {/* Services Dropdown */}
            <div ref={servicesRef} style={{ position: "relative" }}>
              <button onClick={() => setServicesOpen(!servicesOpen)} style={{
                color: "var(--ll-text-2)",
                background: "none",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: "4px",
                transition: "all 150ms",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--ll-surface-2)"}
              onMouseLeave={e => { if (!servicesOpen) e.currentTarget.style.background = "transparent"; }}
              >
                Services
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: servicesOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {servicesOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "#fff",
                  border: "1px solid var(--ll-border)",
                  borderRadius: "12px",
                  boxShadow: "var(--ll-shadow-lg)",
                  padding: "8px",
                  minWidth: "180px",
                  zIndex: 300,
                  animation: "ll-slide-up 0.15s ease both",
                }}>
                  {[
                    { to: "/Explore?category=Elevators", label: "🏗️ Elevators" },
                    { to: "/Explore?category=Installation", label: "🔧 Installation" },
                    { to: "/Explore?category=Modernization", label: "⚡ Modernization" },
                  ].map(({ to, label }) => (
                    <Link key={to} to={to} onClick={() => setServicesOpen(false)} style={{
                      display: "block",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      color: "var(--ll-text-1)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      transition: "background 150ms",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--ll-surface-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >{label}</Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard link */}
            {isVendor && (
              <Link to="/vendorDashboard" style={{
                color: isActive("/vendorDashboard") ? "var(--ll-primary)" : "var(--ll-text-2)",
                textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
                padding: "6px 12px", borderRadius: "8px",
              }}>Dashboard</Link>
            )}
            {!isVendor && user && (
              <Link to="/userDashboard" style={{
                color: isActive("/userDashboard") ? "var(--ll-primary)" : "var(--ll-text-2)",
                textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
                padding: "6px 12px", borderRadius: "8px",
              }}>My Dashboard</Link>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "6px" }} className="ll-desktop-search">
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                  color: "var(--ll-text-3)", fontSize: "0.85rem", pointerEvents: "none",
                }}>🔍</span>
                <input
                  type="search"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "1.5px solid var(--ll-border)",
                    borderRadius: "8px",
                    padding: "6px 12px 6px 32px",
                    fontSize: "0.8rem",
                    fontFamily: "var(--ll-font)",
                    color: "var(--ll-text-1)",
                    background: "var(--ll-surface-2)",
                    width: "180px",
                    outline: "none",
                    transition: "all 150ms",
                  }}
                  onFocus={e => { e.target.style.borderColor = "var(--ll-primary)"; e.target.style.background = "#fff"; e.target.style.width = "220px"; }}
                  onBlur={e => { e.target.style.borderColor = "var(--ll-border)"; e.target.style.background = "var(--ll-surface-2)"; e.target.style.width = "180px"; }}
                />
              </div>
            </form>

            {/* Auth */}
            {isAuthenticated ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "var(--ll-surface-2)",
                  border: "1.5px solid var(--ll-border)",
                  borderRadius: "var(--ll-r-full)",
                  padding: "4px 12px 4px 4px",
                  cursor: "pointer",
                  transition: "all 150ms",
                  fontFamily: "var(--ll-font)",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--ll-text-3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--ll-border)"}
                >
                  <span style={{
                    width: 28, height: 28,
                    borderRadius: "50%",
                    background: "var(--ll-primary)",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
                  }}>{initials}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--ll-text-1)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                  </span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="var(--ll-text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "#fff", border: "1px solid var(--ll-border)",
                    borderRadius: "12px", boxShadow: "var(--ll-shadow-lg)",
                    padding: "8px", minWidth: "180px", zIndex: 300,
                    animation: "ll-slide-up 0.15s ease both",
                  }}>
                    <Link to={isVendor ? "/vendorDashboard" : "/userDashboard"}
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: "block", padding: "8px 12px", borderRadius: "8px", color: "var(--ll-text-1)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, marginBottom: "2px" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--ll-surface-2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      📊 Dashboard
                    </Link>
                    <div style={{ height: "1px", background: "var(--ll-border)", margin: "4px 0" }} />
                    <button onClick={handleLogout} style={{
                      display: "block", width: "100%", padding: "8px 12px",
                      borderRadius: "8px", color: "var(--ll-danger)", background: "none",
                      border: "none", fontSize: "0.875rem", fontWeight: 500,
                      textAlign: "left", cursor: "pointer", fontFamily: "var(--ll-font)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--ll-danger-bg)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link to="/logsign" style={{
                  color: "var(--ll-text-2)", textDecoration: "none",
                  fontSize: "0.875rem", fontWeight: 500,
                  padding: "7px 16px", borderRadius: "8px",
                  border: "1.5px solid var(--ll-border)",
                  transition: "all 150ms", background: "#fff",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ll-text-3)"; e.currentTarget.style.background = "var(--ll-surface-2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ll-border)"; e.currentTarget.style.background = "#fff"; }}
                >Log in</Link>
                <Link to="/logsign" style={{
                  color: "#fff", textDecoration: "none",
                  fontSize: "0.875rem", fontWeight: 600,
                  padding: "7px 16px", borderRadius: "8px",
                  background: "var(--ll-primary)",
                  border: "1.5px solid var(--ll-primary)",
                  transition: "all 150ms",
                  boxShadow: "var(--ll-shadow-primary)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.transform = "none"; }}
                >Get Started</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="ll-mobile-menu-btn" style={{
              display: "none",
              background: "none", border: "none", cursor: "pointer", padding: "8px",
              borderRadius: "8px", color: "var(--ll-text-1)",
            }}>
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 150,
          background: "rgba(15,23,42,.5)", backdropFilter: "blur(4px)",
        }} onClick={() => setMobileOpen(false)}>
          <div style={{
            position: "absolute", top: 64, left: 0, right: 0,
            background: "#fff",
            borderBottom: "1px solid var(--ll-border)",
            padding: "16px",
            boxShadow: "var(--ll-shadow-lg)",
          }} onClick={e => e.stopPropagation()}>
            {/* Mobile search */}
            <form onSubmit={handleSearch} style={{ marginBottom: "16px" }}>
              <input
                type="search"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", border: "1.5px solid var(--ll-border)", borderRadius: "10px",
                  padding: "10px 14px", fontSize: "0.9rem", fontFamily: "var(--ll-font)",
                  color: "var(--ll-text-1)", outline: "none",
                }}
              />
            </form>
            {[
              { to: "/", label: "🏠 Home" },
              { to: "/Explore", label: "🔍 Explore" },
              { to: "/about", label: "📖 About" },
              { to: "/contact", label: "📩 Contact" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                display: "block", padding: "12px 14px", borderRadius: "10px",
                color: "var(--ll-text-1)", textDecoration: "none",
                fontSize: "0.9rem", fontWeight: 500, marginBottom: "4px",
                background: isActive(to) ? "var(--ll-primary-light)" : "transparent",
              }}>{label}</Link>
            ))}
            {isVendor && <Link to="/vendorDashboard" style={{ display: "block", padding: "12px 14px", borderRadius: "10px", color: "var(--ll-text-1)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, marginBottom: "4px" }}>📊 Dashboard</Link>}
            {!isVendor && user && <Link to="/userDashboard" style={{ display: "block", padding: "12px 14px", borderRadius: "10px", color: "var(--ll-text-1)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, marginBottom: "4px" }}>📊 My Dashboard</Link>}
            <div style={{ height: "1px", background: "var(--ll-border)", margin: "8px 0" }} />
            {isAuthenticated ? (
              <button onClick={handleLogout} style={{
                width: "100%", padding: "12px 14px", borderRadius: "10px",
                background: "var(--ll-danger-bg)", color: "var(--ll-danger)",
                border: "none", fontSize: "0.9rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--ll-font)", textAlign: "left",
              }}>🚪 Sign Out</button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link to="/logsign" style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1.5px solid var(--ll-border)", color: "var(--ll-text-1)", textDecoration: "none", textAlign: "center", fontSize: "0.9rem", fontWeight: 500 }}>Log in</Link>
                <Link to="/logsign" style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "var(--ll-primary)", color: "#fff", textDecoration: "none", textAlign: "center", fontSize: "0.9rem", fontWeight: 600 }}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .ll-desktop-nav, .ll-desktop-search { display: none !important; }
          .ll-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
