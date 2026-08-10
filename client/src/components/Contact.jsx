import React from "react";
import Footer from "./Footer";

const Contact = () => {
  const contacts = [
    { icon: "📍", label: "Address", value: "Nashik, Maharashtra, India" },
    { icon: "📧", label: "Email", value: "liftlink@gmail.com", href: "mailto:liftlink@gmail.com" },
    { icon: "📞", label: "Phone", value: "+91 75142 68514", href: "tel:+917514268514" },
    { icon: "⏰", label: "Hours", value: "Mon–Sat, 9:00 AM – 6:00 PM" },
  ];

  const socials = [
    { icon: "fab fa-facebook-f", label: "Facebook", href: "https://facebook.com" },
    { icon: "fab fa-instagram", label: "Instagram", href: "https://instagram.com" },
    { icon: "fab fa-linkedin-in", label: "LinkedIn", href: "https://linkedin.com" },
    { icon: "fab fa-twitter", label: "Twitter", href: "https://twitter.com" },
  ];

  return (
    <>
      <div style={{ background: "var(--ll-bg)" }}>
        {/* Hero */}
        <section style={{
          background: "linear-gradient(135deg, var(--ll-nav) 0%, #1E3A5F 100%)",
          padding: "80px 24px 72px",
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,.2) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: "580px", margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "999px", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 600, color: "#93C5FD", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "20px" }}>
              Get In Touch
            </div>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "16px" }}>
              We're here to help you
            </h1>
            <p style={{ color: "rgba(255,255,255,.7)", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Have a question or need support? Drop us a message and our team will get back to you shortly.
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section style={{ padding: "64px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "64px" }}>
              {contacts.map(({ icon, label, value, href }) => (
                <div key={label} style={{
                  background: "#fff",
                  border: "1px solid var(--ll-border)",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  boxShadow: "var(--ll-shadow-sm)",
                  textAlign: "center",
                  transition: "all 200ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-sm)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{icon}</div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ll-text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>{label}</p>
                  {href ? (
                    <a href={href} style={{ color: "var(--ll-primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>{value}</a>
                  ) : (
                    <p style={{ color: "var(--ll-text-1)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Center CTA */}
            <div style={{
              background: "#fff",
              border: "1px solid var(--ll-border)",
              borderRadius: "24px",
              padding: "56px 40px",
              textAlign: "center",
              boxShadow: "var(--ll-shadow-sm)",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>💬</div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--ll-text-1)", letterSpacing: "-0.02em", marginBottom: "12px" }}>Send us an email</h2>
              <p style={{ color: "var(--ll-text-2)", marginBottom: "28px", maxWidth: "460px", margin: "0 auto 28px", lineHeight: 1.7 }}>
                For any queries, vendor inquiries, or platform support — drop us a line at our email and we'll respond within one business day.
              </p>
              <a href="mailto:liftlink@gmail.com" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "var(--ll-primary)", color: "#fff",
                padding: "14px 28px", borderRadius: "12px",
                textDecoration: "none", fontWeight: 700, fontSize: "1rem",
                boxShadow: "var(--ll-shadow-primary)",
                transition: "all 200ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.transform = "none"; }}
              >
                📧 Email Us
              </a>

              {/* Social */}
              <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--ll-border)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--ll-text-3)", marginBottom: "16px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em" }}>Follow Us</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  {socials.map(({ icon, label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{
                      width: 40, height: 40,
                      borderRadius: "10px",
                      background: "var(--ll-surface-2)",
                      color: "var(--ll-text-2)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      textDecoration: "none", fontSize: "0.9rem",
                      border: "1px solid var(--ll-border)",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--ll-primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--ll-surface-2)"; e.currentTarget.style.color = "var(--ll-text-2)"; e.currentTarget.style.borderColor = "var(--ll-border)"; }}
                    >
                      <i className={icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
