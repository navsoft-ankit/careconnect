import { useEffect, useState } from "react";
import api from "../../services/api";
import { X, Plus, Trash2, Stethoscope } from "lucide-react";

const T = {
    cream: "#F5F0E8", green: "#2D5016", greenLight: "#EBF2E3",
    terra: "#C4622D", ink: "#1A1A1A", muted: "#6B7280",
    border: "#E2DACE", white: "#FFFFFF",
};

const emptyMed = () => ({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });

export default function PrescriptionModal({ appointment, onClose, onSaved }) {
    const [diagnosis, setDiagnosis] = useState("");
    const [medicines, setMedicines] = useState([emptyMed()]);
    const [notes, setNotes] = useState("");
    const [advice, setAdvice] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!appointment) return;

        if (appointment.hasPrescription) {
            loadPrescription();
        } else {
            setDiagnosis("");
            setMedicines([emptyMed()]);
            setNotes("");
            setAdvice("");
        }
    }, [appointment]);

    if (!appointment) return null;

    const updateMed = (i, field, val) => {
        setMedicines(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));
    };
    const addMed = () => setMedicines(m => [...m, emptyMed()]);
    const removeMed = (i) => setMedicines(m => m.filter((_, idx) => idx !== i));

    async function loadPrescription() {
        try {
            const res = await api.get(
                `/prescriptions/appointment/${appointment.id}`
            );

            const data = res.data;

            setDiagnosis(data.diagnosis || "");
            setNotes(data.notes || "");
            setAdvice(data.adviceOnFollowUp || "");

            if (data.medicines && data.medicines.length > 0) {
                setMedicines(
                    data.medicines.map(x => ({
                        name: x.name || "",
                        dosage: x.dosage || "",
                        frequency: x.frequency || "",
                        duration: x.duration || "",
                        instructions: x.instructions || ""
                    }))
                );
            } else {
                setMedicines([emptyMed()]);
            }

        } catch (err) {
            console.error(err);
        }
    }

    async function handleSave() {
        setError("");
        if (!diagnosis.trim()) return setError("Diagnosis is required.");
        const cleanMeds = medicines.filter(m => m.name.trim());
        if (cleanMeds.length === 0) return setError("Add at least one medicine.");

        try {
            setSaving(true);
            await api.post("/doctor/prescriptions", {
                appointmentId: appointment.id,
                diagnosis,
                medicines: cleanMeds,
                notes: notes || null,
                adviceOnFollowUp: advice || null,
            });
            onSaved?.();
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to save prescription.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 28px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.white, zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Stethoscope size={20} color={T.green} />
                        <div>
                            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 19, margin: 0, color: T.ink }}>{appointment.hasPrescription
                                ? "Edit Prescription"
                                : "Write Prescription"}</h2>
                            <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>For {appointment.patientName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ border: "none", background: T.cream, width: 34, height: 34, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} color={T.ink} />
                    </button>
                </div>

                <div style={{ padding: "24px 28px" }}>
                    {error && (
                        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
                            {error}
                        </div>
                    )}

                    {/* Diagnosis */}
                    <label style={labelStyle}>Diagnosis *</label>
                    <textarea
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        rows={2}
                        placeholder="e.g. Acute viral fever"
                        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                    />

                    {/* Medicines */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 10 }}>
                        <label style={{ ...labelStyle, margin: 0 }}>Medicines *</label>
                        <button onClick={addMed} style={smallBtnStyle}>
                            <Plus size={13} /> Add Medicine
                        </button>
                    </div>

                    {medicines.map((med, i) => (
                        <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 12, background: T.cream, position: "relative" }}>
                            {medicines.length > 1 && (
                                <button onClick={() => removeMed(i)} style={{ position: "absolute", top: 10, right: 10, border: "none", background: "none", cursor: "pointer", color: "#DC2626" }}>
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <input placeholder="Medicine name" value={med.name} onChange={e => updateMed(i, "name", e.target.value)} style={inputStyle} />
                                <input placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} style={inputStyle} />
                                <input placeholder="Frequency (e.g. 1-0-1)" value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} style={inputStyle} />
                                <input placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)} style={inputStyle} />
                            </div>
                            <input
                                placeholder="Instructions (optional, e.g. After food)"
                                value={med.instructions}
                                onChange={e => updateMed(i, "instructions", e.target.value)}
                                style={{ ...inputStyle, marginTop: 10, marginBottom: 0 }}
                            />
                        </div>
                    ))}

                    {/* Notes */}
                    <label style={labelStyle}>Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />

                    <label style={labelStyle}>Follow-up Advice</label>
                    <input value={advice} onChange={e => setAdvice(e.target.value)} placeholder="e.g. Visit again after 7 days if symptoms persist" style={inputStyle} />
                </div>

                {/* Footer */}
                <div style={{ display: "flex", gap: 12, padding: "18px 28px", borderTop: `1px solid ${T.border}`, position: "sticky", bottom: 0, background: T.white }}>
                    <button onClick={onClose} style={{ flex: 1, height: 46, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.cream, color: T.ink, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 1, height: 46, borderRadius: 12, border: "none", background: T.green, color: T.white, fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .7 : 1 }}>
                        {saving
                            ? "Saving..."
                            : appointment.hasPrescription
                                ? "Update Prescription"
                                : "Save Prescription"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: T.ink, margin: "0 0 6px" };
const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`,
    fontSize: 13, outline: "none", background: T.white, color: T.ink, marginBottom: 10,
};
const smallBtnStyle = {
    display: "flex", alignItems: "center", gap: 4, border: "none", background: T.greenLight,
    color: T.green, fontWeight: 700, fontSize: 12, padding: "7px 12px", borderRadius: 8, cursor: "pointer",
};