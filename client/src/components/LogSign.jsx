import { Link } from "react-router-dom";

const LogSign = () => {
  const options = [
    {
      icon: "🏢",
      title: "Register Your Business",
      description: "List your elevator company on LiftLink. Receive verified quote requests and grow your client base.",
      loginTo: "/loginvendor",
      loginLabel: "Vendor Login",
      signupTo: "/vendor_register",
      signupLabel: "Register Business",
      badge: "For Vendors",
      badgeColor: "#EFF6FF",
      badgeTextColor: "#2563EB",
      accentColor: "#2563EB",
    },
    {
      icon: "👤",
      title: "Find Elevator Vendors",
      description: "Explore trusted elevator service providers, compare quotes, and connect with the right partner for your project.",
      loginTo: "/login",
      loginLabel: "User Login",
      signupTo: "/signup",
      signupLabel: "Create Account",
      badge: "For Users",
      badgeColor: "#F0FDF4",
      badgeTextColor: "#059669",
      accentColor: "#10B981",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--ll-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--ll-text-1)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "24px" }}>
          <span style={{ width: 36, height: 36, background: "var(--ll-primary)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.2rem" }}>🛗</span>
          LiftLink
        </Link>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--ll-text-1)", letterSpacing: "-0.03em", marginBottom: "12px" }}>
          How would you like to continue?
        </h1>
        <p style={{ color: "var(--ll-text-2)", fontSize: "1.1rem", maxWidth: "480px", margin: "0 auto" }}>
          Choose your role to get started with LiftLink
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        maxWidth: "720px",
        width: "100%",
      }}>
        {options.map((opt) => (
          <div key={opt.title} style={{
            background: "#fff",
            border: "1px solid var(--ll-border)",
            borderRadius: "20px",
            padding: "36px 32px",
            boxShadow: "var(--ll-shadow-sm)",
            display: "flex",
            flexDirection: "column",
            transition: "all 200ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-lg)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = opt.accentColor; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--ll-shadow-sm)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--ll-border)"; }}
          >
            {/* Badge */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{
                display: "inline-block",
                background: opt.badgeColor,
                color: opt.badgeTextColor,
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: "999px",
                letterSpacing: "0.04em",
              }}>{opt.badge}</span>
            </div>

            {/* Icon */}
            <div style={{
              width: 60, height: 60,
              background: opt.badgeColor,
              borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem",
              marginBottom: "20px",
            }}>{opt.icon}</div>

            {/* Content */}
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ll-text-1)", marginBottom: "10px", letterSpacing: "-0.01em" }}>{opt.title}</h2>
            <p style={{ color: "var(--ll-text-2)", fontSize: "0.9rem", lineHeight: 1.65, flex: 1, marginBottom: "28px" }}>{opt.description}</p>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to={opt.signupTo} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: opt.accentColor,
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "all 150ms",
                boxShadow: `0 4px 12px ${opt.accentColor}33`,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >{opt.signupLabel}</Link>

              <Link to={opt.loginTo} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent",
                color: opt.accentColor,
                padding: "11px 20px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: `1.5px solid ${opt.accentColor}40`,
                transition: "all 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = opt.badgeColor; e.currentTarget.style.borderColor = opt.accentColor; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${opt.accentColor}40`; }}
              >{opt.loginLabel}</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Admin link */}
      <p style={{ marginTop: "40px", color: "var(--ll-text-3)", fontSize: "0.8rem" }}>
        Admin?{" "}
        <Link to="/admin/login" style={{ color: "var(--ll-text-2)", fontWeight: 500 }}>Admin Portal →</Link>
      </p>
    </div>
  );
};

export default LogSign;
