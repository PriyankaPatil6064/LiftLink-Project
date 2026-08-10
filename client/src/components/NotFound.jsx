import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ll-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "40px 24px",
    }}>
      {/* 404 number */}
      <div style={{
        fontSize: "clamp(5rem, 15vw, 9rem)",
        fontWeight: 900,
        color: "var(--ll-primary)",
        lineHeight: 1,
        marginBottom: "8px",
        opacity: 0.15,
        letterSpacing: "-0.05em",
        userSelect: "none",
      }}>
        404
      </div>

      <div style={{ fontSize: "3rem", marginBottom: "20px", marginTop: "-40px" }}>🔍</div>

      <h1 style={{
        fontSize: "clamp(1.5rem, 3vw, 2rem)",
        fontWeight: 800,
        color: "var(--ll-text-1)",
        letterSpacing: "-0.02em",
        marginBottom: "12px",
      }}>
        Page not found
      </h1>

      <p style={{
        color: "var(--ll-text-2)",
        maxWidth: "420px",
        lineHeight: 1.7,
        marginBottom: "36px",
        fontSize: "1rem",
      }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "var(--ll-primary)", color: "#fff",
          padding: "12px 24px", borderRadius: "10px",
          textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
          boxShadow: "var(--ll-shadow-primary)",
          transition: "all 150ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.transform = "none"; }}
        >
          🏠 Back to Home
        </Link>
        <Link to="/Explore" style={{
          display: "inline-flex", alignItems: "center",
          background: "#fff", color: "var(--ll-text-2)",
          padding: "12px 24px", borderRadius: "10px",
          textDecoration: "none", fontWeight: 600, fontSize: "0.9rem",
          border: "1.5px solid var(--ll-border)",
          transition: "all 150ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ll-text-3)"; e.currentTarget.style.color = "var(--ll-text-1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ll-border)"; e.currentTarget.style.color = "var(--ll-text-2)"; }}
        >
          Explore Vendors
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
