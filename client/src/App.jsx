// import react from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';

import Home from './components/Home';
import Navbar from "./components/Navbar";
import Footer from './components/Footer';
import Explore from './components/Explore';
import About from './components/About';
import Contact from './components/Contact';
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Logsign from "./components/LogSign";
import Vendor_register from "./components/Vendor_register";
import LoginVendor from "./components/LoginVendor";
import CTASection from "./components/CTASection";

function App() {
  return (
    <Router>
    <Navbar /> {/* Navbar will always be visible */}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Explore" element={<Explore />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path = "/vendor_register" element = {< Vendor_register />} />
      <Route path="/loginvendor" element={<LoginVendor />} />
      <Route path="/logsign" element={<Logsign />} />
      <Route path="/footer" element={<Footer />} />
      <Route path="/CTASection" element={<CTASection />} />

    </Routes>
  </Router>
  );
}

export default App;
