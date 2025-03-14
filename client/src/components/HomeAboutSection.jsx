import React from "react";
import { Link, Links } from "react-router-dom";
import sung from "./img/sung-jin-cho--S87hxapFvU-unsplash.jpg";
import img from "./img/images(1).jpeg";

const HomeAboutSection = () => {
  return (
    <section className="home-about">
      <div className="home-about-container">
        {/* Text Content */}
        <div className="home-about-text">
          <h2>About Our Platform</h2>
          <p>
            We connect builders, contractors, and individuals with top-rated 
            elevator companies. Our platform ensures seamless communication 
            and access to trusted service providers for all your elevator needs.
          </p>
          <Link to="/About" className="home-about-btn">Learn More</Link>
        </div>

        {/* Image Content */}
        <div className="home-about-image">
          <img src={sung} alt="Elevator Services" />
        </div>
      </div>
    </section>
  );
};

export default HomeAboutSection;
