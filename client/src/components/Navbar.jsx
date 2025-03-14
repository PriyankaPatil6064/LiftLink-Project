import React from "react";

import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <nav
        className="navbar navbar-expand-lg"
        style={{ backgroundColor: "#001F3F" }}
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            LIFTLINK
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className="nav-link active" id="homelink">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Explore" className="nav-link">
                  Explore
                </Link>
              </li>

              <li className="nav-item dropdown">
  <Link className="nav-link dropdown-toggle" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
    Services
  </Link>
  <ul className="dropdown-menu">
    <li><Link to="/elevators" className="dropdown-item">Elevators</Link></li>
    <li><Link to="/escalators" className="dropdown-item">Escalators</Link></li>          
    <li><Link to="/fabrication" className="dropdown-item">Fabrication</Link></li>    
  </ul>
</li>

              <li className="nav-item">
                <Link to="/Contact" className="nav-link">
                  Contact
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/About" className="nav-link">
                  About Us
                </Link>
              </li>
            </ul>
            <form className="d-flex" role="search">
              <input
                id="searchbar"
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button
                id="searchbtn"
                className="btn btn-outline-success"
                type="submit"
              >
                Search
              </button>
              <button
              
                id="loginbtn"
                className="btn btn-outline-success"
                type="submit"
              >
                <Link to="/Login" className="nav-link">
                  login
                </Link>
                
              </button> 
            </form>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
