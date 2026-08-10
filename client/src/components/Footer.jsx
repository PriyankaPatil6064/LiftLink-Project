import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "var(--ll-nav)",
      color: "rgba(255,255,255,.7)",
      padding: "64px 0 32px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "48px",
          marginBottom: "48px",
        }}>
          {/* Brand Column */}
          <div style={{ gridColumn: "span 1" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#fff", fontWeight: 700, fontSize: "1.125rem", letterSpacing: "-0.02em", marginBottom: "16px" }}>
              <span style={{ width: 32, height: 32, background: "var(--ll-primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🛗</span>
              LiftLink
            </Link>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "220px", marginBottom: "24px" }}>
              India's trusted marketplace for elevator companies and services.
            </p>
            {/* Social Icons */}
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { href: "https://facebook.com", label: "Facebook", icon: "f" },
                { href: "https://instagram.com", label: "Instagram", icon: "in" },
                { href: "https://linkedin.com", label: "LinkedIn", icon: "li" },
                { href: "https://twitter.com", label: "Twitter", icon: "tw" },
              ].map(({ href, label, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{
                    width: 36, height: 36,
                    borderRadius: "8px",
                    background: "rgba(255,255,255,.08)",
                    color: "rgba(255,255,255,.7)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
                >
                  <i className={`fab fa-${label.toLowerCase()}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "rgba(255,255,255,.45)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Platform</h4>
            {[
              { to: "/", label: "Home" },
              { to: "/Explore", label: "Explore Vendors" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                color: "rgba(255,255,255,.65)", textDecoration: "none",
                fontSize: "0.875rem", display: "block",
                marginBottom: "10px", transition: "color 150ms",
              }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.65)"}
              >{label}</Link>
            ))}
          </div>

          {/* For Vendors */}
          <div>
            <h4 style={{ color: "rgba(255,255,255,.45)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>For Vendors</h4>
            {[
              { to: "/vendor_register", label: "Register Business" },
              { to: "/loginvendor", label: "Vendor Login" },
              { to: "/vendorDashboard", label: "Dashboard" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                color: "rgba(255,255,255,.65)", textDecoration: "none",
                fontSize: "0.875rem", display: "block",
                marginBottom: "10px", transition: "color 150ms",
              }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.65)"}
              >{label}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "rgba(255,255,255,.45)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Contact</h4>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: "0.875rem", marginBottom: "10px" }}>📍 Nashik, Maharashtra, India</p>
            <a href="mailto:liftlink@gmail.com" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "0.875rem", display: "block", marginBottom: "10px", transition: "color 150ms" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.65)"}
            >📧 liftlink@gmail.com</a>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: "0.875rem", marginBottom: "10px" }}>📞 +91 75142 68514</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,.1)", marginBottom: "24px" }} />

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,.35)", margin: 0 }}>
            © {year} <strong style={{ color: "rgba(255,255,255,.5)" }}>LiftLink</strong>. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,.35)" }}>Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
