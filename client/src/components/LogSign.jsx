import { Link } from "react-router-dom";
import usericon2 from "./img/usericon2.png";
import regimg from "./img/regimg.png";

const Logsign = () => {
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <h3 className="d-flex justify-content-center" >What You Want To Do?</h3>
                {/* Row to contain both cards horizontally */}

                <div className=" cardcls col-md-5">
                    {/* First Card (Register Business) */}
                    <div className="card">
                        <div className="d-flex justify-content-center">
                            <img src={regimg} className="card-img-top img-fluid" alt="User Icon" style={{ width: "150px", height: "150px" }} />
                        </div>
                        <div className="card-body text-center">
                            <h5 className="card-title">Register Your Business</h5>
                            <p className="card-text">
                                You can add your company to LIFTLINK by Registering below.
                            </p>
                            <Link to="/Vendor_register" className="btn btn-primary">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>

                <div className=" cardcls col-md-5">
                    {/* Second Card (Sign Up) */}
                    <div className="card">
                        <div className="d-flex justify-content-center">
                            <img src={usericon2} className="card-img-top img-fluid" alt="User Icon" style={{ width: "150px", height: "150px" }} />
                        </div>            
                        <div className="card-body text-center">
                            <h5 className="card-title">Register Yourself</h5>
                            <p className="card-text">
                               
                                By signing-up on LifLink, you will be able to connect with companies seamlessly!
                            </p>
                            <Link to="/signup" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Logsign;
