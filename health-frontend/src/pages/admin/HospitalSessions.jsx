import { useEffect, useState } from "react";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

import {
  Building2,
  Clock3,
  Plus,
  Edit2,
  Trash2,
  X,
  Power,
  MapPin,
  Phone,
} from "lucide-react";

/* ─── Design tokens (shared with DoctorAvailability) ─── */
const T = {
  cream: "#F5F0E8",
  creamDark: "#EDE7D9",
  green: "#2D5016",
  greenMid: "#3D6B1F",
  greenLight: "#EBF2E3",
  terra: "#C4622D",
  terraLight: "#FAF0EA",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY_HOSPITAL = { name: "", address: "", city: "", phone: "" };
const EMPTY_SESSION = {
  hospitalId: "",
  day: "Monday",
  date: "",
  startTime: "06:00",
  endTime: "08:00"
};

/* ─── Shared bits ─────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, margin: 0, color: T.ink }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function LabeledInput({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{label}</label>
      <input
        {...props}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, outline: "none", background: T.cream, color: T.ink }}
      />
    </div>
  );
}

function LabeledSelect({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{label}</label>
      <select
        {...props}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, outline: "none", background: T.cream, color: T.ink }}
      >
        {children}
      </select>
    </div>
  );
}

function to12h(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/* ─── Main ────────────────────────────────────────── */
export default function AdminHospitalSessions() {
  const [tab, setTab] = useState("hospitals"); // hospitals | sessions
  const [hospitals, setHospitals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [hospitalForm, setHospitalForm] = useState(EMPTY_HOSPITAL);
  const [editingHospital, setEditingHospital] = useState(null);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION);
  const [editingSession, setEditingSession] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [hRes, sRes] = await Promise.all([api.get("/admin/hospitals"), api.get("/admin/hospital-sessions")]);
      setHospitals(Array.isArray(hRes.data) ? hRes.data : []);
      const allSessions = Array.isArray(sRes.data) ? sRes.data : [];

      setSessions(
        allSessions.filter(s => !(s.isExpired && !s.isActive))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to load hospitals/sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* ── Hospital CRUD ── */
  function openAddHospital() {
    setEditingHospital(null);
    setHospitalForm(EMPTY_HOSPITAL);
    setShowHospitalModal(true);
  }
  function openEditHospital(h) {
    setEditingHospital(h.id);
    setHospitalForm({ name: h.name || "", address: h.address || "", city: h.city || "", phone: h.phone || "" });
    setShowHospitalModal(true);
  }
  async function saveHospital() {
    if (!hospitalForm.name.trim()) return alert("Hospital name is required.");
    try {
      if (editingHospital) {
        await api.put(`/admin/hospital/${editingHospital}`, hospitalForm);
      } else {
        await api.post("/admin/hospital", hospitalForm);
      }
      setShowHospitalModal(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Failed to save hospital.");
    }
  }
  async function deleteHospital(id) {
    if (!window.confirm("Delete this hospital? Its sessions may also stop working.")) return;
    try {
      await api.delete(`/admin/hospital/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data || "Delete failed.");
    }
  }

  /* ── Session CRUD ── */
  function openAddSession(hospitalId) {
    setEditingSession(null);
    setSessionForm({ ...EMPTY_SESSION, hospitalId: hospitalId || hospitals[0]?.id || "" });
    setShowSessionModal(true);
  }
  function openEditSession(s) {
    setEditingSession(s.id);
    setSessionForm({
      hospitalId: s.hospitalId,
      day: s.day,
      date: s.date,
      startTime: s.startTime?.slice(0, 5) || "06:00",
      endTime: s.endTime?.slice(0, 5) || "08:00"
    });
    setShowSessionModal(true);
  }
  async function saveSession() {

    if (!sessionForm.hospitalId)
      return alert("Please select a hospital.");

    // এটা নতুন যোগ করুন
    if (!sessionForm.date)
      return alert("Please select a date.");

    if (sessionForm.startTime >= sessionForm.endTime)
      return alert("Start time must be before end time.");

    const payload = {
      hospitalId: Number(sessionForm.hospitalId),
      day: sessionForm.day,
      date: sessionForm.date,
      startTime: sessionForm.startTime + ":00",
      endTime: sessionForm.endTime + ":00"
    };

    console.log(payload);

    try {
      if (editingSession) {
        await api.put(
          `/admin/hospital-session/${editingSession}`,
          payload
        );
      } else {
        await api.post(
          "/admin/hospital-session",
          payload
        );
      }

      setShowSessionModal(false);
      loadAll();

    } catch (err) {
      console.log(err.response?.data);
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  }
  async function deleteSession(id) {
    if (!window.confirm("Delete this time slot? Doctors using it will lose this option.")) return;
    try {
      await api.delete(`/admin/hospital-session/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data || "Delete failed.");
    }
  }
  async function toggleSession(id) {
    try {
      await api.put(`/admin/hospital-session/${id}/toggle`);
      loadAll();
    } catch (err) {
      alert("Toggle failed.");
    }
  }
  async function cancelSession(id) {
    try {
      const res = await api.put(`/admin/hospital-session/${id}/cancel`);

      console.log(res.data);

      loadAll();
    } catch (err) {
      console.log(err.response);

      alert(err.response?.data || "Cancel failed.");
    }
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        background: T.cream
      }}>
        <div>

          <div style={{
            width: 44,
            height: 44,
            border: `3px solid ${T.green}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />

          <p style={{
            color: T.muted,
            fontSize: 14
          }}>Loading hospitals & sessions…
          </p>
        </div>

        <style>
          {`@keyframes spin{to{transform:rotate(360deg)}}`}
        </style>
      </div>
    );
  }

  const card = {
    background: T.white,
    borderRadius: 20,
    border: `1px solid ${T.border}`,
    boxShadow: "0 2px 8px rgba(0,0,0,.04)",
    overflow: "hidden"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.cream,
      padding: 28,
      fontFamily: "Inter, sans-serif",
      color: T.ink
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>


      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 14
      }}>
        <div>
          <h1 style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 900,
            fontSize: 28,
            margin: 0,
            color: T.ink
          }}>Hospitals & Sessions
          </h1>

          <p style={{
            fontSize: 14,
            color: T.muted,
            margin: "6px 0 0"
          }}>
            Define the hospitals and fixed time windows doctors are allowed to pick from.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 20
      }}>
        {[
          { id: "hospitals", label: "Hospitals", icon: Building2 },
          { id: "sessions", label: "Time Slots", icon: Clock3 },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${active ? T.green : T.border}`,
                background: active ? T.green : T.white,
                color: active ? T.white : T.ink,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* HOSPITALS TAB */}
      {tab === "hospitals" && (
        <div style={card}>
          <div style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${T.border}`,
            background: T.cream,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>

              <Building2 size={17} color={T.green} />
              <span style={{
                fontFamily: "Fraunces, serif",
                fontWeight: 700,
                fontSize: 17,
                color: T.ink
              }}>Hospitals
              </span>

            </div>
            <button
              onClick={openAddHospital}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: T.terra,
                color: T.white,
                border: "none",
                borderRadius: 12,
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer"
              }}
            >
              <Plus size={15} /> Add Hospital
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>

              <thead>
                <tr style={{ background: T.cream }}>
                  {["Hospital", "Location", "Phone", "Sessions", "Actions"].map((h) => (
                    <th key={h}
                      style={{
                        padding: "13px 20px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.muted,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        whiteSpace: "nowrap"
                      }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hospitals.length === 0 ? (
                  <tr>
                    <td colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "56px 0",
                        color: T.muted
                      }}>

                      <Building2 size={44}
                        style={{
                          opacity: 0.3,
                          display: "block",
                          margin: "0 auto 12px"
                        }} />

                      No hospitals yet. Add your first hospital.
                    </td>
                  </tr>
                ) : (
                  hospitals.map((h) => {
                    const count = sessions.filter((s) => s.hospitalId === h.id).length;
                    return (
                      <tr key={h.id} style={{ borderTop: `1px solid ${T.border}` }}>

                        <td style={{
                          padding: "15px 20px",
                          fontWeight: 700,
                          color: T.ink
                        }}>
                          {h.name}
                        </td>

                        <td style={{
                          padding: "15px 20px",
                          fontSize: 13,
                          color: T.muted
                        }}>

                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}>

                            <MapPin size={13} /> {[h.address, h.city].filter(Boolean).join(", ") || "—"}
                          </div>
                        </td>

                        <td style={{
                          padding: "15px 20px",
                          fontSize: 13,
                          color: T.muted
                        }}>

                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}>

                            <Phone size={13} /> {h.phone || "—"}
                          </div>
                        </td>

                        <td style={{ padding: "15px 20px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            background: T.greenLight,
                            color: T.green,
                            border: "1px solid #BBD9A0"
                          }}>
                            {count} slot{count === 1 ? "" : "s"}
                          </span>
                        </td>

                        <td style={{ padding: "15px 20px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => openAddSession(h.id)}
                              title="Add time slot for this hospital"
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                background: T.terraLight,
                                color: T.terra,
                                fontSize: 12,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: 5
                              }}
                            >
                              <Plus size={13} /> Slot
                            </button>
                            <button
                              onClick={() => openEditHospital(h)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                background: T.greenLight,
                                color: T.green,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteHospital(h.id)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                background: "#FEE2E2",
                                color: "#DC2626",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                        </td>

                      </tr>
                    );
                  })

                )}
              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* SESSIONS TAB */}
      {tab === "sessions" && (
        <div style={card}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock3 size={17} color={T.green} />
              <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Fixed Time Slots</span>
            </div>
            <button
              onClick={() => openAddSession(hospitals[0]?.id)}
              disabled={hospitals.length === 0}
              style={{ display: "flex", alignItems: "center", gap: 8, background: hospitals.length ? T.terra : T.border, color: T.white, border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 700, fontSize: 13.5, cursor: hospitals.length ? "pointer" : "not-allowed" }}
            >
              <Plus size={15} /> Add Time Slot
            </button>
          </div>

          {hospitals.length === 0 && (
            <div style={{ padding: "18px 24px", fontSize: 13, color: T.muted, background: T.terraLight, borderBottom: `1px solid ${T.border}` }}>
              Add a hospital first — time slots belong to a hospital.
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: T.cream }}>
                  {["Hospital", "Day & Date", "Time Window", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                      <Clock3 size={44} style={{ opacity: 0.3, display: "block", margin: "0 auto 12px" }} />
                      No time slots yet. Doctors won't be able to add availability until you create some.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: "15px 20px", fontWeight: 700, color: T.ink }}>{s.hospitalName}</td>
                      <td style={{ padding: "15px 20px" }}>
                        <div style={{ fontWeight: 600 }}>
                          {s.day}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: T.muted,
                            marginTop: 3,
                          }}
                        >
                          {new Date(s.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td style={{
                        padding: "15px 20px",
                        fontSize: 13.5,
                        color: T.ink
                      }}>

                        {to12h(s.startTime)} – {to12h(s.endTime)}
                      </td>
                      <td style={{ padding: "15px 20px" }}>

                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            background: s.isExpired
                              ? "#FEF3C7"
                              : s.isActive
                                ? T.greenLight
                                : "#FEE2E2",
                            color: s.isExpired
                              ? "#92400E"
                              : s.isActive
                                ? T.green
                                : "#991B1B",
                            border: `1px solid ${s.isExpired ? "#FCD34D"
                              : s.isActive ? "#BBD9A0"
                                : "#FECACA"
                              }`,
                          }}
                        >
                          {s.isExpired
                            ? "Expired"
                            : s.isActive
                              ? "Active"
                              : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "15px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            disabled={s.isExpired}
                            onClick={() => toggleSession(s.id)}
                            title={s.isActive ? "Deactivate" : "Activate"}

                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              cursor: "pointer",
                              background: s.isActive ? "#FEE2E2" : T.greenLight,
                              color: s.isActive ? "#DC2626" : T.green,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: s.isExpired ? .5 : 1,
                              cursor: s.isExpired ? "not-allowed" : "pointer",
                            }}
                          >
                            <Power size={14} />
                          </button>

                          <button
                            disabled={s.isExpired}
                            onClick={() => openEditSession(s)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              cursor: "pointer",
                              background: T.greenLight,
                              color: T.green,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: s.isExpired ? .5 : 1,
                              cursor: s.isExpired ? "not-allowed" : "pointer",
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              s.isExpired
                                ? cancelSession(s.id)
                                : deleteSession(s.id)
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              cursor: "pointer",
                              background: "#FEE2E2",
                              color: "#DC2626",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hospital modal */}
      {showHospitalModal && (
        <Modal title={editingHospital ? "Edit Hospital" : "Add Hospital"}
          onClose={() => setShowHospitalModal(false)}
        >

          <LabeledInput
            label="Hospital Name"
            value={hospitalForm.name}
            onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
            placeholder="e.g. ABC Hospital"
          />

          <LabeledInput
            label="Address"
            value={hospitalForm.address}
            onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
            placeholder="Street address"
          />

          <LabeledInput
            label="City"
            value={hospitalForm.city}
            onChange={(e) => setHospitalForm({ ...hospitalForm, city: e.target.value })}
            placeholder="City"
          />

          <LabeledInput
            label="Phone"
            value={hospitalForm.phone}
            onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
            placeholder="Contact number"
          />

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setShowHospitalModal(false)}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.cream,
                color: T.ink,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer"
              }}>

              Cancel
            </button>
            <button onClick={saveHospital}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: "none",
                background: T.green,
                color: T.white,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer"
              }}>
              {editingHospital ? "Save Changes" : "Add Hospital"}
            </button>
          </div>
        </Modal>
      )}

      {/* Session modal */}
      {showSessionModal && (
        <Modal title={editingSession ? "Edit Time Slot" : "Add Time Slot"}
          onClose={() => setShowSessionModal(false)}
        >

          <LabeledSelect
            label="Hospital"
            value={sessionForm.hospitalId}
            onChange={(e) => setSessionForm({ ...sessionForm, hospitalId: e.target.value })}
          >
            <option value="">Select Hospital</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </LabeledSelect>

          <LabeledSelect label="Day"
            value={sessionForm.day}
            onChange={(e) => setSessionForm({ ...sessionForm, day: e.target.value })}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </LabeledSelect>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              flex: 1
            }}>

              <LabeledInput label="Start Time" type="time"
                value={sessionForm.startTime}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, startTime: e.target.value })}
              />
            </div>

            <div style={{ flex: 1 }}>
              <LabeledInput label="End Time" type="time"
                value={sessionForm.endTime}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, endTime: e.target.value })}
              />
            </div>

            <div style={{ flex: 1 }}>
              <LabeledInput
                label="Date"
                type="date"
                value={sessionForm.date}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    date: e.target.value
                  })
                }
              />
            </div>
          </div>

          <p style={{
            fontSize: 11.5,
            color: T.muted,
            margin: "-6px 0 16px"
          }}>

            Doctors picking "{hospitals.find((h) => h.id == sessionForm.hospitalId)?.name || "this hospital"}" will only be able to choose this exact window — they can't set their own time.
          </p>

          <div style={{
            display: "flex",
            gap: 10,
            marginTop: 8
          }}>

            <button onClick={() => setShowSessionModal(false)}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.cream,
                color: T.ink,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer"
              }}>

              Cancel
            </button>

            <button onClick={saveSession}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: "none",
                background: T.terra,
                color: T.white,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer"
              }}>

              {editingSession ? "Save Changes" : "Add Slot"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}