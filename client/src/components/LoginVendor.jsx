import { useState } from "react";
import { useNavigate } from "react-router-dom";


const LoginVendor = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/vendor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Login failed:", data.message);
        alert(data.message);  // Optional - show alert to user
        return;
      }
  
      console.log("Login successful:", data);
      navigate("/VendorDashboard");
      
  
      // ✅ Safe check before accessing _id
      if (data.vendor && data.vendor._id) {
        console.log("Vendor ID:", data.vendor._id);
        localStorage.setItem("vendor", JSON.stringify(data.vendor));
        // Redirect or update UI here
        // navigate('/vendor/dashboard');
      } else {
        console.error("Vendor data missing in response");
      }
  
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <form className="login-form p-4 rounded" onSubmit={handleLogin}>
        <h2 className="text-center mb-4 text-white">Vendor Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="form-control mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-light w-100">Login</button>
      </form>
    </div>
  );
};

export default LoginVendor;