import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";

const ManageProfile = () => {
  const { vendor } = useAuth();
  const vendorId = vendor?._id;

  const [profileData, setProfileData] = useState({
    fullname: "", companyName: "", companyType: "",
    description: "", location: "", contact: "",
    companyRegistrationNumber: "",
  });
  const [services, setServices] = useState([]);
  const [logo, setLogo] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [projectDescriptions, setProjectDescriptions] = useState([]);
  const [existingProjects, setExistingProjects] = useState([]);
  const [existingLogo, setExistingLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/vendor/profile/${vendorId}`);
      setProfileData({
        fullname: data.fullname || "",
        companyName: data.companyName || "",
        companyType: data.companyType || "",
        description: data.description || "",
        location: data.location || "",
        contact: data.contact || "",
        companyRegistrationNumber: data.companyRegistrationNumber || "",
      });
      setServices(data.services || []);
      setExistingProjects(data.projects || []);
      setExistingLogo(data.logo || null);
    } catch (err) {
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (e) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleServiceChange = (idx, value) => {
    const updated = [...services];
    updated[idx] = { ...updated[idx], serviceName: value };
    setServices(updated);
  };

  const addService = () => setServices([...services, { serviceName: "" }]);
  const removeService = (idx) => setServices(services.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId) { toast.error("Vendor ID missing. Please log in again."); return; }

    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => formData.append(key, value));
    formData.append("services", JSON.stringify(services));
    formData.append("projectDescriptions", JSON.stringify(projectDescriptions));
    if (logo) formData.append("logo", logo);
    projectImages.forEach((img) => formData.append("projectImages", img));

    setSaving(true);
    try {
      await api.put(`/api/vendor/profile/${vendorId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(212,175,55,0.25)",
    borderRadius: "8px",
    color: "#fff",
    padding: "0.6rem 1rem",
    width: "100%",
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
  };
  const labelStyle = { color: "#d4af37", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem", display: "block" };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#d4af37" }}>
        <div className="spinner-border" role="status" style={{ color: "#d4af37" }}></div>
        <p style={{ marginTop: "1rem" }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <h2 style={{ color: "#f8e3a1", marginBottom: "2rem", fontWeight: 700 }}>Manage Profile</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(212,175,55,0.1)" }}>
          <h5 style={{ color: "#d4af37", marginBottom: "1rem" }}>Basic Information</h5>
          {[
            { label: "Full Name", name: "fullname", type: "text" },
            { label: "Company Name", name: "companyName", type: "text" },
            { label: "Company Type", name: "companyType", type: "text" },
            { label: "Location", name: "location", type: "text" },
            { label: "Contact", name: "contact", type: "text" },
            { label: "Registration Number", name: "companyRegistrationNumber", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label style={labelStyle}>{label}</label>
              <input type={type} name={name} value={profileData[name]} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
          <label style={labelStyle}>Description</label>
          <textarea name="description" value={profileData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} />
        </div>

        {/* Services */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(212,175,55,0.1)" }}>
          <h5 style={{ color: "#d4af37", marginBottom: "1rem" }}>Services Offered</h5>
          {services.map((service, idx) => (
            <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={typeof service === "string" ? service : service.serviceName || ""}
                onChange={(e) => handleServiceChange(idx, e.target.value)}
                style={{ ...inputStyle, marginBottom: 0 }}
                placeholder="Service name"
              />
              <button
                type="button"
                onClick={() => removeService(idx)}
                style={{ padding: "0 1rem", background: "rgba(228,63,90,0.2)", border: "1px solid rgba(228,63,90,0.4)", color: "#ff6b6b", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            style={{ padding: "0.5rem 1.2rem", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", color: "#d4af37", borderRadius: "8px", cursor: "pointer", marginTop: "0.5rem" }}
          >
            + Add Service
          </button>
        </div>

        {/* Logo Upload */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(212,175,55,0.1)" }}>
          <h5 style={{ color: "#d4af37", marginBottom: "1rem" }}>Company Logo</h5>
          {existingLogo && (
            <img
              src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${existingLogo}`}
              alt="Logo"
              style={{ width: "100px", borderRadius: "8px", marginBottom: "1rem" }}
            />
          )}
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} style={{ color: "#fff" }} />
        </div>

        {/* Project Images */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(212,175,55,0.1)" }}>
          <h5 style={{ color: "#d4af37", marginBottom: "1rem" }}>Project Gallery</h5>
          {existingProjects.map((proj, idx) => (
            <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
              <img
                src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${proj.image}`}
                alt={`Project ${idx + 1}`}
                style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
              />
              <input
                type="text"
                placeholder="Project description"
                value={projectDescriptions[idx] || proj.description || ""}
                onChange={(e) => {
                  const updated = [...projectDescriptions];
                  updated[idx] = e.target.value;
                  setProjectDescriptions(updated);
                }}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              />
            </div>
          ))}
          <label style={labelStyle}>Add New Project Images</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setProjectImages([...e.target.files])} style={{ color: "#fff" }} />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "0.85rem 2rem",
            background: saving ? "rgba(212,175,55,0.3)" : "linear-gradient(135deg, #d4af37, #f8e3a1)",
            color: "#0a192f",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: saving ? "not-allowed" : "pointer",
            transition: "all 0.3s",
          }}
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ManageProfile;