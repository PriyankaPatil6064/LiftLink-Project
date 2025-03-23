import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageServices = () => {
  const [services, setServices] = useState([
    { id: 1, name: "Lift Installation", category: "Installation", description: "High-quality elevator installation service." },
    { id: 2, name: "Lift Maintenance", category: "Maintenance", description: "Routine check-ups and elevator maintenance." },
  ]);

  const [newService, setNewService] = useState({ name: "", category: "", description: "" });

  const handleAddService = () => {
    if (newService.name && newService.category && newService.description) {
      setServices([...services, { id: Date.now(), ...newService }]);
      setNewService({ name: "", category: "", description: "" });
    }
  };

  const handleDeleteService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };

  return (
    <div className="container">
      <h2 className="mb-4">Manage Services</h2>

      {/* Add Service Form */}
      <div className="card p-3 mb-4">
        <h4>Add New Service</h4>
        <input
          type="text"
          className="form-control my-2"
          placeholder="Service Name"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
        />
        <input
          type="text"
          className="form-control my-2"
          placeholder="Category"
          value={newService.category}
          onChange={(e) => setNewService({ ...newService, category: e.target.value })}
        />
        <textarea
          className="form-control my-2"
          placeholder="Description"
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
        />
        <button className="btn btn-primary mt-2" onClick={handleAddService}>Add Service</button>
      </div>

      {/* List of Services */}
      <div className="card p-3">
        <h4>Existing Services</h4>
        {services.length > 0 ? (
          <ul className="list-group">
            {services.map(service => (
              <li key={service.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{service.name}</strong> - {service.category}
                  <p className="mb-1">{service.description}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(service.id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No services added yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageServices;
