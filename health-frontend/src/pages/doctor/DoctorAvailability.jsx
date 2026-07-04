import { useEffect, useState } from "react";
import api from "../../services/api";
import {
    CalendarDays, CheckCircle2, Clock3, Edit2, Trash2,
    Plus, X, LayoutGrid, Users,
} from "lucide-react";

/* ─── Design tokens ───────────────────────────────── */
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

function StatCard({ label, value, accent, icon }) {
    return (
        <div style={{
            background: T.white,
            borderRadius: 20,
            padding: "22px 24px",
            border: `1px solid ${T.border}`,
            boxShadow: "0 2px 8px rgba(0,0,0,.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}>
            <div>
                <p style={{
                    fontSize: 13,
                    color: T.muted,
                    margin: 0
                }}>
                    {label}
                </p>

                <h2 style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 800,
                    fontSize: 40,
                    margin: "8px 0 0",
                    color: T.ink
                }}>
                    {value}
                </h2>

            </div>
            <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: accent + "22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <span style={{ color: accent }}>{icon}</span>
            </div>
        </div>
    );
}

// Full = no seats left at all. Partially booked slots still count as "Available".
function SlotBadge({ seatsLeft, maxPatients }) {
    const full = seatsLeft <= 0;
    return (
        <span style={{
            padding: "4px 12px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 700,
            background: full ? "#FEE2E2" : T.greenLight,
            color: full ? "#991B1B" : T.green,
            border: `1px solid ${full ? "#FECACA" : "#BBD9A0"}`,
            whiteSpace: "nowrap",
        }}>
            {full ? "Fully Booked" : `${seatsLeft}/${maxPatients} seats left`}
        </span>
    );
}

