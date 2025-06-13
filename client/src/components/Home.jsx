import react from "react";
import { Link } from "react-router-dom";
import fred from "./img/fred-kleber-tSDsY-zvg5k-unsplash.jpg";
import sung from "./img/sung-jin-cho--S87hxapFvU-unsplash.jpg";
import mahad from "./img/mahad-aamir-Y-GnrESsjr0-unsplash.jpg";
import React, { useEffect } from "react"; // Import useEffect
import CTASection from "./CTASection";
import HomeAboutSection from "./HomeAboutSection";
import Footer from "./Footer";


const Home = () => {
  useEffect(() => {
    const myCarouselElement = document.querySelector("#carouselExampleAutoplaying");
    if (myCarouselElement) {
      new window.bootstrap.Carousel(myCarouselElement, {
        interval: 3000,
        touch: true,
      });
    }
  }, []);

  return (

    <>
      <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div class="overlay"></div>
            <img src={fred} className="d-block w-100" alt="First Slide" />
            <div class="carousel-caption">
              <h1 class="title">Elevate Your Standards</h1>
              <p class="subtitle">Seamless Mobility, Timeless Design</p>
              <Link to="/Explore" className="btn btn-beige">
                Explore Now
              </Link>
              {/* <a href="#" class="btn btn-beige">Explore Now</a> */}
            </div>
          </div>
          <div className="carousel-item">
            <div class="overlay"></div>
            <img src={sung} className="d-block w-100" alt="Second Slide" />
            <div class="carousel-caption">
              <h1 class="title">Where Innovation Meets Comfort</h1>
              <p class="subtitle">Discover the Finest Elevator Solutions</p>
              <Link to="/Explore" className="btn btn-beige">
                Get Started
              </Link>

            </div>
          </div>
          <div className="carousel-item">
            <div class="overlay"></div>
            <img src={mahad} className="d-block w-100" alt="Third Slide" />
            <div class="carousel-caption">
              <h1 class="title">Luxury in Every Level</h1>
              <p class="subtitle">Designed for Excellence and Safety</p>
              <Link to="/Explore" className="btn btn-beige">
                Find Your Elevator
              </Link>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
      < CTASection />
      < HomeAboutSection />
      < Footer />
    </>


  );
};

export default Home;
