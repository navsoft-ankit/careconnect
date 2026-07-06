import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Ambulance, MapPin, Navigation2, Users } from "lucide-react";

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
    Pending: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A" },
    Accepted: { bg: T.greenLight, text: T.greenMid, border: "#BBD9A0" },
    Completed: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
    Rejected: { bg: T.dangerLight, text: T.danger, border: "#F5C6BB" },
    Cancelled: { bg: T.creamDark, text: T.muted, border: T.border },
};

function StatusBadge({ status }) {
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

function StatCard({ label, value, accent, icon }) {
    return (
        <div style={{
            background: T.white, borderRadius: 20, padding: "22px 24px",
            border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
            <div>
                <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{label}</p>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 36, margin: "8px 0 0", color: T.ink }}>{value}</h2>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: accent }}>{icon}</span>
            </div>
        </div>
    );
}

export default function AmbulanceBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/ambulance-bookings");
            setBookings(res.data);
        } finally {
            setLoading(false);
        }
    };

    const card = {
        background: T.white, borderRadius: 20,
        border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        overflow: "hidden",
    };

    const activeCount = bookings.filter((b) => b.status === "Pending" || b.status === "Accepted").length;
    const completedCount = bookings.filter((b) => b.status === "Completed").length;

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
                            Ambulance Bookings
                        </h1>
                        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>
                            Track all patient ambulance requests and dispatch status
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
                        <StatCard label="Total Bookings" value={bookings.length} accent={T.green} icon={<Ambulance size={22} />} />
                        <StatCard label="Active" value={activeCount} accent="#D97706" icon={<Navigation2 size={22} />} />
                        <StatCard label="Completed" value={completedCount} accent={T.greenMid} icon={<Users size={22} />} />
                    </div>

                    {/* Table */}
                    <div style={card}>
                        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", alignItems: "center", gap: 8 }}>
                            <Ambulance size={17} color={T.green} />
                            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Booking List</span>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: T.cream }}>
                                        {["Patient", "Email", "Driver", "Vehicle", "Pickup", "Destination", "Status", "Date"].map((h) => (
                                            <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                Loading bookings…
                                            </td>
                                        </tr>
                                    ) : bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                <Ambulance size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                                                No ambulance bookings found.
                                            </td>
                                        </tr>
                                    ) : bookings.map((b) => (
                                        <tr key={b.bookingId} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = T.cream}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "15px 20px", fontWeight: 700, color: T.ink }}>{b.patientName}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted }}>{b.patientEmail}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{b.driverName}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{b.vehicleNumber}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink, maxWidth: 180 }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                                    <MapPin size={13} color={T.greenMid} style={{ marginTop: 2, flexShrink: 0 }} />
                                                    <span>{b.pickupLocation}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink, maxWidth: 180 }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                                    <Navigation2 size={13} color={T.terra} style={{ marginTop: 2, flexShrink: 0 }} />
                                                    <span>{b.destinationLocation}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "15px 20px" }}>
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>
                                                {new Date(b.requestTime).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
                            <span style={{ fontSize: 12, color: T.muted }}>
                                Showing <b style={{ color: T.ink }}>{bookings.length}</b> booking{bookings.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}