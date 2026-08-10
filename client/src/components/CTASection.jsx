import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section style={{
      background: "linear-gradient(135deg, var(--ll-nav) 0%, #1E3A5F 100%)",
      padding: "80px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,.25) 0%, transparent 70%)",
      }} />

      <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)",
          borderRadius: "999px", padding: "6px 16px",
          fontSize: "0.75rem", fontWeight: 600, color: "#93C5FD",
          letterSpacing: "0.05em", textTransform: "uppercase",
          marginBottom: "24px",
        }}>
          🚀 Join LiftLink Today
        </div>

        <h2 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginBottom: "16px",
        }}>
          Elevate your business.<br />
          <span style={{ color: "#60A5FA" }}>Reach the right clients.</span>
        </h2>

        <p style={{
          color: "rgba(255,255,255,.7)",
          fontSize: "1.1rem",
          lineHeight: 1.7,
          marginBottom: "40px",
          maxWidth: "520px",
          margin: "0 auto 40px",
        }}>
          Whether you're an elevator company or looking for one — LiftLink connects you with verified partners across India.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/vendor_register" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "var(--ll-primary)",
            color: "#fff",
            padding: "14px 28px",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1rem",
            transition: "all 200ms",
            boxShadow: "0 4px 20px rgba(37,99,235,.4)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.transform = "none"; }}
          >
            Register Your Business →
          </Link>

          <Link to="/Explore" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,.1)",
            color: "#fff",
            padding: "14px 28px",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "1rem",
            border: "1.5px solid rgba(255,255,255,.25)",
            transition: "all 200ms",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.transform = "none"; }}
          >
            Explore Companies
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "48px", justifyContent: "center",
          marginTop: "56px", paddingTop: "40px",
          borderTop: "1px solid rgba(255,255,255,.12)",
          flexWrap: "wrap",
        }}>
          {[
            { num: "500+", label: "Verified Vendors" },
            { num: "10K+", label: "Happy Customers" },
            { num: "50+", label: "Cities Covered" },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{num}</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
