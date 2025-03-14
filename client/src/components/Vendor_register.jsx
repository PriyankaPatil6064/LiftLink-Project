import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Vendor_register = () => {
    const navigate = useNavigate();
    const [fullname, setFullName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [businessname, setBname] = useState("");
    const [businesstype, setBtype] = useState("");
    const [compregno, setCreg] = useState("");
    const [registerSuccess, setRegisterSuccess] = useState(false);

    const handleVendor = async (e) => {
        e.preventDefault();

        if (!fullname || !mobile || !email || !password || !businessname || !businesstype || !compregno) {
            alert("All fields are required.");
            return;
        }

        if (!email.endsWith("@gmail.com")) {
            alert("Email must end with @gmail.com");
            return;
        }

        const mobilePattern = /^[6-9]\d{9}$/;
        if (!mobilePattern.test(mobile)) {
            alert("Mobile number must start with a digit between 6 and 9 and be exactly 10 digits.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/vendor_registers/vendor_register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullname, mobile, email, password, businessname, businesstype, compregno }),
            });

            const data = await response.json();
            if (response.ok) {
                setRegisterSuccess(true);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred while signing up.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: "400px", textAlign: "center" }}>
                <h2 className="text-center mb-4">Vendor Signup</h2>
                {!registerSuccess ? (
                    <>
                        <form onSubmit={handleVendor}>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Full Name"
                                    value={fullname}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Mobile"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
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
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Business Name"
                                    value={businessname}
                                    onChange={(e) => setBname(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Business Type"
                                    value={businesstype}
                                    onChange={(e) => setBtype(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Company Registration Number"
                                    value={compregno}
                                    onChange={(e) => setCreg(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100">
                                Signup
                            </button>
                        </form>
                        <button 
                            className="btn btn-primary mt-3 w-100"
                            onClick={() => navigate("/loginvendor")}
                        >
                            Go to Login
                        </button>
                    </>
                ) : (
                    <div>
                        <p className="text-success">Signup successful!</p>
                        <button 
                            className="btn btn-primary mt-3 w-100"
                            onClick={() => navigate("/loginvendor")}
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vendor_register;
