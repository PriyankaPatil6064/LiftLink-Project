import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ManageProfile = () => {
    const [vendor, setVendor] = useState({});
    const [services, setServices] = useState([]);
    const [logo, setLogo] = useState(null);
    const [projectImages, setProjectImages] = useState([]);
    const [projectDescriptions, setProjectDescriptions] = useState([]);

    // Get vendorId from localStorage
    const vendorId = localStorage.getItem("vendorId");

    console.log("Vendor ID being sent:", vendorId);
    const fetchProfile = useCallback(async () => {
        if (!vendorId) {
            console.error("Vendor ID not found in localStorage");
            return;
        }
        try {
            const res = await axios.get(`http://localhost:5000/vendor/profile/${vendorId}`);
            setVendor(res.data);
            setServices(res.data.services || []);
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    }, [vendorId]);

    useEffect(() => {
        console.log("Fetching profile for vendorId:", vendorId);
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e) => setVendor({ ...vendor, [e.target.name]: e.target.value });

    const handleServiceChange = (idx, value) => {
        const newServices = [...services];
        newServices[idx] = value;
        setServices(newServices);
    };

    const addService = () => setServices([...services, ""]);
    const removeService = (idx) => setServices(services.filter((_, index) => index !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!vendorId) {
            alert("Vendor ID is missing. Please log in again.");
            return;
        }

        const formData = new FormData();
        Object.entries(vendor).forEach(([key, value]) => formData.append(key, value));
        formData.append("services", JSON.stringify(services));
        formData.append("projectDescriptions", JSON.stringify(projectDescriptions));

        if (logo) formData.append("logo", logo);
        projectImages.forEach((img) => formData.append("projectImages", img));

        try {
            const response = await axios.put(
                `http://localhost:5000/vendor/profile/${vendorId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            alert("Profile Updated Successfully!");
            fetchProfile(); // Refresh profile after update
        } catch (err) {
            console.error("Update Error:", err);
            alert("Failed to update profile!");
        }
    };

    return (
        <div className="container my-4 p-4 vendor-profile">
            <h2 className="text-center text-white">Manage Profile</h2>
            <form onSubmit={handleSubmit} className="text-white">
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="fullname" className="form-control"
                        value={vendor.fullname || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" name="companyName" className="form-control"
                        value={vendor.companyName || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" className="form-control"
                        value={vendor.description || ""} onChange={handleChange}></textarea>
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" className="form-control"
                        value={vendor.location || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Contact</label>
                    <input type="text" name="contact" className="form-control"
                        value={vendor.contact || ""} onChange={handleChange} />
                </div>

                {/* Services */}
                <div className="form-group">
                    <label>Services Offered</label>
                    {services.map((service, idx) => (
                        <div key={idx} className="d-flex mb-2">
                            <input type="text" className="form-control"
                                value={service} onChange={(e) => handleServiceChange(idx, e.target.value)} />
                            <button type="button" className="btn btn-danger ml-2"
                                onClick={() => removeService(idx)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary mt-2" onClick={addService}>Add Service</button>
                </div>

                {/* Logo Upload */}
                <div className="form-group">
                    <label>Upload Logo</label>
                    <input type="file" className="form-control-file" onChange={(e) => setLogo(e.target.files[0])} />
                    {vendor.logo && (
                        <img src={`http://localhost:5000/uploads/${vendor.logo}`} alt="Logo" width="100" />
                    )}
                </div>

                {/* Project Images Upload */}
                <div className="form-group">
                    <label>Upload Project Images</label>
                    <input type="file" className="form-control-file" multiple onChange={(e) => setProjectImages([...e.target.files])} />
                    <div className="mt-3">
                        {vendor.projects && vendor.projects.map((proj, idx) => (
                            <div key={idx} className="mb-2">
                                <img src={`http://localhost:5000/uploads/${proj.image}`} alt="Project" width="120" className="mr-2" />
                                <input
                                    type="text"
                                    className="form-control mt-2"
                                    placeholder="Project Description"
                                    value={projectDescriptions[idx] || proj.description || ""}
                                    onChange={(e) => {
                                        const newDescriptions = [...projectDescriptions];
                                        newDescriptions[idx] = e.target.value;
                                        setProjectDescriptions(newDescriptions);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary mt-3">Update Profile</button>
            </form>
        </div>
    );
};

export default ManageProfile;  