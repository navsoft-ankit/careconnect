import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { ClipboardList, Calendar, XCircle } from "lucide-react";

/* ─── Design tokens ───────────────────────────────── */
const T = {
    cream: "#FAF8F3",
    creamDark: "#EFEAE0",
    green: "#16332B",
    greenMid: "#3E7C59",
    greenLight: "#EBF2E3",
    terra: "#B5562C",
    ink: "#16332B",
    muted: "#6B7280",
    border: "#E4DFD3",
    white: "#FFFFFF",
    danger: "#9E211A",
    dangerLight: "#FBEAE5",
};

const STATUS_CFG = {
    Completed: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
    "Not Visited": { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
    Cancelled: { bg: T.dangerLight, text: T.danger, border: "#F5C6BB" },
    CancelledByUser: { bg: T.dangerLight, text: T.danger, border: "#F5C6BB" },
    Rejected: { bg: T.creamDark, text: T.muted, border: T.border },
    Confirmed: { bg: T.greenLight, text: T.greenMid, border: "#BBD9A0" },
    Pending: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A" },
};

function Badge({ status }) {
    const s = STATUS_CFG[status] || { bg: T.creamDark, text: T.muted, border: T.border };
    return (
        <span style={{
            padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
            background: s.bg, color: s.text, border: `1px solid ${s.border}`, whiteSpace: "nowrap",
        }}>
            {status}
        </span>
    );
}

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/appointments");
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id) => {
        if (!window.confirm("Cancel this appointment?")) return;
        try {
            await api.put(`/admin/appointment/cancel/${id}`);
            loadAppointments();
        } catch (err) {
            console.error(err);
            alert("Cancel failed");
        }
    };

    const card = {
        background: T.white, borderRadius: 20,
        border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        overflow: "hidden",
    };

    return (
        <div className="flex" style={{ fontFamily: "Inter, sans-serif" }}>
            <Sidebar />

            <div className="ml-64 w-full min-h-screen" style={{ background: T.cream }}>
                <Navbar />

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
                    * { box-sizing: border-box; }
                `}</style>

                <div style={{ padding: 28 }}>

                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28, margin: 0, color: T.ink }}>
                            Appointments
                        </h1>
                        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>
                            Monitor and manage all patient appointments
                        </p>
                    </div>

                    {loading ? (
                        <div style={{ ...card, padding: "56px 0", textAlign: "center", color: T.muted }}>
                            Loading appointments…
                        </div>
                    ) : (
                        <div style={card}>
                            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", alignItems: "center", gap: 8 }}>
                                <ClipboardList size={17} color={T.green} />
                                <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Appointment List</span>
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: T.cream }}>
                                            {["#", "Patient", "Doctor", "Status", "Date", "Action"].map((h) => (
                                                <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {appointments.length > 0 ? (
                                            appointments.map((a) => {
                                                const appointmentTime = new Date(a.appointmentTime);
                                                const isPast = appointmentTime < new Date();

                                                const canCancel =
                                                    !isPast &&
                                                    a.status !== "Cancelled" &&
                                                    a.status !== "CancelledByUser" &&
                                                    a.status !== "Completed" &&
                                                    a.status !== "Rejected";

                                                let displayStatus = a.status;
                                                if (isPast && a.status === "Confirmed") {
                                                    displayStatus = "Not Visited";
                                                }

                                                return (
                                                    <tr key={a.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = T.cream}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                    >
                                                        <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted, fontWeight: 600 }}>{a.id}</td>
                                                        <td style={{ padding: "15px 20px", fontWeight: 700, color: T.ink }}>{a.patientName}</td>
                                                        <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{a.doctorName}</td>
                                                        <td style={{ padding: "15px 20px" }}><Badge status={displayStatus} /></td>
                                                        <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>
                                                            {new Date(a.appointmentTime).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: "15px 20px" }}>
                                                            {canCancel ? (
                                                                <button
                                                                    onClick={() => cancelAppointment(a.id)}
                                                                    style={{
                                                                        display: "flex", alignItems: "center", gap: 6,
                                                                        background: T.dangerLight, color: T.danger, border: "none",
                                                                        padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: 12,
                                                                        cursor: "pointer", transition: "opacity .15s",
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = ".75"}
                                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                                                                >
                                                                    <XCircle size={13} /> Cancel
                                                                </button>
                                                            ) : (
                                                                <span style={{ color: T.muted }}>—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                    <Calendar size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                                                    No appointments found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
                                <span style={{ fontSize: 12, color: T.muted }}>
                                    Showing <b style={{ color: T.ink }}>{appointments.length}</b> appointment{appointments.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}