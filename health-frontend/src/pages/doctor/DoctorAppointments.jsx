import { useEffect, useState } from "react";
import api from "../../services/api";
import {
    CheckCircle2, XCircle, ClipboardList, Calendar,
    UserCircle2, Mail, Search, Filter,
} from "lucide-react";
import PrescriptionModal from "./PrescriptionModal";

/* ─── Design tokens ───────────────────────────────── */
const T = {
    cream: "#F5F0E8",
    creamDark: "#EDE7D9",
    green: "#2D5016",
    greenLight: "#EBF2E3",
    terra: "#C4622D",
    terraLight: "#FAF0EA",
    ink: "#1A1A1A",
    muted: "#6B7280",
    border: "#E2DACE",
    white: "#FFFFFF",
};

const STATUS_CFG = {
    Confirmed: { bg: T.greenLight, text: T.green, border: "#BBD9A0" },
    Pending: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A" },
    Cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
    CancelledByUser: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
    CancelledByAdmin: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
    Completed: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
};
const th = {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: 12,
    color: T.muted,
    background: T.cream,
    fontWeight: 700,
};

const td = {
    padding: "16px 20px",
};

function Badge({ status }) {
    const s = STATUS_CFG[status] || { bg: T.creamDark, text: T.muted, border: T.border };
    return (
        <span style={{
            padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
            background: s.bg, color: s.text, border: `1px solid ${s.border}`,
            whiteSpace: "nowrap",
        }}>{status}</span>
    );
}

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

function ActionBtn({ label, bg, fg, onClick, disabled }) {
    return (
        <button disabled={disabled} onClick={onClick} style={{
            padding: "6px 14px", borderRadius: 8, border: "none",
            background: disabled ? T.creamDark : bg,
            color: disabled ? T.muted : fg,
            fontWeight: 700, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
            transition: "opacity .15s",
        }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = ".8"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >{label}</button>
    );
}

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [rxAppointment, setRxAppointment] = useState(null);

    const load = async () => {
        try {
            const res = await api.get("/Doctor/appointments");
            setAppointments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put("/Doctor/appointment/status", { appointmentId: id, status });
            load();
        } catch {
            alert("Failed to update status.");
        }
    };

    const total = appointments.length;
    const confirmed = appointments.filter(x => x.status === "Confirmed").length;
    const pending = appointments.filter(x => x.status === "Pending").length;
    const cancelled = appointments.filter(x => ["Cancelled", "CancelledByUser", "CancelledByAdmin"].includes(x.status));

    const filtered = appointments.filter(a => {
        const matchSearch = !search ||
            a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
            a.patientEmail?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "All" || a.status === filterStatus ||
            (filterStatus === "Cancelled" && ["Cancelled", "CancelledByUser", "CancelledByAdmin"].includes(a.status));
        return matchSearch && matchStatus;
    });

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", background: T.cream }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.green}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ color: T.muted, fontSize: 14 }}>Loading appointments…</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    const card = {
        background: T.white, borderRadius: 20,
        border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        overflow: "hidden",
    };

    return (
        <div style={{ minHeight: "100vh", background: T.cream, padding: 28, fontFamily: "Inter, sans-serif", color: T.ink }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
      `}</style>

            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28, margin: 0, color: T.ink }}>Patient Appointments</h1>
                <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>Review, confirm, or cancel bookings</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Bookings" value={total} accent={T.green} icon={<ClipboardList size={22} />} />
                <StatCard label="Confirmed" value={confirmed} accent={T.green} icon={<CheckCircle2 size={22} />} />
                <StatCard label="Pending" value={pending} accent="#D97706" icon={<Calendar size={22} />} />
                <StatCard label="Cancelled" value={cancelled.length} accent="#DC2626" icon={<XCircle size={22} />} />
            </div>

            {/* Table card */}
            <div style={card}>
                {/* Toolbar */}
                <div style={{
                    padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
                    background: T.cream,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ClipboardList size={18} color={T.green} />
                        <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Appointment List</span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ position: "relative" }}>
                            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search patient…"
                                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, outline: "none", background: T.white, color: T.ink, width: 190 }}
                            />
                        </div>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Filter size={14} style={{ position: "absolute", left: 11, color: T.muted, pointerEvents: "none" }} />
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, background: T.white, color: T.ink, cursor: "pointer", appearance: "none" }}>
                                {["All", "Pending", "Confirmed", "Cancelled", "Completed"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: T.cream }}>
                                {["#", "Patient", "Email", "Appointment", "Status", "Prescription", "Actions"].map(h => (
                                    <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                        <ClipboardList size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                                        No appointments found.
                                    </td>
                                </tr>
                            ) : filtered.map((item, i) => (
                                <tr key={item.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.cream}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted, fontWeight: 600 }}>{i + 1}</td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <UserCircle2 size={20} color={T.green} />
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{item.patientName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Mail size={13} color={T.muted} />
                                            <span style={{ fontSize: 13, color: T.muted }}>{item.patientEmail}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <div style={{ fontWeight: 600 }}>
                                            {item.appointmentDate}
                                        </div>

                                        <div style={{ fontSize: 12, color: T.muted }}>
                                            {item.appointmentTime}
                                        </div>
                                    </td>
                                    <td style={{ padding: "15px 20px" }}><Badge status={item.status} /></td>
                                    <td style={{ padding: "15px 20px" }}>
                                        {item.status === "Completed" ? (
                                            <ActionBtn
                                                label={item.hasPrescription ? "Edit Prescription" : "Write Prescription"}
                                                bg={item.hasPrescription ? "#DBEAFE" : T.greenLight}
                                                fg={item.hasPrescription ? "#1E40AF" : T.green}
                                                onClick={() => setRxAppointment(item)}
                                            />
                                        ) : (
                                            <span style={{ color: T.muted }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        {item.status === "Pending" ? (
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <ActionBtn
                                                    label="Accept"
                                                    bg={T.greenLight}
                                                    fg={T.green}
                                                    onClick={() => updateStatus(item.id, "Confirmed")}
                                                />
                                                <ActionBtn
                                                    label="Reject"
                                                    bg="#FEE2E2"
                                                    fg="#DC2626"
                                                    onClick={() => updateStatus(item.id, "CancelledByAdmin")}
                                                />
                                            </div>
                                        ) : item.status === "Confirmed" ? (
                                            <ActionBtn
                                                label="Complete"
                                                bg={T.greenLight}
                                                fg={T.green}
                                                onClick={() => updateStatus(item.id, "Completed")}
                                            />
                                        ) : (
                                            <span style={{ color: T.muted }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
                    <span style={{ fontSize: 12, color: T.muted }}>Showing <b style={{ color: T.ink }}>{filtered.length}</b> of <b style={{ color: T.ink }}>{total}</b> appointments</span>
                </div>
            </div>

            <PrescriptionModal
                appointment={rxAppointment}
                onClose={() => setRxAppointment(null)}
                onSaved={load}
            />
        </div>
    );
}