import { useEffect, useState } from "react";
import api from "../../services/api";
import {
    UserCircle2,
    Mail,
    Phone,
    Building2,
    GraduationCap,
    Briefcase,
    IndianRupee,
    FileText,
    Edit3,
    Check,
    X,
    Camera,
} from "lucide-react";

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

function InfoRow({ icon, label, value }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: T.green }}>{icon}</span>
            </div>
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginTop: 3 }}>{value || "—"}</div>
            </div>
        </div>
    );
}

function EditField({ label, value, onChange, type = "text", multiline }) {
    const base = {
        width: "100%", padding: "11px 14px", borderRadius: 10,
        border: `1px solid ${T.border}`, fontSize: 14, outline: "none",
        background: T.cream, color: T.ink, fontFamily: "inherit",
        resize: multiline ? "vertical" : undefined,
        minHeight: multiline ? 100 : undefined,
    };
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>{label}</label>
            {multiline
                ? <textarea value={value} onChange={onChange} style={base} />
                : <input type={type} value={value} onChange={onChange} style={base} />}
        </div>
    );
}

export default function DoctorProfile() {
    const [doctor, setDoctor] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const load = async () => {
        try {
            const res = await api.get("/Doctor/profile");
            setDoctor(res.data);
            setForm(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put("/Doctor/profile", form);
            setDoctor(form);
            setEditMode(false);
        } catch {
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
    const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
        setUploading(true);

        const res = await api.post(
            "/Doctor/upload-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        setDoctor(prev => ({
            ...prev,
            imageUrl: res.data.imageUrl,
        }));

    } catch {
        alert("Image upload failed");
    } finally {
        setUploading(false);
    }
};

    if (!doctor) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", background: T.cream }}>
            <div>
                <div style={{ width: 44, height: 44, border: `3px solid ${T.green}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ color: T.muted, fontSize: 14 }}>Loading profile…</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: T.cream, padding: 28, fontFamily: "Inter, sans-serif", color: T.ink }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        textarea { font-family: inherit; }
      `}</style>

            {/* Page title */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28, margin: 0, color: T.ink }}>My Profile</h1>
                <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>Your professional information on CareConnect</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>

                {/* ── Left: Avatar card ── */}
                <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" }}>
                    {/* Green banner */}
                    <div style={{ height: 100, background: `linear-gradient(135deg, ${T.green}, #4A8022)` }} />

                    <div style={{ padding: "0 24px 28px", marginTop: -50 }}>
<div
    style={{
        width: 110,
        height: 110,
        borderRadius: "50%",
        border: `4px solid ${T.white}`,
        overflow: "hidden",
        position: "relative",
        background: T.creamDark,
        boxShadow: "0 4px 14px rgba(0,0,0,.12)",
    }}
>
    {doctor.imageUrl ? (
        <img
            src={`http://localhost:5008${doctor.imageUrl}`}
            alt="Doctor"
            style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
            }}
        />
    ) : (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <UserCircle2 size={70} color={T.muted} />
        </div>
    )}

    <label
        style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: T.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "2px solid white",
        }}
    >
        <Camera size={16} color="white" />

        <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
        />
    </label>

    {uploading && (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
            }}
        >
            Uploading...
        </div>
    )}
</div>

                        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, margin: "14px 0 4px", color: T.ink }}>
                            {doctor.name || doctor.name}
                        </h2>
                        <div style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 99, background: T.terraLight, border: `1px solid ${T.terra}30` }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.terra }}>{doctor.specialization}</span>
                        </div>

                        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { icon: <Building2 size={15} />, val: doctor.hospitalName },
                                { icon: <Mail size={15} />, val: doctor.email },
                                { icon: <Phone size={15} />, val: doctor.phone },
                            ].map(({ icon, val }, i) => val && (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ color: T.green }}>{icon}</span>
                                    <span style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Fee pill */}
                        <div style={{ marginTop: 20, background: T.greenLight, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                            <IndianRupee size={16} color={T.green} />
                            <div>
                                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Consultation Fee</div>
                                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 20, color: T.green }}>₹{doctor.fee}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Details / Edit ── */}
                <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" }}>
                    <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, margin: 0, color: T.ink }}>
                            {editMode ? "Edit Profile" : "Professional Details"}
                        </h3>
                        <div style={{ display: "flex", gap: 8 }}>
                            {editMode ? (
                                <>
                                    <button onClick={() => { setEditMode(false); setForm(doctor); }} style={{
                                        display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
                                        border: `1px solid ${T.border}`, background: T.cream, color: T.ink, fontWeight: 600, fontSize: 13, cursor: "pointer",
                                    }}>
                                        <X size={14} /> Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving} style={{
                                        display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
                                        border: "none", background: T.green, color: T.white, fontWeight: 700, fontSize: 13, cursor: "pointer",
                                        opacity: saving ? .6 : 1,
                                    }}>
                                        <Check size={14} /> {saving ? "Saving…" : "Save Changes"}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setEditMode(true)} style={{
                                    display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
                                    border: "none", background: T.terra, color: T.white, fontWeight: 700, fontSize: 13, cursor: "pointer",
                                }}>
                                    <Edit3 size={14} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: 28 }}>
                        {editMode ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                                <EditField label="Full Name" value={form.name || form.fullName || ""} onChange={f("name")} />
                                <EditField label="Email" value={form.email || ""} onChange={f("email")} type="email" />
                                <EditField label="Phone" value={form.phone || ""} onChange={f("phone")} type="tel" />
                                <EditField label="Specialization" value={form.specialization || ""} onChange={f("specialization")} />
                                <EditField label="Hospital" value={form.hospitalName || ""} onChange={f("hospitalName")} />
                                <EditField label="Qualification" value={form.qualification || ""} onChange={f("qualification")} />
                                <EditField label="Experience (yrs)" value={form.experience || ""} onChange={f("experience")} type="number" />
                                <EditField label="Consultation Fee" value={form.fee || ""} onChange={f("fee")} type="number" />
                                <div style={{ gridColumn: "span 2" }}>
                                    <EditField label="About" value={form.about || ""} onChange={f("about")} multiline />
                                </div>
                            </div>
                        ) : (
                            <>
                                <InfoRow icon={<Mail size={17} />} label="Email" value={doctor.email} />
                                <InfoRow icon={<Phone size={17} />} label="Phone" value={doctor.phone} />
                                <InfoRow icon={<Building2 size={17} />} label="Hospital" value={doctor.hospitalName} />
                                <InfoRow icon={<GraduationCap size={17} />} label="Qualification" value={doctor.qualification} />
                                <InfoRow icon={<Briefcase size={17} />} label="Experience" value={doctor.experience ? `${doctor.experience} years` : null} />
                                <InfoRow icon={<IndianRupee size={17} />} label="Consultation Fee" value={doctor.fee ? `₹${doctor.fee}` : null} />
                                {doctor.about && (
                                    <div style={{ paddingTop: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <FileText size={17} color={T.green} />
                                            </div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6 }}>About</div>
                                        </div>
                                        <p style={{ fontSize: 14, color: T.ink, lineHeight: 1.7, margin: 0, padding: "16px 20px", background: T.cream, borderRadius: 12 }}>{doctor.about}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}