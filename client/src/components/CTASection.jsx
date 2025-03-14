import React from "react";

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title">Elevate Your Business with Us</h2>
        <p className="cta-subtitle">
          Join our platform today and connect with top clients in the industry. Whether you're an elevator company, contractor, or individual, we make networking effortless.
        </p>
        <div className="cta-buttons">
          <a href="/vendor_register" className="cta-button">Register Now</a>
          <a href="/companies" className="cta-button secondary">Explore Companies</a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
