import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
     

      <div className="container">
        <div className="row">

          {/* Quick Links Section */}
          <div className="col-md-4 footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">🏠Home</a></li>
              <li><a href="/explore">🔍Explore Vendors</a></li>
              <li><a href="/about">📖About Us</a></li>
              <li><a href="/contact">📩Contact Us</a></li>
              <li><a href="/terms">⚖️Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact Information Section */}
          <div className="col-md-4 footer-section">
            <h4 className="footer-title-2">Let's Connect</h4>
            <p className="footer-text">📍 Nashik, Maharashtra, India</p>
            <p id="footer-text-2"><a href="mailto:liftlink@gmail.com">📧 liftlink@gmail.com</a></p>
            <p className="footer-text">📞 +91 75142 68514</p>
          </div>

          {/* Social Media Links Section */}
          <div className="col-md-4 footer-section">
            <h4 className="footer-title">Follow Us</h4>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>

        </div>
      </div>

      {/* Horizontal Divider Line */}
      <hr className="footer-line" />
      
      {/* Copyright Section */}
      <p className="footer-copyright">
        © 2025 <span>liftlink</span>. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
