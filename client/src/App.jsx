import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";

// Eagerly loaded (needed immediately)
import Home from "./components/Home";
import NotFound from "./components/NotFound";

// Lazy loaded for code splitting (Phase 10 performance)
const Explore = lazy(() => import("./components/Explore"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const Signup = lazy(() => import("./components/Signup"));
const Login = lazy(() => import("./components/Login"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Logsign = lazy(() => import("./components/LogSign"));
const VendorRegister = lazy(() => import("./components/Vendor_register"));
const VendorDashboard = lazy(() => import("./components/VendorDashboard"));
const LoginVendor = lazy(() => import("./components/LoginVendor"));
const VendorPublicProfile = lazy(() => import("./components/VendorPublicProfile"));
const UserDashboard = lazy(() => import("./components/UserDashboard"));
const CompareVendors = lazy(() => import("./components/CompareVendors"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

// Skeleton loader for Suspense fallback
const PageLoader = () => (
  <div style={{ minHeight: "calc(100vh - 56px)", background: "#0A192F", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ textAlign: "center" }}>
      <div className="spinner-border" style={{ color: "#d4af37", width: "2.5rem", height: "2.5rem" }} role="status"></div>
      <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "1rem", fontSize: "0.875rem" }}>Loading...</p>
    </div>
  </div>
);

// Layout: Navbar always shown, Outlet renders child routes
const Layout = () => (
  <>
    <Navbar />
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/Explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/vendor/:vendorId" element={<VendorPublicProfile />} />

          {/* Auth pages */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/logsign" element={<Logsign />} />

          {/* Vendor pages */}
          <Route path="/vendor_register" element={<VendorRegister />} />
          <Route path="/loginvendor" element={<LoginVendor />} />
          {/* Alias: /vendor_login → /loginvendor (common alternate URL) */}
          <Route path="/vendor_login" element={<LoginVendor />} />
          {/* Alias: /explore (lowercase) → same component */}
          <Route path="/explore" element={<Explore />} />

          {/* Vendor Dashboard — nested routes */}
          <Route path="/vendorDashboard/*" element={<VendorDashboard />} />

          {/* User Dashboard */}
          <Route path="/userDashboard/*" element={<UserDashboard />} />

          {/* Compare */}
          <Route path="/compare" element={<CompareVendors />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
