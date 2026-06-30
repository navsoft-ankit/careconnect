import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  CalendarDays, CheckCircle2, Clock3, Edit2, Trash2,
  Plus, X, LayoutGrid,
} from "lucide-react";

/* ─── Design tokens ───────────────────────────────── */
const T = {
  cream:     "#F5F0E8",
  creamDark: "#EDE7D9",
  green:     "#2D5016",
  greenMid:  "#3D6B1F",
  greenLight:"#EBF2E3",
  terra:     "#C4622D",
  terraLight:"#FAF0EA",
  ink:       "#1A1A1A",
  muted:     "#6B7280",
  border:    "#E2DACE",
  white:     "#FFFFFF",
};

function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{
      background: T.white, borderRadius: 20, padding: "22px 24px",
      border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{label}</p>
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 40, margin: "8px 0 0", color: T.ink }}>{value}</h2>
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
    </div>
  );
}

function SlotBadge({ booked }) {
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
      background: booked ? "#FEE2E2" : T.greenLight,
      color: booked ? "#991B1B" : T.green,
      border: `1px solid ${booked ? "#FECACA" : "#BBD9A0"}`,
    }}>
      {booked ? "Booked" : "Available"}
    </span>
  );
}

/* ─── Modal ─────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden" }}>
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

function DTInput({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{label}</label>
      <input type="datetime-local" value={value} onChange={onChange}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, outline: "none", background: T.cream, color: T.ink }} />
    </div>
  );
}

/* ─── Main ────────────────────────────────────────── */
export default function DoctorAvailability() {
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const [newSlot, setNewSlot] = useState({ availableFrom: "", availableTo: "" });
  const [editData, setEditData] = useState({ id: 0, availableFrom: "", availableTo: "" });

  const load = async () => {
    try {
      const res = await api.get("/Doctor/availability");
      setSlots(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load availability.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addSlot = async () => {
    if (!newSlot.availableFrom || !newSlot.availableTo) {
      alert("Please select both From and To.");
      return;
    }
    try {
      await api.post("/Doctor/availability", newSlot);
      setNewSlot({ availableFrom: "", availableTo: "" });
      setShowAdd(false);
      load();
    } catch {
      alert("Failed to add slot.");
    }
  };

  const saveEdit = async () => {
    try {
      await api.put("/Doctor/availability", editData);
      setEditing(null);
      load();
    } catch {
      alert("Update failed.");
    }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await api.delete(`/Doctor/availability/${id}`);
      load();
    } catch {
      alert("Delete failed.");
    }
  };

  const totalSlots   = slots.length;
  const availSlots   = slots.filter(s => !s.isBooked).length;
  const bookedSlots  = slots.filter(s => s.isBooked).length;

  const filtered = slots.filter(s => {
    if (!search) return true;
    return s.availableFrom.substring(0, 10).includes(search);
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", background: T.cream }}>
      <div>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.green}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: T.muted, fontSize: 14 }}>Loading availability…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  const card = { background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" };

  return (
    <div style={{ minHeight: "100vh", background: T.cream, padding: 28, fontFamily: "Inter, sans-serif", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28, margin: 0, color: T.ink }}>My Availability</h1>
          <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>Manage your consultation time slots</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: "flex", alignItems: "center", gap: 8, background: T.terra, color: T.white,
          border: "none", borderRadius: 12, padding: "12px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
          transition: "background .15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#A8502A"}
          onMouseLeave={e => e.currentTarget.style.background = T.terra}>
          <Plus size={16} /> Add Time Slot
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Slots"     value={totalSlots}  accent={T.green}   icon={<LayoutGrid size={22} />} />
        <StatCard label="Available Slots" value={availSlots}  accent={T.green}   icon={<CheckCircle2 size={22} />} />
        <StatCard label="Booked Slots"    value={bookedSlots} accent="#DC2626"   icon={<CalendarDays size={22} />} />
      </div>

      {/* Table */}
      <div style={card}>
        {/* Toolbar */}
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock3 size={17} color={T.green} />
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Slot List</span>
          </div>
          <input type="date" value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, background: T.white, color: T.ink, outline: "none" }} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.cream }}>
                {["#", "Available From", "Available To", "Duration", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                    <CalendarDays size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                    No slots found. Add your first availability slot.
                  </td>
                </tr>
              ) : filtered.map((slot, i) => {
                const from = new Date(slot.availableFrom);
                const to   = new Date(slot.availableTo);
                const mins = Math.round((to - from) / 60000);
                const dur  = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? mins % 60 + "m" : ""}`.trim() : `${mins}m`;
                return (
                  <tr key={slot.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.cream}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted, fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: "15px 20px", fontSize: 14, color: T.ink, whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600 }}>{from.toLocaleDateString()}</div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{from.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td style={{ padding: "15px 20px", fontSize: 14, color: T.ink, whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600 }}>{to.toLocaleDateString()}</div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{to.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock3 size={13} color={T.muted} />
                        <span style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{dur}</span>
                      </div>
                    </td>
                    <td style={{ padding: "15px 20px" }}><SlotBadge booked={slot.isBooked} /></td>
                    <td style={{ padding: "15px 20px" }}>
                      {!slot.isBooked ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => {
                            setEditing(slot.id);
                            setEditData({ id: slot.id, availableFrom: slot.availableFrom.slice(0, 16), availableTo: slot.availableTo.slice(0, 16) });
                          }} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: T.greenLight, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity .15s" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => deleteSlot(slot.id)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity .15s" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
          <span style={{ fontSize: 12, color: T.muted }}>
            Showing <b style={{ color: T.ink }}>{filtered.length}</b> of <b style={{ color: T.ink }}>{totalSlots}</b> slots
          </span>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add New Time Slot" onClose={() => setShowAdd(false)}>
          <DTInput label="Available From" value={newSlot.availableFrom} onChange={e => setNewSlot({ ...newSlot, availableFrom: e.target.value })} />
          <DTInput label="Available To"   value={newSlot.availableTo}   onChange={e => setNewSlot({ ...newSlot, availableTo: e.target.value })} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${T.border}`, background: T.cream, color: T.ink, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={addSlot} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: T.terra, color: T.white, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Add Slot</button>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal title="Edit Time Slot" onClose={() => setEditing(null)}>
          <DTInput label="Available From" value={editData.availableFrom} onChange={e => setEditData({ ...editData, availableFrom: e.target.value })} />
          <DTInput label="Available To"   value={editData.availableTo}   onChange={e => setEditData({ ...editData, availableTo: e.target.value })} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${T.border}`, background: T.cream, color: T.ink, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={saveEdit} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: T.green, color: T.white, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Save Changes</button>
          </div>
        </Modal>
      )}
    </div>
  );
}