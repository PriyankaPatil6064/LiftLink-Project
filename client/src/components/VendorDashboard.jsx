import React from "react";
import { Routes, Route, Link, useNavigate} from "react-router-dom";
import ManageProfile from "./ManageProfile";
import ManageServices from "./ManageServices";
import ManageInquiries from "./ManageInquiries";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";

const VendorDashboard = () => {

    const navigate = useNavigate();
  
    useEffect(() => {
      const vendorId = localStorage.getItem("vendorId");
      if (!vendorId) {
        alert("Please login first!");
        navigate("/vendor-login");
      }
    }, [navigate]);
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-dark sidebar py-3">
          <ul className="nav flex-column">
            <li className="nav-item">
            <Link className="nav-link" to="/vendorDashboard/profile">Manage Profile</Link>            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendorDashboard/services">Manage Services</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendorDashboard/inquiries">Manage Inquiries</Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <Routes>
            <Route path="profile" element={<ManageProfile />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="inquiries" element={<ManageInquiries />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
