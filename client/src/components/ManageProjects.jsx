import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ManageProjects = () => {
  const { vendor } = useAuth();
  const vendorId = vendor?._id;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const emptyForm = {
    title: "", description: "", year: "", location: "",
    projectType: "", elevatorType: "", videoUrl: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);

  const fetchProjects = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/vendor/profile/${vendorId}`);
      setProjects(data.projects || []);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setNewImages([]);
    setImagePreviews([]);
    setRemoveImages([]);
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setForm({
      title: project.title || "",
      description: project.description || "",
      year: project.year || "",
      location: project.location || "",
      projectType: project.projectType || "",
      elevatorType: project.elevatorType || "",
      videoUrl: project.videoUrl || "",
    });
    setNewImages([]);
    setImagePreviews([]);
    setRemoveImages([]);
    setEditing(project._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Project title is required."); return; }
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
    newImages.forEach((img) => formData.append("projectImages", img));

    try {
      if (editing) {
        if (removeImages.length > 0) {
          formData.append("removeImages", JSON.stringify(removeImages));
        }
        await api.put(`/api/vendor/project/${editing}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project updated!");
      } else {
        await api.post("/api/vendor/project", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project created!");
      }
      setShowForm(false);
      setEditing(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await api.delete(`/api/vendor/project/${vendorId}/${projectId}`);
      toast.success("Project deleted.");
      setDeleteConfirm(null);
      fetchProjects();
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  const getProjectImage = (project) => {
    if (project.images?.length > 0) return `${API_BASE}/uploads/${project.images[0]}`;
    if (project.image) return `${API_BASE}/uploads/${project.image}`;
    return null;
  };

  if (loading) {
    return (
      <div className="dash-spinner-wrap">
        <div className="dash-spinner" />
        <p className="dash-spinner-text">Loading projects…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dash-toolbar">
        <h2 className="dash-page-title" style={{ marginBottom: 0 }}>
          Projects & Portfolio <span style={{ color: "var(--ll-text-3)", fontSize: "1rem", fontWeight: 400 }}>({projects.length})</span>
        </h2>
        <button className="ll-btn ll-btn-primary" onClick={openAddForm} style={{ padding: "10px 20px", fontSize: "0.875rem" }}>
          + Add Project
        </button>
      </div>

      {showForm && (
        <div className="dash-card" style={{ marginBottom: "var(--ll-sp-6)" }}>
          <div className="dash-card-header">
            <h4 className="dash-card-title">{editing ? "Edit Project" : "Add New Project"}</h4>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ cursor: "pointer", background: "none", border: "none", fontSize: "1.2rem", color: "var(--ll-text-2)" }}>✕</button>
          </div>
          <div className="dash-card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Project Title *</label>
                  <input className="ll-input" type="text" placeholder="e.g. Commercial Tower Elevator Project" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Location</label>
                  <input className="ll-input" type="text" placeholder="e.g. Mumbai, Maharashtra" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "14px" }}>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Year</label>
                  <input className="ll-input" type="number" min="2000" max="2030" placeholder="e.g. 2024" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Project Type</label>
                  <select className="ll-input ll-select" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })}>
                    <option value="">Select…</option>
                    {["Commercial", "Residential", "Industrial", "Hospital", "Government", "Hotel", "Retail", "Infrastructure", "Modernization"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="ll-form-group" style={{ marginBottom: 0 }}>
                  <label className="ll-label">Elevator Type</label>
                  <select className="ll-input ll-select" value={form.elevatorType} onChange={(e) => setForm({ ...form, elevatorType: e.target.value })}>
                    <option value="">Select…</option>
                    {["Passenger Elevator", "Freight Elevator", "Hospital Elevator", "Home Lift", "Capsule Elevator", "Hydraulic Lift", "Escalator", "Dumbwaiter", "Car Elevator", "MRL Elevator"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="ll-form-group" style={{ marginTop: "14px" }}>
                <label className="ll-label">Description</label>
                <textarea className="ll-input" rows={3} placeholder="Describe the project, scope of work, and outcome…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical" }} />
              </div>
              <div className="ll-form-group">
                <label className="ll-label">Video URL (optional)</label>
                <input className="ll-input" type="url" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
              </div>

              {editing && (() => {
                const project = projects.find((p) => p._id === editing);
                const existingImgs = (project?.images || []).filter((img) => !removeImages.includes(img));
                const allImgs = existingImgs.length > 0 ? existingImgs : (project?.image && !removeImages.includes(project.image) ? [project.image] : []);
                if (allImgs.length === 0) return null;
                return (
                  <div style={{ marginBottom: "14px" }}>
                    <label className="ll-label">Current Images</label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {allImgs.map((img) => (
                        <div key={img} style={{ position: "relative" }}>
                          <img src={`${API_BASE}/uploads/${img}`} alt="" style={{ width: "100px", height: "75px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--ll-border)" }} />
                          <button type="button" onClick={() => setRemoveImages((prev) => [...prev, img])} style={{ position: "absolute", top: "-6px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%", background: "#EF4444", color: "#fff", border: "none", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="ll-form-group">
                <label className="ll-label">Upload Images</label>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ fontSize: "0.875rem" }} />
                {imagePreviews.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={src} alt="" style={{ width: "100px", height: "75px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--ll-border)" }} />
                        <button type="button" onClick={() => removeNewImage(i)} style={{ position: "absolute", top: "-6px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%", background: "#EF4444", color: "#fff", border: "none", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="ll-btn ll-btn-primary" disabled={saving} style={{ padding: "10px 24px" }}>
                  {saving ? "Saving…" : editing ? "Update Project" : "Create Project"}
                </button>
                <button type="button" className="ll-btn ll-btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }} style={{ padding: "10px 24px" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">🏗</div>
          <p className="dash-empty-text">No projects yet. Add your first project to showcase your work to potential clients.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--ll-sp-4)" }}>
          {projects.map((p) => {
            const imgUrl = getProjectImage(p);
            return (
              <div key={p._id} className="dash-card" style={{ overflow: "hidden" }}>
                <div style={{ height: "180px", background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : "linear-gradient(135deg, hsl(215,60%,92%), hsl(235,50%,85%))", position: "relative" }}>
                  {!imgUrl && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(215,30%,65%)", fontSize: "2.5rem" }}>🏗</div>
                  )}
                  {p.videoUrl && (
                    <span style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600 }}>🎬 Video</span>
                  )}
                  {(p.images?.length > 1) && (
                    <span style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem" }}>📷 {p.images.length}</span>
                  )}
                </div>
                <div className="dash-card-body" style={{ padding: "16px" }}>
                  <h4 style={{ fontWeight: 700, color: "var(--ll-text-1)", margin: "0 0 6px", fontSize: "1rem" }}>{p.title || "Untitled Project"}</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    {p.location && <span className="dash-tag" style={{ fontSize: "0.75rem" }}>📍 {p.location}</span>}
                    {p.year && <span className="dash-tag dash-tag-muted" style={{ fontSize: "0.75rem" }}>📅 {p.year}</span>}
                    {p.projectType && <span className="dash-tag dash-tag-muted" style={{ fontSize: "0.75rem" }}>{p.projectType}</span>}
                    {p.elevatorType && <span className="dash-tag dash-tag-muted" style={{ fontSize: "0.75rem" }}>{p.elevatorType}</span>}
                  </div>
                  {p.description && <p style={{ color: "var(--ll-text-2)", fontSize: "0.85rem", lineHeight: 1.55, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="dash-action-btn dash-action-info" onClick={() => openEditForm(p)} style={{ flex: 1 }}>✏️ Edit</button>
                    <button className="dash-action-btn dash-action-reject" onClick={() => setDeleteConfirm(p._id)} style={{ flex: 1 }}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="vp-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="vp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div style={{ padding: "28px", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
              <h3 style={{ fontWeight: 700, color: "var(--ll-text-1)", marginBottom: "8px" }}>Delete this project?</h3>
              <p style={{ color: "var(--ll-text-2)", fontSize: "0.9rem", marginBottom: "24px" }}>This action cannot be undone. All project images and data will be permanently removed.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button className="ll-btn ll-btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ padding: "10px 20px" }}>Cancel</button>
                <button className="ll-btn" onClick={() => handleDelete(deleteConfirm)} style={{ padding: "10px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Delete Project</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProjects;
