import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './VendorManageProfile.css';

const VendorManageProfile = ({ vendorId }) => {
    const [vendor, setVendor] = useState({});
    const [services, setServices] = useState([]);
    const [logo, setLogo] = useState(null);
    const [projectImages, setProjectImages] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/vendor/profile/${vendorId}`);
            setVendor(res.data);
            setServices(res.data.services || []);
        } catch (err) {
            console.error('Fetch Error:', err);
        }
    };

    const handleChange = (e) => setVendor({ ...vendor, [e.target.name]: e.target.value });

    const handleServiceChange = (idx, value) => {
        const newServices = [...services];
        newServices[idx] = value;
        setServices(newServices);
    };

    const addService = () => setServices([...services, '']);
    const removeService = (idx) => setServices(services.filter((_, index) => index !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(vendor).forEach(([key, value]) => formData.append(key, value));
        formData.append('services', JSON.stringify(services));
        if (logo) formData.append('logo', logo);
        projectImages.forEach((img) => formData.append('projectImages', img));

        try {
            await axios.put(`http://localhost:5000/vendor/profile/${vendorId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Profile Updated');
            fetchProfile();
        } catch (err) {
            console.error('Update Error:', err);
            alert('Failed to update');
        }
    };

    return (
        <div className="container my-4 p-4 vendor-profile">
            <h2 className="text-center text-white">Manage Profile</h2>
            <form onSubmit={handleSubmit} className="text-white">
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" className="form-control"
                        value={vendor.fullName || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" name="companyName" className="form-control"
                        value={vendor.companyName || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" className="form-control"
                        value={vendor.description || ''} onChange={handleChange}></textarea>
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" className="form-control"
                        value={vendor.location || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Contact</label>
                    <input type="text" name="contact" className="form-control"
                        value={vendor.contact || ''} onChange={handleChange} />
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

                {/* Logo */}
                <div className="form-group">
                    <label>Upload Logo</label>
                    <input type="file" className="form-control-file" onChange={(e) => setLogo(e.target.files[0])} />
                    {vendor.logo && <img src={`http://localhost:5000/uploads/${vendor.logo}`} alt="Logo" width="100" />}
                </div>

                {/* Projects */}
                <div className="form-group">
                    <label>Upload Project Images</label>
                    <input type="file" className="form-control-file" multiple onChange={(e) => setProjectImages([...e.target.files])} />
                    <div className="mt-3">
                        {vendor.projects && vendor.projects.map((proj, idx) => (
                            <div key={idx}>
                                <img src={`http://localhost:5000/uploads/${proj.image}`} alt="Project" width="120" className="mr-2" />
                                <small className="text-light">{proj.description}</small>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary mt-3">Update Profile</button>
            </form>
        </div>
    );
};

export default VendorManageProfile;
