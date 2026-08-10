import React from "react";
import { Link } from "react-router-dom";
import b2b1 from "./img/b2b1.jpg";

const HomeAboutSection = () => {
  const features = [
    { icon: "🏆", title: "Verified Vendors", desc: "Every listing is manually reviewed for quality and authenticity." },
    { icon: "⚡", title: "Instant Quotes", desc: "Submit quote requests in seconds and get responses within 24 hours." },
    { icon: "🛡️", title: "Trusted Reviews", desc: "Read verified customer reviews to make confident decisions." },
    { icon: "🌐", title: "All of India", desc: "Find elevator services in your city with localised search." },
  ];

  return (
    <section style={{ background: "var(--ll-bg)", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Feature Grid */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ll-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Why LiftLink</p>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--ll-text-1)", letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Everything you need in one place
          </h2>
          <p style={{ color: "var(--ll-text-2)", fontSize: "1.05rem", maxWidth: "540px", margin: "0 auto" }}>
            LiftLink simplifies the way you find and connect with elevator service providers.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginBottom: "80px",
        }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: "#fff",
              border: "1px solid var(--ll-border)",
              borderRadius: "16px",
              padding: "28px 24px",
              boxShadow: "var(--ll-shadow-sm)",
              transition: "all 200ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-sm)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{
                width: 48, height: 48,
                background: "var(--ll-primary-light)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", marginBottom: "16px",
              }}>{icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ll-text-1)", marginBottom: "8px" }}>{title}</h3>
              <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem", lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* About Split */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "center",
        }}>
          {/* Image */}
          <div>
            <img
              src={b2b1}
              alt="LiftLink elevator services"
              style={{
                width: "100%",
                borderRadius: "20px",
                boxShadow: "var(--ll-shadow-xl)",
                objectFit: "cover",
                maxHeight: "380px",
              }}
            />
          </div>

          {/* Text */}
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ll-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Our Platform</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 800, color: "var(--ll-text-1)", letterSpacing: "-0.02em", marginBottom: "16px", lineHeight: 1.2 }}>
              Connecting builders with the right elevator partners
            </h2>
            <p style={{ color: "var(--ll-text-2)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "16px" }}>
              We connect builders, contractors, and individuals with top-rated elevator companies across India. Our platform ensures seamless communication and access to trusted service providers for all your vertical mobility needs.
            </p>
            <p style={{ color: "var(--ll-text-2)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "32px" }}>
              From passenger lifts to freight elevators, home lifts to modernisation services — LiftLink has a verified vendor for every requirement.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/Explore" style={{
                display: "inline-flex", alignItems: "center",
                background: "var(--ll-primary)", color: "#fff",
                padding: "12px 24px", borderRadius: "10px",
                textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                transition: "all 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.transform = "none"; }}
              >Explore Vendors</Link>
              <Link to="/about" style={{
                display: "inline-flex", alignItems: "center",
                background: "transparent", color: "var(--ll-text-2)",
                padding: "12px 24px", borderRadius: "10px",
                textDecoration: "none", fontWeight: 600, fontSize: "0.9rem",
                border: "1.5px solid var(--ll-border)",
                transition: "all 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ll-text-3)"; e.currentTarget.style.color = "var(--ll-text-1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ll-border)"; e.currentTarget.style.color = "var(--ll-text-2)"; }}
              >Learn More</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .home-about-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default HomeAboutSection;
