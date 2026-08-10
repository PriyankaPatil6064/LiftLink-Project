import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";

const ManageServices = () => {
  const { vendor } = useAuth();
  const vendorId = vendor?._id;

  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ serviceName: "", category: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    api
      .get(`/api/services/${vendorId}`)
      .then((res) => {
        // API returns vendor doc or services array — handle both
        const data = res.data;
        setServices(Array.isArray(data) ? data : (data.services || []));
      })
      .catch(() => toast.error("Failed to load services."))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handleAddService = async () => {
    if (!newService.serviceName || !newService.category || !newService.description) {
      toast.warning("All fields are required.");
      return;
    }
    setAdding(true);
    try {
      const res = await api.post("/api/services/add", { vendorId, ...newService });
      setServices([...services, res.data.newService]);
      setNewService({ serviceName: "", category: "", description: "" });
      toast.success("Service added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add service.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await api.delete(`/api/services/${vendorId}/${serviceId}`);
      setServices(services.filter((s) => s._id !== serviceId));
      toast.success("Service deleted.");
    } catch {
      toast.error("Failed to delete service.");
    }
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    border: "1px solid rgba(212,175,55,0.1)",
  };
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(212,175,55,0.25)",
    borderRadius: "8px",
    color: "#fff",
    padding: "0.6rem 1rem",
    width: "100%",
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#d4af37" }}>
        <div className="spinner-border" role="status" style={{ color: "#d4af37" }}></div>
        <p style={{ marginTop: "1rem" }}>Loading services...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <h2 style={{ color: "#f8e3a1", marginBottom: "2rem", fontWeight: 700 }}>Manage Services</h2>

      {/* Add New Service */}
      <div style={cardStyle}>
        <h5 style={{ color: "#d4af37", marginBottom: "1rem" }}>Add New Service</h5>
        <input
          type="text"
          placeholder="Service Name"
          value={newService.serviceName}
          onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Category (e.g., Elevator, Home Lift, AMC)"
          value={newService.category}
          onChange={(e) => setNewService({ ...newService, category: e.target.value })}
          style={inputStyle}
        />
        <textarea
          placeholder="Description"
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
        />
        <button
          onClick={handleAddService}
          disabled={adding}
          style={{
            padding: "0.7rem 1.5rem",
            background: "linear-gradient(135deg, #d4af37, #f8e3a1)",
            color: "#0a192f",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: adding ? "not-allowed" : "pointer",
          }}
        >
          {adding ? "Adding..." : "+ Add Service"}
        </button>
      </div>

      {/* Existing Services */}
      <div style={cardStyle}>
        <h5 style={{ color: "#d4af37", marginBottom: "1rem" }}>
          Your Services ({services.length})
        </h5>
        {services.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "2rem 0" }}>
            No services added yet. Add your first service above.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {services.map((service) => (
              <div
                key={service._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.04)",
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <strong style={{ color: "#f8e3a1" }}>{service.serviceName}</strong>
                  <span
                    style={{
                      marginLeft: "0.75rem",
                      background: "rgba(212,175,55,0.15)",
                      color: "#d4af37",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {service.category}
                  </span>
                  <p style={{ color: "rgba(255,255,255,0.5)", margin: "0.4rem 0 0", fontSize: "0.875rem" }}>
                    {service.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteService(service._id)}
                  style={{
                    padding: "0.4rem 0.9rem",
                    background: "rgba(228,63,90,0.15)",
                    border: "1px solid rgba(228,63,90,0.4)",
                    color: "#ff6b6b",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    flexShrink: 0,
                    marginLeft: "1rem",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageServices;
