import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    ClipboardList, CheckCircle2, XCircle, Clock3, Building2, Users,
} from "lucide-react";

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
    Approved: { bg: T.greenLight, text: T.greenMid, border: "#BBD9A0" },
    Rejected: { bg: T.dangerLight, text: T.danger, border: "#F5C6BB" },
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

export default function AdminSlotRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        try {
            const res = await api.get("/admin/slot-requests");
            setRequests(res.data);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }

    async function approve(id) {
        try {
            await api.put("/admin/slot-request", {
                requestId: id,
                approve: true,
                adminRemark: "Approved",
            });
            alert("Request approved.");
            loadRequests();
        } catch (err) {
            console.log(err);
            alert(err.response?.data);
        }
    }

    async function reject(id) {
        const remark = prompt("Reason for rejection");
        if (!remark) return;

        try {
            await api.put("/admin/slot-request", {
                requestId: id,
                approve: false,
                adminRemark: remark,
            });
            alert("Request rejected.");
            loadRequests();
        } catch (err) {
            console.log(err);
            alert(err.response?.data);
        }
    }

    const card = {
        background: T.white, borderRadius: 20,
        border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        overflow: "hidden",
    };

    const pending = requests.filter((x) => x.status === "Pending").length;
    const approved = requests.filter((x) => x.status === "Approved").length;
    const rejected = requests.filter((x) => x.status === "Rejected").length;

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
                            Doctor Slot Requests
                        </h1>
                        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>
                            Review and respond to extra availability requests from doctors
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
                        <StatCard label="Total Requests" value={requests.length} accent={T.green} icon={<ClipboardList size={22} />} />
                        <StatCard label="Pending" value={pending} accent="#D97706" icon={<Clock3 size={22} />} />
                        <StatCard label="Approved" value={approved} accent={T.greenMid} icon={<CheckCircle2 size={22} />} />
                        <StatCard label="Rejected" value={rejected} accent={T.danger} icon={<XCircle size={22} />} />
                    </div>

                    {/* Table */}
                    <div style={card}>
                        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", alignItems: "center", gap: 8 }}>
                            <ClipboardList size={17} color={T.green} />
                            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Request List</span>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: T.cream }}>
                                        {["Doctor", "Hospital", "From", "To", "Patients", "Status", "Action"].map((h) => (
                                            <th key={h} style={{ padding: "13px 20px", textAlign: h === "Action" ? "center" : "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                Loading requests…
                                            </td>
                                        </tr>
                                    ) : requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                <ClipboardList size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                                                No slot requests found.
                                            </td>
                                        </tr>
                                    ) : requests.map((r) => (
                                        <tr key={r.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = T.cream}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "15px 20px", fontWeight: 700, color: T.ink }}>{r.doctorName}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <Building2 size={13} color={T.greenMid} />
                                                    {r.hospital}
                                                </div>
                                            </td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>
                                                {new Date(r.requestedFrom).toLocaleString()}
                                            </td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>
                                                {new Date(r.requestedTo).toLocaleString()}
                                            </td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <Users size={13} color={T.greenMid} />
                                                    {r.maxPatients}
                                                </div>
                                            </td>
                                            <td style={{ padding: "15px 20px" }}>
                                                <StatusBadge status={r.status} />
                                            </td>
                                            <td style={{ padding: "15px 20px" }}>
                                                {r.status === "Pending" ? (
                                                    <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                                                        <button
                                                            onClick={() => approve(r.id)}
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: 6,
                                                                background: T.greenLight, color: T.greenMid, border: "none",
                                                                padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: 12,
                                                                cursor: "pointer", transition: "opacity .15s",
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = ".75"}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                                                        >
                                                            <CheckCircle2 size={13} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => reject(r.id)}
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: 6,
                                                                background: T.dangerLight, color: T.danger, border: "none",
                                                                padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: 12,
                                                                cursor: "pointer", transition: "opacity .15s",
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = ".75"}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                                                        >
                                                            <XCircle size={13} /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: "center", color: T.muted, fontSize: 12, fontWeight: 600 }}>
                                                        Completed
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
                            <span style={{ fontSize: 12, color: T.muted }}>
                                Showing <b style={{ color: T.ink }}>{requests.length}</b> request{requests.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}