import React from "react";
import sung from "./img/sung-jin-cho--S87hxapFvU-unsplash.jpg";

const Contact = () => {

  return (
    <div className="container-fluid contact-wrapper">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Side - Image */}
          <div className="col-md-6 text-center">
            {/* <img src={sung} className="d-block w-100" alt="Second Slide" /> */}

          </div>

          {/* Right Side - Content */}
          <div className=" contact-des col-md-6 text-center">
            <h1 className="contact-title">We are here for you</h1>
            <p className="contact-description">
              Our team is here to help you. Get in touch with us for any queries or support.
              Just drop a mail for any kind of support!
            </p>
            <p className="contact-info">
              <center><a href="liftlink@gmail.com">liftlink@gmail.com</a></center>

            </p>
            {/* <p className="contact-info">
              <i className="fas fa-phone"></i> +91 XXXXX XXXXX
            </p> */}

            {/* Horizontal Line */}
            <hr className="contact-line" />

            {/* Social Media Links */}
            <div className="social-links">
              <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin"></i></a>
              <a href="#"><i className="fa-brands fa-twitter"></i></a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
