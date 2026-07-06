import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    Truck, Plus, X, Trash2, Users, Mail, Phone, KeyRound, Hash,
} from "lucide-react";

/* ─── Design tokens ───────────────────────────────── */
const T = {
    cream: "#FAF8F3",
    creamDark: "#EFEAE0",
    green: "#16332B",
    greenMid: "#3E7C59",
    greenLight: "#EBF2E3",
    terra: "#B5562C",
    terraLight: "#FAF0EA",
    ink: "#16332B",
    muted: "#6B7280",
    border: "#E4DFD3",
    white: "#FFFFFF",
    danger: "#9E211A",
    dangerLight: "#FBEAE5",
};

const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    fontSize: 13,
    outline: "none",
    background: T.cream,
    color: T.ink,
    marginBottom: 14,
    fontFamily: "Inter, sans-serif",
};

function Field({ label, icon, children }) {
    return (
        <div>
            <label style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6,
            }}>
                {icon}{label}
            </label>
            {children}
        </div>
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

const EMPTY_FORM = {
    driverName: "",
    email: "",
    password: "",
    driverPhone: "",
    vehicleNumber: "",
};

export default function Ambulances() {
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        loadAmbulances();
    }, []);

    const loadAmbulances = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/ambulances");
            setAmbulances(res.data);
        } catch (err) {
            console.log(err);
            alert("Failed to load ambulances");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const createAmbulance = async () => {
        if (!form.driverName || !form.email || !form.password || !form.driverPhone || !form.vehicleNumber) {
            alert("Please fill in every field.");
            return;
        }
        try {
            setSubmitting(true);
            await api.post("/admin/ambulance", form);
            alert("Ambulance driver created successfully.");
            setForm(EMPTY_FORM);
            setShowForm(false);
            loadAmbulances();
        } catch (err) {
            alert(err.response?.data || "Create failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this ambulance?")) return;
        try {
            await api.delete(`/admin/ambulance/${id}`);
            loadAmbulances();
        } catch {
            alert("Delete failed.");
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
                        <div>
                            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28, margin: 0, color: T.ink }}>
                                Ambulance Drivers
                            </h1>
                            <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>
                                Manage registered ambulance drivers and vehicles
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                background: T.terra, color: T.white, border: "none",
                                borderRadius: 12, padding: "12px 20px", fontWeight: 700, fontSize: 14,
                                cursor: "pointer", transition: "background .15s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#9A481F"}
                            onMouseLeave={(e) => e.currentTarget.style.background = T.terra}
                        >
                            <Plus size={16} /> Create Ambulance
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
                        <StatCard label="Total Drivers" value={ambulances.length} accent={T.green} icon={<Truck size={22} />} />
                        <StatCard label="Active Fleet" value={ambulances.length} accent={T.greenMid} icon={<Users size={22} />} />
                    </div>

                    {/* Table */}
                    <div style={card}>
                        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", alignItems: "center", gap: 8 }}>
                            <Truck size={17} color={T.green} />
                            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Driver List</span>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: T.cream }}>
                                        {["#", "Driver", "Email", "Phone", "Vehicle", "Action"].map((h) => (
                                            <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                Loading ambulances…
                                            </td>
                                        </tr>
                                    ) : ambulances.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                <Truck size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                                                No ambulance driver found.
                                            </td>
                                        </tr>
                                    ) : ambulances.map((a, i) => (
                                        <tr key={a.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = T.cream}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted, fontWeight: 600 }}>{i + 1}</td>
                                            <td style={{ padding: "15px 20px", fontWeight: 700, color: T.ink }}>{a.driverName}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted }}>{a.email}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{a.driverPhone}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{a.vehicleNumber}</td>
                                            <td style={{ padding: "15px 20px" }}>
                                                <button
                                                    onClick={() => remove(a.id)}
                                                    style={{
                                                        width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
                                                        background: T.dangerLight, color: T.danger, display: "flex",
                                                        alignItems: "center", justifyContent: "center", transition: "opacity .15s",
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = ".75"}
                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
                            <span style={{ fontSize: 12, color: T.muted }}>
                                Showing <b style={{ color: T.ink }}>{ambulances.length}</b> driver{ambulances.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create modal */}
            {showForm && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
                }}>
                    <div style={{
                        background: T.white, borderRadius: 20, width: "100%", maxWidth: 460,
                        boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden",
                    }}>
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "20px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream,
                        }}>
                            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, margin: 0, color: T.ink }}>
                                Create Ambulance Driver
                            </h3>
                            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: 24 }}>
                            <Field label="Driver name" icon={<Users size={14} color={T.greenMid} />}>
                                <input name="driverName" value={form.driverName} onChange={handleChange} placeholder="Amit Roy" style={inputStyle} />
                            </Field>
                            <Field label="Email" icon={<Mail size={14} color={T.greenMid} />}>
                                <input name="email" value={form.email} onChange={handleChange} placeholder="driver@example.com" style={inputStyle} />
                            </Field>
                            <Field label="Password" icon={<KeyRound size={14} color={T.greenMid} />}>
                                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" style={inputStyle} />
                            </Field>
                            <Field label="Driver phone" icon={<Phone size={14} color={T.greenMid} />}>
                                <input name="driverPhone" value={form.driverPhone} onChange={handleChange} placeholder="98765 43210" style={inputStyle} />
                            </Field>
                            <Field label="Vehicle number" icon={<Hash size={14} color={T.greenMid} />}>
                                <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="WB 06 AB 1234" style={{ ...inputStyle, marginBottom: 20 }} />
                            </Field>

                            <div style={{ display: "flex", gap: 10 }}>
                                <button
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${T.border}`,
                                        background: T.cream, color: T.ink, fontWeight: 600, fontSize: 14, cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createAmbulance}
                                    disabled={submitting}
                                    style={{
                                        flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
                                        background: submitting ? T.creamDark : T.terra,
                                        color: submitting ? T.muted : T.white,
                                        fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {submitting ? "Creating…" : "Create Ambulance"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}