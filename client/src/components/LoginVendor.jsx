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
      const response = await fetch("http://localhost:5000/api/vendor_registers/loginvendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error logging in.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px", textAlign: "center" }}>
        <h2>Login Vendor</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <button className="btn btn-link mt-3" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </button>
      </div>
    </div>
  );
};
export default LoginVendor;
