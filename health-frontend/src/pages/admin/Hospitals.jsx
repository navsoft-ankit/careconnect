import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const C = {
  cream: "#F6F1E7",
  surface: "#FFFFFF",
  forest: "#22422F",
  forestDark: "#16301F",
  forestSoft: "#EAF0EB",
  terracotta: "#C1653A",
  terracottaDark: "#A8532C",
  terracottaSoft: "#F7E9E1",
  ink: "#2A2A24",
  muted: "#8A8478",
  border: "#E4DCC8",
  danger: "#B3432E",
};

const heading = {
  fontFamily: "'Fraunces', serif",
  color: C.ink,
  margin: 0,
};

const body = {
  fontFamily: "'Inter', sans-serif",
  color: C.ink,
};

const inputStyle = {
  ...body,
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  marginBottom: 14,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  background: C.cream,
  outline: "none",
};

const primaryBtn = {
  ...body,
  background: C.forest,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 22px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s ease",
};

const ghostBtn = {
  ...body,
  background: "transparent",
  color: C.forest,
  border: `1px solid ${C.forest}`,
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const dangerGhostBtn = {
  ...body,
  background: "transparent",
  color: C.danger,
  border: `1px solid ${C.terracottaSoft}`,
  borderRadius: 8,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const editBtn = {
  ...body,
  background: C.terracottaSoft,
  color: C.terracottaDark,
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: "", address: "", city: "", phone: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadHospitals();
  }, []);

  async function loadHospitals() {
    try {
      const res = await api.get("/admin/hospitals");
      setHospitals(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveHospital() {
    if (!form.name.trim()) {
      alert("Hospital name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/hospital/${editingId}`, form);
      } else {
        await api.post("/admin/hospital", form);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadHospitals();
    } catch (err) {
      console.log(err);
      alert(err.response?.data || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function editHospital(h) {
    setEditingId(h.id);
    setForm({
      name: h.name,
      address: h.address,
      city: h.city,
      phone: h.phone,
    });
    setShowForm(true);
  }

  async function removeHospital(id) {
    if (!window.confirm("Delete this hospital? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/hospital/${id}`);
      loadHospitals();
    } catch (err) {
      alert(err.response?.data || "Delete failed");
    }
  }

  return (
    <div style={{ 
             display: "flex", 
             minHeight: "100vh", 
             background: C.cream 
            }}>
      <Sidebar />

      <div style={{ 
               marginLeft: 256, 
               width: "100%" 
              }}>
        <Navbar />

        <div style={{ padding: "32px 36px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <div>
              <p style={{ 
                     ...body, 
                     color: C.terracotta, 
                     fontSize: 12, 
                     letterSpacing: 1.5, 
                     textTransform: "uppercase", 
                     margin: "0 0 4px" 
                    }}>
                Network
              </p>
              <h2 style={{ ...heading, fontSize: 30 }}>Hospitals</h2>
            </div>

            <button
              style={primaryBtn}
              onMouseOver={(e) => (e.currentTarget.style.background = C.forestDark)}
              onMouseOut={(e) => (e.currentTarget.style.background = C.forest)}
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              {showForm ? "Close" : "+ Add Hospital"}
            </button>
          </div>

          {showForm && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
                marginBottom: 28,
                maxWidth: 480,
              }}
            >
              <h3 style={{ ...heading, fontSize: 18, marginBottom: 16 }}>
                {editingId ? "Update Hospital" : "New Hospital"}
              </h3>

              <input 
                  style={inputStyle} 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Hospital name" 
              />

              <input 
                  style={inputStyle} 
                  name="address" 
                  value={form.address} 
                  onChange={handleChange} 
                  placeholder="Address" 
              />

              <input 
                  style={inputStyle} 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  placeholder="City" 
              />

              <input 
                  style={inputStyle} 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  placeholder="Phone" 
              />

              <button
                style={{ 
                    ...primaryBtn, 
                    width: "100%", 
                    opacity: saving ? 0.7 : 1 
                  }}
                onClick={saveHospital}
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update Hospital" : "Create Hospital"}
              </button>
            </div>
          )}

          {hospitals.length === 0 ? (
            <div
              style={{
                background: C.surface,
                border: `1px dashed ${C.border}`,
                borderRadius: 16,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <p style={{ 
                      ...body, 
                      color: C.muted, 
                      fontSize: 15 
                    }}>
                No hospitals yet. Add the first one to start building sessions and slots.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 18,
              }}
            >
              {hospitals.map((h) => (
                <div
                  key={h.id}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 22,
                  }}
                >
                  <h3 style={{ ...heading, fontSize: 19, marginBottom: 10 }}>{h.name}</h3>

                  <p style={{ ...body, color: C.muted, fontSize: 13.5, margin: "0 0 4px" }}>{h.address}</p>
                  <p style={{ ...body, color: C.muted, fontSize: 13.5, margin: "0 0 4px" }}>{h.city}</p>
                  <p style={{ ...body, color: C.muted, fontSize: 13.5, margin: "0 0 16px" }}>{h.phone}</p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={editBtn} onClick={() => editHospital(h)}>
                      Edit
                    </button>
                    <button style={dangerGhostBtn} onClick={() => removeHospital(h.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}