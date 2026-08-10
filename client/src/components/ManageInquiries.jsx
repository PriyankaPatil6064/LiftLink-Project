import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import api from "../api";

const ManageInquiries = () => {
  const { vendor } = useAuth();
  const vendorId = vendor?._id;

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!vendorId) return;
    api
      .get(`/api/inquiries/${vendorId}`)
      .then((res) => setInquiries(res.data))
      .catch(() => toast.error("Failed to load inquiries."))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/api/inquiries/${id}`);
      setInquiries(inquiries.filter((i) => i._id !== id));
      toast.success("Inquiry deleted.");
    } catch {
      toast.error("Failed to delete inquiry.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#d4af37" }}>
        <div className="spinner-border" role="status" style={{ color: "#d4af37" }}></div>
        <p style={{ marginTop: "1rem" }}>Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ color: "#f8e3a1", marginBottom: "0.5rem", fontWeight: 700 }}>Inquiries</h2>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem", fontSize: "0.9rem" }}>
        {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"} received
      </p>

      {inquiries.length === 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.1)",
            borderRadius: "12px",
            padding: "4rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>
            No inquiries yet. They'll appear here when users contact you.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {inquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.12)",
                borderRadius: "12px",
                padding: "1.5rem",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  {/* Sender info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #1F4068, #0a1931)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", flexShrink: 0,
                      }}
                    >
                      👤
                    </div>
                    <div>
                      <p style={{ color: "#f8e3a1", margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
                        {inquiry.userName}
                      </p>
                      <a
                        href={`mailto:${inquiry.userEmail}`}
                        style={{ color: "#d4af37", fontSize: "0.8rem", textDecoration: "none" }}
                      >
                        {inquiry.userEmail}
                      </a>
                    </div>
                  </div>

                  {/* Message */}
                  <p
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      background: "rgba(255,255,255,0.03)",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.05)",
                      margin: 0,
                    }}
                  >
                    {inquiry.message}
                  </p>

                  {/* Date */}
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: "0.75rem", marginBottom: 0 }}>
                    📅 {formatDate(inquiry.date)}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <a
                    href={`mailto:${inquiry.userEmail}?subject=Re: Your Inquiry to ${vendor?.companyName}`}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "rgba(212,175,55,0.15)",
                      border: "1px solid rgba(212,175,55,0.35)",
                      color: "#d4af37",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "0.8rem",
                    }}
                  >
                    Reply
                  </a>
                  <button
                    onClick={() => handleDelete(inquiry._id)}
                    disabled={deleting === inquiry._id}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "rgba(228,63,90,0.12)",
                      border: "1px solid rgba(228,63,90,0.35)",
                      color: "#ff6b6b",
                      borderRadius: "6px",
                      cursor: deleting === inquiry._id ? "not-allowed" : "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    {deleting === inquiry._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageInquiries;