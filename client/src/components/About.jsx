import React from "react";
import sung from "./img/sung-jin-cho--S87hxapFvU-unsplash.jpg";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const About = () => {
  const features = [
    { icon: "🏢", title: "Verified Companies", desc: "Every vendor on LiftLink is manually vetted for authenticity and quality before going live." },
    { icon: "🤝", title: "Seamless Connection", desc: "Directly message, call, or request quotes from vendors without any middlemen." },
    { icon: "👤", title: "User-First Platform", desc: "Built for builders, contractors, and individuals who need reliable elevator services." },
    { icon: "📊", title: "Transparent Reviews", desc: "Read honest, verified customer reviews to make confident, informed decisions." },
    { icon: "⚡", title: "Fast Quotes", desc: "Submit a quote request in under 2 minutes and receive vendor responses quickly." },
    { icon: "🌐", title: "Pan-India Coverage", desc: "Find elevator partners in Mumbai, Pune, Delhi, Bangalore, and 50+ cities." },
  ];

  const stats = [
    { num: "500+", label: "Verified Vendors" },
    { num: "50+", label: "Cities Covered" },
    { num: "10K+", label: "Customers Served" },
    { num: "98%", label: "Satisfaction Rate" },
  ];

  return (
    <>
      <div style={{ background: "var(--ll-bg)" }}>
        {/* Hero */}
        <section style={{
          background: "linear-gradient(135deg, var(--ll-nav) 0%, #1E3A5F 100%)",
          padding: "100px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,.2) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "999px", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, color: "#93C5FD", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "24px" }}>
              About LiftLink
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>
              India's trusted elevator<br />services marketplace
            </h1>
            <p style={{ color: "rgba(255,255,255,.75)", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "36px", maxWidth: "540px", margin: "0 auto 36px" }}>
              Connecting builders, contractors, and individuals with verified elevator companies across India — seamlessly and efficiently.
            </p>
            <Link to="/Explore" style={{ display: "inline-flex", alignItems: "center", background: "var(--ll-primary)", color: "#fff", padding: "14px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "1rem", boxShadow: "0 4px 20px rgba(37,99,235,.5)" }}>
              Explore Companies →
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: "#fff", padding: "48px 24px", borderBottom: "1px solid var(--ll-border)" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "32px", textAlign: "center" }}>
            {stats.map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--ll-primary)", letterSpacing: "-0.03em", marginBottom: "4px" }}>{num}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--ll-text-2)", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* What We Do — split */}
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ll-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>What We Do</p>
              <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", fontWeight: 800, color: "var(--ll-text-1)", letterSpacing: "-0.02em", marginBottom: "20px", lineHeight: 1.2 }}>
                We simplify the way you find elevator partners
              </h2>
              <p style={{ color: "var(--ll-text-2)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "16px" }}>
                LiftLink bridges the gap between property owners, builders, and contractors on one side — and professional elevator service companies on the other.
              </p>
              <p style={{ color: "var(--ll-text-2)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "32px" }}>
                Whether you need a passenger lift installed, a freight elevator maintained, or an existing system modernised — we have a verified expert for you.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <Link to="/Explore" style={{ display: "inline-flex", background: "var(--ll-primary)", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>Explore Vendors</Link>
                <Link to="/logsign" style={{ display: "inline-flex", background: "transparent", color: "var(--ll-text-2)", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", border: "1.5px solid var(--ll-border)" }}>List Your Business</Link>
              </div>
            </div>
            <div>
              <img src={sung} alt="Elevator services" style={{ width: "100%", borderRadius: "20px", boxShadow: "var(--ll-shadow-xl)", objectFit: "cover", maxHeight: "380px" }} />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid var(--ll-border)", borderBottom: "1px solid var(--ll-border)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ll-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Why Choose Us</p>
              <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--ll-text-1)", letterSpacing: "-0.02em" }}>Built for every stakeholder</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {features.map(({ icon, title, desc }) => (
                <div key={title} style={{ background: "var(--ll-bg)", border: "1px solid var(--ll-border)", borderRadius: "16px", padding: "28px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{icon}</span>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ll-text-1)", marginBottom: "6px" }}>{title}</h3>
                    <p style={{ color: "var(--ll-text-2)", fontSize: "0.875rem", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission/Vision */}
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--ll-text-1)", letterSpacing: "-0.02em" }}>Our Mission & Vision</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {[
                { icon: "🎯", title: "Mission", text: "To make finding reliable elevator services as easy as a search. We believe every building deserves safe, efficient vertical transportation — and every owner deserves transparent access to quality vendors." },
                { icon: "🔭", title: "Vision", text: "To become the most trusted B2B platform for elevator services in India, enabling thousands of vendors and millions of customers to connect effortlessly across every city and state." },
              ].map(({ icon, title, text }) => (
                <div key={title} style={{ background: "#fff", border: "1px solid var(--ll-border)", borderRadius: "20px", padding: "36px 32px", boxShadow: "var(--ll-shadow-sm)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{icon}</div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ll-primary)", marginBottom: "12px" }}>{title}</h3>
                  <p style={{ color: "var(--ll-text-2)", lineHeight: 1.75, margin: 0 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