/* ─── Modal ─────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
        }}>

            <div style={{
                background: T.white,
                borderRadius: 20,
                width: "100%",
                maxWidth: 480,
                boxShadow: "0 20px 60px rgba(0,0,0,.2)",
                overflow: "hidden"
            }}>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    borderBottom: `1px solid ${T.border}`,
                    background: T.cream
                }}>

                    <h3 style={{
                        fontFamily: "Fraunces, serif",
                        fontWeight: 700,
                        fontSize: 18,
                        margin: 0,
                        color: T.ink
                    }}>
                        {title}
                    </h3>

                    <button onClick={onClose} style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.muted,
                        display: "flex"
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: 24 }}>{children}</div>
            </div>
        </div>
    );
}

function MaxPatientsInput({ value, onChange, locked }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: T.ink,
                marginBottom: 6
            }}>
                <Users size={14} /> Max Patients for this slot
            </label>
            <input
                type="number"
                min={1}
                value={value}
                disabled={locked}
                onChange={onChange}
                placeholder="e.g. 20"
                style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    fontSize: 13,
                    outline: "none",
                    background: locked ? T.creamDark : T.cream,
                    color: T.ink,
                }}
            />
            <p style={{
                fontSize: 11,
                color: T.muted,
                margin: "6px 0 0"
            }}>
                {locked
                    ? "Can't change this once patients have booked."
                    : "How many patients you're willing to see in this time window."}
            </p>
        </div>
    );
}

const EMPTY_NEW_SLOT = {
    hospitalId: "",
    hospitalSessionId: "",
    date: "",
    fromTime: "",
    toTime: "",
    maxPatients: 20,
};

/* ─── Main ────────────────────────────────────────── */
export default function DoctorAvailability() {
    const [slots, setSlots] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState(null);
    const [newSlot, setNewSlot] = useState(EMPTY_NEW_SLOT);
    const [editData, setEditData] = useState({
        id: 0,
        hospitalId: "",
        hospitalSessionId: "",
        date: "",
        fromTime: "",
        toTime: "",
        maxPatients: 20,
    });

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

    useEffect(() => {
        load();
        loadHospitals();
    }, []);

    const addSlot = async () => {

        if (!newSlot.hospitalId) {
            alert("Please select Hospital.");
            return;
        }

        if (!newSlot.hospitalSessionId) {
            alert("Please select Session.");
            return;
        }

        if (!newSlot.date) {
            alert("Please select Date.");
            return;
        }

        if (!newSlot.fromTime) {
            alert("Please select From Time.");
            return;
        }

        if (!newSlot.toTime) {
            alert("Please select To Time.");
            return;
        }

        if (!newSlot.maxPatients || newSlot.maxPatients < 1) {
            alert("Max patients must be at least 1.");
            return;
        }

        try {

            await api.post("/Doctor/availability", {

                hospitalId: Number(newSlot.hospitalId),

                hospitalSessionId: Number(newSlot.hospitalSessionId),

                date: newSlot.date,

                fromTime: newSlot.fromTime + ":00",
                toTime: newSlot.toTime + ":00",

                maxPatients: Number(newSlot.maxPatients),

            });

            setNewSlot(EMPTY_NEW_SLOT);

            setShowAdd(false);

            load();

        }
        catch (err) {

            console.log(err);

            alert(err.response?.data || "Failed to add slot.");

        }

    };

    const saveEdit = async () => {
        console.log("SAVE BUTTON CLICKED");
        console.log(editData);

        if (!editData.hospitalId) {
            alert("Please select Hospital.");
            return;
        }

        if (!editData.hospitalSessionId) {
            alert("Please select Session.");
            return;
        }

        if (!editData.date) {
            alert("Please select Date.");
            return;
        }

        if (!editData.maxPatients || editData.maxPatients < 1) {
            alert("Max patients must be at least 1.");
            return;
        }

        try {
            const response = await api.put("/Doctor/availability", {
                id: editData.id,
                hospitalId: Number(editData.hospitalId),
                hospitalSessionId: Number(editData.hospitalSessionId),
                date: editData.date,
                fromTime: editData.fromTime + ":00",
                toTime: editData.toTime + ":00",
                maxPatients: Number(editData.maxPatients),
            });

            console.log("SUCCESS", response.data);

            await load();

            setEditing(null);
        }
        catch (err) {
            console.log("STATUS", err.response?.status);
            console.log("DATA", err.response?.data);
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

    async function loadHospitals() {
        const res = await api.get("/Doctor/hospitals");
        setHospitals(res.data);
    }

    async function loadSessions(hospitalId) {

        if (!hospitalId) {
            setSessions([]);
            return;
        }

        const res = await api.get(
            `/Doctor/hospital-sessions/${hospitalId}`
        );

        setSessions(res.data);
    }

    const totalSlots = slots.length;
    const totalSeats = slots.reduce((s, x) => s + (x.maxPatients || 0), 0);
    const seatsLeftTotal = slots.reduce((s, x) => s + ((x.maxPatients || 0) - (x.bookedCount || 0)), 0);
    const fullSlots = slots.filter(s => (s.maxPatients - s.bookedCount) <= 0).length;

    const filtered = slots.filter(s => {
        if (!search) return true;
        return s.availableFrom.substring(0, 10).includes(search);
    });

    if (loading) return (
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
                }}
                />

                <p style={{
                    color: T.muted,
                    fontSize: 14
                }}>
                    Loading availability…
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

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
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
      `}</style>

            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 28,
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
                    }}>
                        My Availability
                    </h1>

                    <p style={{
                        fontSize: 14,
                        color: T.muted,
                        margin: "6px 0 0"
                    }}>
                        Manage your consultation time slots and seat capacity
                    </p>
                </div>
                <button onClick={() => setShowAdd(true)} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: T.terra,
                    color: T.white,
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 20px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "background .15s",
                }}
                    onMouseEnter={e => e.currentTarget.style.background = "#A8502A"}
                    onMouseLeave={e => e.currentTarget.style.background = T.terra}>
                    <Plus size={16} /> Add Time Slot
                </button>
            </div>

            {/* Stats */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: 16,
                marginBottom: 24
            }}>

                <StatCard label="Total Slots"
                    value={totalSlots}
                    accent={T.green}
                    icon={<LayoutGrid size={22} />}
                />

                <StatCard label="Total Seats"
                    value={totalSeats}
                    accent={T.green}
                    icon={<Users size={22} />}
                />

                <StatCard label="Seats Left"
                    value={seatsLeftTotal}
                    accent={T.terra}
                    icon={<CheckCircle2 size={22} />}
                />

                <StatCard label="Fully Booked Slots"
                    value={fullSlots}
                    accent="#DC2626"
                    icon={<CalendarDays size={22} />}
                />
            </div>

            {/* Table */}
            <div style={card}>
                {/* Toolbar */}
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

                        <Clock3 size={17} color={T.green} />
                        <span style={{
                            fontFamily: "Fraunces, serif",
                            fontWeight: 700,
                            fontSize: 17,
                            color: T.ink
                        }}>Slot List
                        </span>

                    </div>
                    <input type="date" value={search} onChange={e => setSearch(e.target.value)}
                        style={{
                            padding: "9px 14px",
                            borderRadius: 10,
                            border: `1px solid ${T.border}`,
                            fontSize: 13,
                            background: T.white,
                            color: T.ink,
                            outline: "none"
                        }} />
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}>
                        <thead>
                            <tr style={{ background: T.cream }}>
                                {[
                                    "#",
                                    "Hospital",
                                    "Session",
                                    "Date",
                                    "Seats",
                                    "Actions"
                                ].map(h => (
                                    <th key={h} style={{
                                        padding: "13px 20px",
                                        textAlign: "left",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: T.muted,
                                        textTransform: "uppercase",
                                        letterSpacing: .6,
                                        whiteSpace: "nowrap"
                                    }}>{h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{
                                        textAlign: "center",
                                        padding: "56px 0",
                                        color: T.muted
                                    }}>
                                        <CalendarDays size={44}
                                            style={{
                                                opacity: .3,
                                                display: "block",
                                                margin: "0 auto 12px"
                                            }} />
                                        No slots found. Add your first availability slot.
                                    </td>
                                </tr>
                            ) : filtered.map((slot, i) => {
                                const from = new Date(slot.availableFrom);
                                const to = new Date(slot.availableTo);
                                const mins = Math.round((to - from) / 60000);
                                const dur = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? mins % 60 + "m" : ""}`.trim() : `${mins}m`;
                                const seatsLeft = slot.seatsLeft ?? (slot.maxPatients - slot.bookedCount);
                                const hasBookings = (slot.bookedCount || 0) > 0;

                                return (
                                    <tr key={slot.id} style={{
                                        borderTop: `1px solid ${T.border}`,
                                        transition: "background .12s"
                                    }}

                                        onMouseEnter=
                                        {e => e.currentTarget.style.background = T.cream}

                                        onMouseLeave=
                                        {e => e.currentTarget.style.background = "transparent"}>

                                        <td style={{
                                            padding: "15px 20px",
                                            fontSize: 13,
                                            color: T.muted,
                                            fontWeight: 600
                                        }}>{i + 1}
                                        </td>



                                        <td style={{ padding: "15px 20px" }}>

                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    color: T.ink,
                                                }}
                                            >
                                                {slot.hospitalName}
                                            </div>

                                        </td>
                                        <td style={{ padding: "15px 20px" }}>

                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: T.ink,
                                                }}
                                            >
                                                {slot.day}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: T.muted,
                                                    marginTop: 4,
                                                }}
                                            >
                                                {slot.sessionStart} - {slot.sessionEnd}
                                            </div>

                                        </td>
                                        <td style={{ padding: "15px 20px" }}>

                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: T.ink,
                                                }}
                                            >
                                                {new Date(slot.availableFrom).toLocaleDateString()}
                                            </div>

                                        </td>
                                        <td style={{ padding: "15px 20px" }}>
                                            <SlotBadge seatsLeft={seatsLeft}
                                                maxPatients={slot.maxPatients}
                                            />
                                            <div style={{
                                                fontSize: 11,
                                                color: T.muted,
                                                marginTop: 4
                                            }}>
                                                {slot.bookedCount}
                                                booked
                                            </div>
                                        </td>
                                        <td style={{ padding: "15px 20px" }}>
                                            {!hasBookings ? (
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button onClick={() => {
                                                        setEditing(slot.id);
                                                        setEditData({
                                                            id: slot.id,
                                                            hospitalId: slot.hospitalId,
                                                            hospitalSessionId: slot.hospitalSessionId,

                                                            date: slot.availableFrom.substring(0, 10),

                                                            fromTime: slot.availableFrom.substring(11, 16),

                                                            toTime: slot.availableTo.substring(11, 16),

                                                            maxPatients: slot.maxPatients,
                                                        });

                                                        loadSessions(slot.hospitalId);

                                                    }} style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: 8,
                                                        border: "none",
                                                        cursor: "pointer",
                                                        background: T.greenLight,
                                                        color: T.green,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        transition: "opacity .15s"
                                                    }}

                                                        onMouseEnter=
                                                        {e => e.currentTarget.style.opacity = ".75"}
                                                        onMouseLeave=
                                                        {e => e.currentTarget.style.opacity = "1"}>
                                                        <Edit2 size={15} />

                                                    </button>
                                                    <button onClick={() =>
                                                        deleteSlot(slot.id)}
                                                        style={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: 8,
                                                            border: "none",
                                                            cursor: "pointer",
                                                            background: "#FEE2E2",
                                                            color: "#DC2626",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            transition: "opacity .15s"
                                                        }}

                                                        onMouseEnter=
                                                        {e => e.currentTarget.style.opacity = ".75"}
                                                        onMouseLeave=
                                                        {e => e.currentTarget.style.opacity = "1"}>
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{
                                                    fontSize: 12,
                                                    color: T.muted,
                                                    fontWeight: 600
                                                }}>Locked — has bookings
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{
                    padding: "14px 24px",
                    borderTop: `1px solid ${T.border}`,
                    background: T.cream
                }}>
                    <span style={{
                        fontSize: 12,
                        color: T.muted
                    }}>

                        Showing <b style={{ color: T.ink }}>
                            {filtered.length}
                        </b> of <b style={{ color: T.ink }}>
                            {totalSlots}
                        </b>
                        slots
                    </span>
                </div>
            </div>

            {/* Add modal */}
            {showAdd && (
                <Modal title="Add New Time Slot"
                    onClose={() => setShowAdd(false)}
                >

                    <div style={{ marginBottom: 16 }}>

                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: T.ink,
                                marginBottom: 6,
                            }}
                        >
                            Hospital
                        </label>

                        <select
                            value={newSlot.hospitalId}
                            onChange={(e) => {

                                setNewSlot({
                                    ...newSlot,
                                    hospitalId: e.target.value,
                                    hospitalSessionId: "",
                                });

                                loadSessions(e.target.value);

                            }}
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        >

                            <option value="">
                                Select Hospital
                            </option>

                            {hospitals.map(h => (

                                <option
                                    key={h.id}
                                    value={h.id}
                                >
                                    {h.name}
                                </option>

                            ))}

                        </select>

                    </div>
                    <div style={{ marginBottom: 16 }}>

                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: T.ink,
                                marginBottom: 6,
                            }}
                        >
                            Session
                        </label>

                        <select
                            value={newSlot.hospitalSessionId}
                            onChange={(e) => {

                                const id = Number(e.target.value);

                                const session = sessions.find(s => s.id === id);
                                console.log(session);

                                setNewSlot({
                                    ...newSlot,
                                    hospitalSessionId: id,
                                    date: session.date,
                                    fromTime: session.startTime.substring(0, 5),
                                    toTime: session.endTime.substring(0, 5),
                                });
                            }}
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        >

                            <option value="">
                                Select Session
                            </option>

                            {sessions.map(s => (

                                <option
                                    key={s.id}
                                    value={s.id}
                                >
                                    {s.day} | {s.startTime} - {s.endTime}
                                </option>

                            ))}

                        </select>

                    </div>
                    <div style={{ marginBottom: 16 }}>

                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: T.ink,
                                marginBottom: 6,
                            }}
                        >
                            Date
                        </label>

                        <input
                            type="date"
                            value={newSlot.date}
                            readOnly
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.creamDark
                            }}
                        />

                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: T.ink,
                                marginBottom: 6,
                            }}
                        >
                            From Time
                        </label>

                        <input
                            type="time"
                            value={newSlot.fromTime}
                            min={
                                sessions.find(
                                    s => s.id === Number(newSlot.hospitalSessionId)
                                )?.startTime.substring(0, 5)
                            }
                            max={
                                sessions.find(
                                    s => s.id === Number(newSlot.hospitalSessionId)
                                )?.endTime.substring(0, 5)
                            }
                            onChange={(e) =>
                                setNewSlot({
                                    ...newSlot,
                                    fromTime: e.target.value,
                                })
                            }
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: T.ink,
                                marginBottom: 6,
                            }}
                        >
                            To Time
                        </label>

                        <input
                            type="time"
                            value={newSlot.toTime}
                            min={
                                sessions.find(
                                    s => s.id === Number(newSlot.hospitalSessionId)
                                )?.startTime.substring(0, 5)
                            }
                            max={
                                sessions.find(
                                    s => s.id === Number(newSlot.hospitalSessionId)
                                )?.endTime.substring(0, 5)
                            }
                            onChange={(e) =>
                                setNewSlot({
                                    ...newSlot,
                                    toTime: e.target.value,
                                })
                            }
                        />
                    </div>

                    <MaxPatientsInput value={newSlot.maxPatients}
                        onChange={e => setNewSlot(
                            { ...newSlot, maxPatients: e.target.value }
                        )}
                    />

                    <div style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 8
                    }}>

                        <button
                            onClick={() =>
                                setShowAdd(false)}
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
                            }}>Cancel
                        </button>

                        <button
                            onClick={addSlot}
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
                            }}>Add Slot
                        </button>
                    </div>
                </Modal>
            )}

            {/* Edit modal */}
            {editing && (
                <Modal
                    title="Edit Time Slot"
                    onClose={() => setEditing(null)}
                >
                    {/* Hospital */}
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 6,
                                color: T.ink,
                            }}
                        >
                            Hospital
                        </label>

                        <select
                            value={editData.hospitalId}
                            onChange={(e) => {

                                const id = Number(e.target.value);

                                const session = sessions.find(s => s.id === id);


                                setEditData({
                                    ...editData,
                                    hospitalSessionId: id,
                                    fromTime: session.startTime.substring(0, 5),
                                    toTime: session.endTime.substring(0, 5),
                                });

                            }}
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        >
                            <option value="">Select Hospital</option>

                            {hospitals.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Session */}
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 6,
                                color: T.ink,
                            }}
                        >
                            Session
                        </label>

                        <select
                            value={editData.hospitalSessionId}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    hospitalSessionId: e.target.value,
                                })
                            }
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        >
                            <option value="">Select Session</option>

                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.day} | {s.startTime} - {s.endTime}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 6,
                                color: T.ink,
                            }}
                        >
                            Date
                        </label>

                        <input
                            type="date"
                            value={editData.date}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    date: e.target.value,
                                })
                            }
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        />
                    </div>

                    {/* From Time */}
                    <div style={{ marginBottom: 16 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 6,
                                color: T.ink,
                            }}
                        >
                            From Time
                        </label>

                        <input
                            type="time"
                            value={editData.fromTime}
                            min={
                                sessions.find(
                                    (s) => s.id === Number(editData.hospitalSessionId)
                                )?.startTime?.substring(0, 5)
                            }
                            max={
                                sessions.find(
                                    (s) => s.id === Number(editData.hospitalSessionId)
                                )?.endTime?.substring(0, 5)
                            }
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    fromTime: e.target.value,
                                })
                            }
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        />
                    </div>

                    {/* To Time */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 6,
                                color: T.ink,
                            }}
                        >
                            To Time
                        </label>

                        <input
                            type="time"
                            value={editData.toTime}
                            min={
                                sessions.find(
                                    (s) => s.id === Number(editData.hospitalSessionId)
                                )?.startTime?.substring(0, 5)
                            }
                            max={
                                sessions.find(
                                    (s) => s.id === Number(editData.hospitalSessionId)
                                )?.endTime?.substring(0, 5)
                            }
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    toTime: e.target.value,
                                })
                            }
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                            }}
                        />
                    </div>

                    {/* Allowed Time */}
                    {sessions.find(
                        (s) => s.id === Number(editData.hospitalSessionId)
                    ) && (
                            <div
                                style={{
                                    marginBottom: 16,
                                    padding: "10px 12px",
                                    background: T.greenLight,
                                    borderRadius: 8,
                                    color: T.green,
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                Allowed Time :
                                {" "}
                                {
                                    sessions
                                        .find(
                                            (s) =>
                                                s.id === Number(
                                                    editData.hospitalSessionId
                                                )
                                        )
                                        ?.startTime.substring(0, 5)
                                }
                                {" - "}
                                {
                                    sessions
                                        .find(
                                            (s) =>
                                                s.id === Number(
                                                    editData.hospitalSessionId
                                                )
                                        )
                                        ?.endTime.substring(0, 5)
                                }
                            </div>
                        )}
                    {/* Max Patients */}
                    <MaxPatientsInput
                        value={editData.maxPatients}
                        onChange={(e) =>
                            setEditData({
                                ...editData,
                                maxPatients: e.target.value,
                            })
                        }
                    />
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginTop: 10,
                        }}
                    >
                        <button
                            onClick={() => setEditing(null)}
                            style={{
                                flex: 1,
                                padding: "11px 0",
                                borderRadius: 10,
                                border: `1px solid ${T.border}`,
                                background: T.cream,
                                color: T.ink,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={saveEdit}
                            style={{
                                flex: 1,
                                padding: "11px 0",
                                borderRadius: 10,
                                border: "none",
                                background: T.green,
                                color: T.white,
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}