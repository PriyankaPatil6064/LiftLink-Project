import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import fred from "./img/fred-kleber-tSDsY-zvg5k-unsplash.jpg";
import sung from "./img/sung-jin-cho--S87hxapFvU-unsplash.jpg";
import mahad from "./img/mahad-aamir-Y-GnrESsjr0-unsplash.jpg";
import CTASection from "./CTASection";
import HomeAboutSection from "./HomeAboutSection";
import Footer from "./Footer";

const slides = [
  {
    img: fred,
    headline: "Elevate Your Standards",
    sub: "Seamless mobility solutions for modern buildings",
    cta: "Explore Vendors",
    to: "/Explore",
  },
  {
    img: sung,
    headline: "Where Innovation Meets Comfort",
    sub: "Discover India's finest elevator service companies",
    cta: "Get Started",
    to: "/Explore",
  },
  {
    img: mahad,
    headline: "Luxury in Every Level",
    sub: "Designed for excellence, built for safety",
    cta: "Find Partners",
    to: "/Explore",
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <>
      {/* Hero */}
      <section style={{ position: "relative", height: "90vh", minHeight: "560px", maxHeight: "800px", overflow: "hidden" }}>
        {/* Slide images */}
        {slides.map((s, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${s.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "opacity 1s ease",
            opacity: i === current ? 1 : 0,
          }} />
        ))}

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(10,20,50,.85) 40%, rgba(10,20,50,.4) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: "1200px", margin: "0 auto",
          padding: "0 40px",
          height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
            borderRadius: "999px", padding: "6px 16px",
            fontSize: "0.75rem", fontWeight: 600, color: "#93C5FD",
            letterSpacing: "0.06em", textTransform: "uppercase",
            marginBottom: "24px", width: "fit-content",
          }}>
            🛗 India's #1 Elevator Marketplace
          </div>

          {/* Headline */}
          <h1 key={current} style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "16px",
            maxWidth: "620px",
            animation: "fadeInUp 0.5s ease both",
          }}>
            {slide.headline}
          </h1>

          <p style={{
            color: "rgba(255,255,255,.8)",
            fontSize: "1.15rem",
            lineHeight: 1.6,
            marginBottom: "36px",
            maxWidth: "480px",
            animation: "fadeInUp 0.5s 0.1s ease both",
          }}>
            {slide.sub}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", animation: "fadeInUp 0.5s 0.2s ease both" }}>
            <Link to={slide.to} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "var(--ll-primary)",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 4px 20px rgba(37,99,235,.5)",
              transition: "all 200ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--ll-primary-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--ll-primary)"; e.currentTarget.style.transform = "none"; }}
            >
              {slide.cta} →
            </Link>
            <Link to="/logsign" style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(255,255,255,.12)",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
              border: "1.5px solid rgba(255,255,255,.25)",
              transition: "all 200ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; }}
            >
              List Your Business
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "40px",
            marginTop: "56px", paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,.15)",
            flexWrap: "wrap",
          }}>
            {[
              { num: "500+", label: "Verified Vendors" },
              { num: "50+", label: "Cities" },
              { num: "10K+", label: "Customers Served" },
            ].map(({ num, label }) => (
              <div key={label}>
                <span style={{ display: "block", fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>{num}</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide dots */}
        <div style={{
          position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "8px", zIndex: 2,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 24 : 8, height: 8,
              borderRadius: "999px",
              background: i === current ? "#fff" : "rgba(255,255,255,.4)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 300ms",
            }} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      <CTASection />
      <HomeAboutSection />
      <Footer />
    </>
  );
};

export default Home;
