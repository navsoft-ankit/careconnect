import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Plus, X, Trash2, Stethoscope, Building2, IndianRupee } from "lucide-react";

const T = {
  cream: "#F5F0E8",
  green: "#2D5016",
  greenLight: "#EBF2E3",
  terra: "#C4622D",
  terraLight: "#FAF0EA",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
};

function Field({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: T.ink,
        marginBottom: 6
      }}
      >{label}
      </label>

      <input {...props}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          border: `1px solid ${T.border}`,
          fontSize: 13.5,
          outline: "none",
          background: T.cream,
          color: T.ink,
          fontFamily: "inherit"
        }} />
    </div>
  );
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    hospitalName: "",
    fee: "",
    about: "",
  });

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    const res = await api.get("/admin/doctors");
    setDoctors(res.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createDoctor = async () => {
    try {
      const payload = { ...form, fee: Number(form.fee) };
      await api.post("/admin/doctor", payload);
      alert("Doctor created");
      setForm({
        fullName: "",
        email: "",
        password: "",
        specialization: "",
        hospitalName: "",
        fee: "",
        about: ""
      });

      setShowForm(false);
      loadDoctors();
    } catch (err) {
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    await api.delete(`/admin/doctor/${id}`);
    setDoctors(doctors.filter((d) => d.id !== id));
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;}`}</style>
      <Sidebar />
      <div style={{
        marginLeft: 264,
        background: T.cream,
        minHeight: "100vh"
      }}>

        <Navbar />
        <div style={{ padding: "32px 28px" }}>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 14
          }}>
            <div>
              <p style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: T.terra,
                margin: "0 0 6px"
              }}>Team
              </p>

              <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: 30,
                color: T.ink,
                margin: 0
              }}>Doctors
              </h1>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: showForm ? T.white : T.terra,
                color: showForm ? T.ink : T.white,
                border: showForm ? `1px solid ${T.border}` : "none",
                borderRadius: 999,
                padding: "11px 20px",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer"
              }}
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              {showForm ? "Close Form" : "Create Doctor"}
            </button>
          </div>

          {showForm && (
            <div style={{
              background: T.white,
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              padding: 24,
              marginBottom: 24,
              maxWidth: 520
            }}>

              <Field label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Dr. John Doe"
              />

              <Field label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@example.com"
              />

              <Field label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />

              <Field label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Cardiologist"
              />

              <Field label="Hospital Name"
                name="hospitalName"
                value={form.hospitalName}
                onChange={handleChange}
                placeholder="ABC Hospital"
              />

              <Field label="Fee"
                name="fee"
                type="number"
                value={form.fee}
                onChange={handleChange}
                placeholder="500"
              />

              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.ink,
                  marginBottom: 6
                }}>About
                </label>

                <textarea
                  name="about"
                  rows={3}
                  value={form.about}
                  onChange={handleChange}
                  placeholder="Short bio"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    fontSize: 13.5,
                    outline: "none",
                    background: T.cream,
                    color: T.ink,
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              <button
                onClick={createDoctor}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 999,
                  border: "none",
                  background: T.green,
                  color: T.white,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer"
                }}>
                Create Doctor
              </button>
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16
          }}>
            {doctors.length === 0 ? (
              <div style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "56px 0",
                color: T.muted,
                background: T.white,
                borderRadius: 20,
                border: `1px solid ${T.border}`
              }}>
                <Stethoscope
                  size={44}
                  style={{
                    opacity: 0.3,
                    margin: "0 auto 12px"
                  }} />
                No doctors yet.
              </div>
            ) : (
              doctors.map((d) => (
                <div key={d.id}
                  style={{
                    background: T.white,
                    borderRadius: 18,
                    border: `1px solid ${T.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                    padding: 20
                  }}>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10
                  }}>

                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: T.greenLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Stethoscope size={18} color={T.green} />
                    </div>

                    <div>
                      <h3 style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 700,
                        fontSize: 16,
                        margin: 0,
                        color: T.ink
                      }}>{d.doctorName}
                      </h3>

                      <p style={{
                        fontSize: 12.5,
                        color: T.terra,
                        margin: "2px 0 0",
                        fontWeight: 600
                      }}>{d.specialization}
                      </p>
                    </div>
                  </div>

                  <p style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: T.muted,
                    margin: "4px 0"
                  }}>
                    <Building2 size={13} /> {d.hospitalName}
                  </p>

                  <p style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    color: T.ink,
                    fontWeight: 600,
                    margin: "4px 0 14px"
                  }}>
                    <IndianRupee size={13} /> {d.fee}
                  </p>

                  <button
                    onClick={() => remove(d.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      width: "100%",
                      justifyContent: "center",
                      padding: "9px 0",
                      borderRadius: 10,
                      border: "none",
                      background: "#FEE2E2",
                      color: "#DC2626",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ))
            )}

          </div>

        </div>

      </div>

    </div>
  );
}