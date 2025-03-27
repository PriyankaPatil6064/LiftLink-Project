import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageServices = () => {
  const vendorId = localStorage.getItem("vendorId"); 
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ serviceName: "", category: "", description: "" });

  useEffect(() => {
    if (!vendorId) return; // Prevent API call if vendorId is missing

    axios.get(`http://localhost:5000/api/services/${vendorId}`)
      .then(response => setServices(response.data.services)) // Correct response handling
      .catch(error => console.error("Error fetching services:", error.response?.data || error.message));
  }, [vendorId]); 

  const handleAddService = () => {
    if (!newService.serviceName || !newService.category || !newService.description) {
      alert("All fields are required!");
      return;
    }

    axios.post("http://localhost:5000/api/services/add", { vendorId, ...newService })
      .then(response => {
        setServices([...services, response.data.service]); // Correct response handling
        setNewService({ serviceName: "", category: "", description: "" });
      })
      .catch(error => console.error("Error adding service:", error.response?.data || error.message));
  };

  const handleDeleteService = (serviceId) => {
    axios.delete(`http://localhost:5000/api/services/${vendorId}/${serviceId}`)
      .then(() => {
        setServices(services.filter(service => service._id !== serviceId));
      })
      .catch(error => console.error("Error deleting service:", error.response?.data || error.message));
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-lg" style={{ background: "#0A1931", color: "white", borderRadius: "12px" }}>
        <h2 className="text-center mb-4">Manage Services</h2>

        {/* Add New Service Form */}
        <div className="card p-4 mb-4 shadow-sm" style={{ background: "#162447", borderRadius: "10px" }}>
          <h4 className="text-white mb-3">Add New Service</h4>
          <input
            type="text"
            className="form-control my-2"
            placeholder="Service Name"
            value={newService.serviceName}
            onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
            style={{ background: "#1F4068", color: "white", border: "none" }}
          />
          <input
            type="text"
            className="form-control my-2"
            placeholder="Category"
            value={newService.category}
            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
            style={{ background: "#1F4068", color: "white", border: "none" }}
          />
          <textarea
            className="form-control my-2"
            placeholder="Description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            style={{ background: "#1F4068", color: "white", border: "none" }}
          />
          <button className="btn btn-primary mt-2 w-100" onClick={handleAddService} style={{ background: "#E43F5A", border: "none" }}>
            Add Service
          </button>
        </div>

        {/* List of Services */}
        <div className="card p-4 shadow-sm" style={{ background: "#162447", borderRadius: "10px" }}>
          <h4 className="text-white mb-3">Existing Services</h4>
          {services.length > 0 ? (
            <ul className="list-group">
              {services.map(service => (
                <li key={service._id} className="list-group-item d-flex justify-content-between align-items-center"
                  style={{ background: "#1F4068", color: "white", border: "none", borderRadius: "8px", marginBottom: "5px" }}>
                  <div>
                    <strong>{service.serviceName}</strong> - {service.category}
                    <p className="mb-1">{service.description}</p>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(service._id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white">No services added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageServices;
