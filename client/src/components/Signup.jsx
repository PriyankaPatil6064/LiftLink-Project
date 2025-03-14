// import "bootstrap/dist/css/bootstrap.min.css";
// import { useState } from "react"; 
// import { useNavigate } from "react-router-dom";


// const Signup = () => {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [signupSuccess, setSignupSuccess] = useState(false);

//   // router.post("/signup", async (req, res) => {
//   //   console.log("Received Data:", req.body); // ✅ Debugging Line
//   // });


//   const handleSignup = async (e) => {
//     e.preventDefault();

//     // Validation: Ensure all fields are filled
//     if (!username || !fullName || !mobile || !email || !password) {
//       alert("All fields are required.");
//       return;
//     }

//     // Validation: Email must end with @gmail.com
//     if (!email.endsWith("@gmail.com")) {
//       alert("Email must end with @gmail.com");
//       return;
//     }

//     // Validation: Mobile number must start with 6 or 9 and be 10 digits
//     const mobilePattern = /^[6-9]\d{9}$/;
//     if (!mobilePattern.test(mobile)) {
//       alert("Mobile number must start with a digit between 6 and 9 and be exactly 10 digits.");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/users/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, fullName, mobile, email, password }),
//       });

//       const data = await response.json();
//       console.log("Response:", data); // ✅ Debugging Line
//       if (response.ok) {
//         setSignupSuccess(true);
//       } else {
//         alert(data.message);
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//       alert("An error occurred while signing up.");
//     }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100">
//       <div className="card p-4 shadow" style={{ width: "400px", textAlign: "center" }}>
//         <h2 className="text-center mb-4">Signup</h2>
//         {!signupSuccess ? (
//           <>
//             <form onSubmit={handleSignup}>
//               <div className="mb-3">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Username"
//                   value={FormData.username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Full Name"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Mobile"
//                   value={mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <input
//                   type="email"
//                   className="form-control"
//                   placeholder="Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <input
//                   type="password"
//                   className="form-control"
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <button type="submit" className="btn btn-success w-100">
//                 Signup
//               </button>
//             </form>
//             <button 
//               className="btn btn-primary mt-3 w-100"
//               onClick={() => navigate("/login")}
//             >
//               Go to Login
//             </button>
//           </>
//         ) : (
//           <div>
//             <p className="text-success">Signup successful!</p>
//             <button 
//               className="btn btn-primary mt-3 w-100"
//               onClick={() => navigate("/login")}
//             >
//               Go to Login
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Signup;


import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation: Ensure all fields are filled
    if (!username || !fullName || !mobile || !email || !password) {
      alert("All fields are required.");
      return;
    }

    // Validation: Email must end with @gmail.com
    if (!email.endsWith("@gmail.com")) {
      alert("Email must end with @gmail.com");
      return;
    }

    // Validation: Mobile number must start with 6 or 9 and be 10 digits
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile)) {
      alert("Mobile number must start with a digit between 6 and 9 and be exactly 10 digits.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, mobile, email, password }),
      });

      const data = await response.json();
      console.log("Response:", data); // ✅ Debugging Line

      if (response.ok) {
        setSignupSuccess(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred while signing up.");
    }
  };

  return (
   
      <div>
        <div >
        <div className="auth-container">
          <h2 className="text-center mb-4">Signup</h2>

          {!signupSuccess ? (
            <>

              <form onSubmit={handleSignup} >
                <div className=" mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    name="username"
                    value={username}  // ✅ Fixed Incorrect FormData
                    onChange={(e) => setUsername(e.target.value)}
                    required

                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Mobile"
                    name="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    name="email"
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
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Signup
                </button>
              </form>
              <button
                className="btn btn-primary mt-3 w-100"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </>
          ) : (
            <div>
              <p className="text-success">Signup successful!</p>
              <button
                className=" link-btn btn-primary mt-3 w-100"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
