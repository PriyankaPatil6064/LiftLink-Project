import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
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
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
        navigate("/Home"); // Redirect to a protected page after login
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error logging in.");
    }
  };

  return (
    <div className="login-container">
      <h3>Login to connect with us!</h3>
        <div className="login-box">
          

        <h2>Login</h2>
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
        <button 
          className="btn btn-link mt-3"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </button>

        <button 
          className="logsignbtn"
          onClick={ () => navigate("/logsign")}
         >
          Don't have an account? Sign up now!!
         
        </button>
      </div>
    </div>
  );
};

export default Login;
