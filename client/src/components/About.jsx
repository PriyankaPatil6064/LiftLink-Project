import React from "react";
import sung from "./img/sung-jin-cho--S87hxapFvU-unsplash.jpg";
import { FaBuilding, FaHandshake, FaUserTie } from "react-icons/fa";
const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <h1 className="about-title">About Our Platform</h1>
        <p className="about-subtitle">
          Connecting builders, contractors, and individuals with top elevator companies.
        </p>
        <a href="/Explore" className="cta-button">Explore Companies</a>
      </div>

      {/* What We Do Section */}
      <div className="about-section">
        <div className="about-text">
          <h2 className="section-title">What We Do</h2>
          <p>
            Our platform serves as a bridge between users and trusted elevator companies. 
            Whether you're a **contractor, builder, or individual**, you can explore, compare, 
            and connect with elevator service providers to find the best solutions.
          </p>
        </div>
        <div className="about-image">
          <img src={sung} alt="Elevator" />
        </div>
      </div>

      {/* Why Choose Us Section */}
      <h2 className="section-title">Features</h2>

      <div className="about-highlights">
        <div>
          <h3>Verified Elevator Companies</h3>
          <p>We list only verified and trusted businesses.</p>
        </div>
        <div>
          <h3>Easy-to-Use Platform</h3>
          <p>Search, explore, and connect effortlessly.</p>
        </div>
        <div>
          <h3>Seamless Communication</h3>
          <p>Get in touch with elevator companies directly.</p>
        </div>
      </div>
      <section className="what-we-do">
      <h2 className="section-title">What We Offer</h2>
      <div className="what-we-do-container">
        <div className="what-we-do-card">
          <FaBuilding size={40} color="#f8e3a1" />
          <h3>For Elevator Companies</h3>
          <p>Register your business and connect with potential clients effortlessly.</p>
        </div>

        <div className="what-we-do-card">
          <FaHandshake size={40} color="#f8e3a1" />
          <h3>For Contractors</h3>
          <p>Find top-rated elevator companies for your projects with ease.</p>
        </div>

        <div className="what-we-do-card">
          <FaUserTie size={40} color="#f8e3a1" />
          <h3>For Individuals</h3>
          <p>Search and explore the best elevator services for your needs.</p>
        </div>
      </div>
    </section>


    <section className="mission-vision-section">
      <h2 className="section-title">Our Mission & Vision</h2>
      <div className="mission-vision-container">
        
        <div className="mission-box">
          <h3 >Our Mission</h3>
          <p>
            We aim to bridge the gap between elevator companies and potential clients by providing 
            a seamless, high-quality platform for registration, discovery, and collaboration.
          </p>
        </div>
        
        <div className="vision-box">
          <h3>Our Vision</h3>
          <p>
            To become the leading digital hub for elevator industry professionals, offering 
            cutting-edge solutions that enhance connectivity, trust, and business growth.
          </p>
        </div>

      </div>
    </section>
    </div>
    
  );
};

export default About;
