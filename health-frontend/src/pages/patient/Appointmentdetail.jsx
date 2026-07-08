import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { Toaster, toast } from "react-hot-toast";
import {
    ArrowLeft, Calendar, Clock, MapPin, Building2, IndianRupee,
    Phone, Download, Receipt, XCircle, Star, AlertCircle, RefreshCw, X, CheckCircle2
} from "lucide-react";

/* ─── Design tokens (CareConnect brand) ──────── */
const T = {
    cream: "#FAF8F3",
    creamDark: "#F5F0E8",
    green: "#16332B",
    greenSoft: "#2D5016",
    greenLight: "#EBF2E3",
    terra: "#B5562C",
    terraDark: "#C4622D",
    terraLight: "#FAF0EA",
    ink: "#16332B",
    muted: "#6B7280",
    border: "#E4DFD3",
    white: "#FFFFFF",
};

const STATUS_CFG = {
    Confirmed: { bg: T.greenLight, text: T.green, border: "#BBD9A0", label: "Confirmed" },
    Pending: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", label: "Pending" },
    Completed: { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE", label: "Completed" },
    CancelledByUser: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA", label: "Cancelled" },
    CancelledByDoctor: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Doctor Cancelled" },
    NotVisited: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D", label: "Not Visited" },
};

const PAYMENT_CFG = {
    Paid: { bg: T.greenLight, text: T.green },
    Pending: { bg: "#FEF3C7", text: "#D97706" },
    Failed: { bg: "#FEE2E2", text: "#DC2626" },
    Cash: { bg: T.creamDark, text: T.ink },
    Wallet: { bg: T.greenLight, text: T.green },
};

function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(d) {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Cancel confirm modal ─────────────────────── */
function CancelModal({ open, loading, onClose, onConfirm }) {
    if (!open) return null;
    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(22,51,43,.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{ background: T.white, borderRadius: 24, width: "100%", maxWidth: 420, padding: 32, boxShadow: "0 24px 70px rgba(22,51,43,.25)" }}
            >
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <AlertCircle size={26} color="#DC2626" />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, color: T.ink, margin: "0 0 10px" }}>
                    Cancel Appointment?
                </h2>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, margin: "0 0 28px" }}>
                    This action cannot be undone. If cancelled at least 1 hour before your visit, 50% of the advance is credited to your CareConnect wallet as a refund balance for your next booking.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={onClose} style={{
                        flex: 1, height: 48, borderRadius: 99, border: `1.5px solid ${T.border}`,
                        background: T.cream, color: T.ink, fontWeight: 600, fontSize: 14, cursor: "pointer"
                    }}>
                        Keep Appointment
                    </button>
                    <button onClick={onConfirm} disabled={loading} style={{
                        flex: 1, height: 48, borderRadius: 99, border: "none", background: "#DC2626",
                        color: T.white, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                    }}>
                        {loading ? (<><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Cancelling…</>) : "Yes, Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Review modal ─────────────────────────────── */
function ReviewModal({ open, doctorName, rating, comment, loading, onClose, onRatingChange, onCommentChange, onSubmit }) {
    if (!open) return null;
    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(22,51,43,.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{ background: T.white, borderRadius: 24, width: "100%", maxWidth: 440, padding: 32, boxShadow: "0 24px 70px rgba(22,51,43,.25)", position: "relative" }}
            >
                <button onClick={onClose} style={{
                    position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: "50%",
                    border: "none", background: T.cream, color: T.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                    <X size={16} />
                </button>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FFF7D6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <Star size={26} color="#B7791F" />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, color: T.ink, margin: "0 0 4px" }}>
                    Rate Your Visit
                </h2>
                <p style={{ fontSize: 14, color: T.muted, margin: "0 0 20px" }}>
                    How was your appointment with <strong style={{ color: T.ink }}>{doctorName}</strong>?
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => onRatingChange(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                            <Star size={30} color={n <= rating ? "#F4B400" : T.border} fill={n <= rating ? "#F4B400" : "none"} />
                        </button>
                    ))}
                </div>
                <textarea
                    value={comment}
                    onChange={e => onCommentChange(e.target.value)}
                    placeholder="Share a few words about your experience (optional)"
                    rows={4}
                    style={{
                        width: "100%", borderRadius: 14, border: `1.5px solid ${T.border}`, padding: "12px 14px",
                        fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none", resize: "none",
                        background: T.cream, color: T.ink, marginBottom: 24
                    }}
                />
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={onClose} style={{
                        flex: 1, height: 48, borderRadius: 99, border: `1.5px solid ${T.border}`,
                        background: T.cream, color: T.ink, fontWeight: 600, fontSize: 14, cursor: "pointer"
                    }}>
                        Cancel
                    </button>
                    <button onClick={onSubmit} disabled={loading} style={{
                        flex: 1, height: 48, borderRadius: 99, border: "none", background: T.green,
                        color: T.white, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? .7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                    }}>
                        {loading ? (<><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>) : "Submit Review"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Action button ─────────────────────────────── */
function ActionButton({ icon, label, loadingLabel, loading, onClick, bg, fg, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "15px 18px", border: "none", borderRadius: 99, background: bg, color: fg,
                fontWeight: 700, fontSize: 14, cursor: (loading || disabled) ? "not-allowed" : "pointer",
                opacity: (loading || disabled) ? 0.6 : 1, width: "100%",
                transition: "transform .15s ease, box-shadow .15s ease",
            }}
            onMouseEnter={e => { if (!loading && !disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
            {loading ? (<><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> {loadingLabel}</>) : (<>{icon} {label}</>)}
        </button>
    );
}

/* ─── Small labelled info row (visit details) ───── */
function InfoItem({ icon, label, value, extra }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
                width: 38, height: 38, borderRadius: 12, background: T.greenLight, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: 11, color: T.muted, margin: 0, textTransform: "uppercase", letterSpacing: .06, fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, margin: "3px 0 0", color: T.ink }}>{value}{extra}</p>
            </div>
        </div>
    );
}

/* ─── Main ────────────────────────────────────── */
export default function AppointmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const passedAppt = location.state?.appt || null;

    const [appt, setAppt] = useState(passedAppt);
    const [loading, setLoading] = useState(!passedAppt);
    const [error, setError] = useState("");

    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [reviewOpen, setReviewOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    const [downloadingRx, setDownloadingRx] = useState(false);
    const [downloadingBill, setDownloadingBill] = useState(false);

    useEffect(() => {
        if (!passedAppt) loadFromList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadFromList() {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/patient/appointments");
            const match = (res.data || []).find(a => String(a.id) === String(id));
            if (!match) {
                setError("Appointment not found.");
            } else {
                setAppt(match);
            }
        } catch {
            setError("Unable to load appointment.");
        } finally {
            setLoading(false);
        }
    }

    async function cancelAppointment() {
        try {
            setCancelLoading(true);
            const res = await api.put(`/patient/appointment/cancel/${id}`);
            const refund = res?.data?.refund ?? res?.data?.Refund ?? 0;
            toast.success(refund > 0 ? `Appointment cancelled. ₹${refund} credited to your wallet.` : "Appointment cancelled.");
            setAppt(prev => ({ ...prev, status: "CancelledByUser" }));
            setCancelOpen(false);
        } catch {
            toast.error("Unable to cancel.");
        } finally {
            setCancelLoading(false);
        }
    }

    async function submitReview() {
        try {
            setReviewLoading(true);
            await api.post("/patient/review", { appointmentId: appt.id, rating, comment });
            toast.success("Review submitted");
            setAppt(prev => ({ ...prev, isReviewed: true }));
            setReviewOpen(false);
            setRating(5);
            setComment("");
        } catch (err) {
            toast.error(err?.response?.data || "Unable to submit review.");
        } finally {
            setReviewLoading(false);
        }
    }

    async function downloadPdf(url, filename, setDownloading, notReadyMsg) {
        try {
            setDownloading(true);
            const res = await api.get(url, { responseType: "blob" });
            const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            if (err?.response?.status === 404) toast.error(notReadyMsg || "Not available yet.");
            else if (err?.response?.status === 400) toast.error(err?.response?.data?.message || "Not available yet.");
            else toast.error("Failed to download.");
        } finally {
            setDownloading(false);
        }
    }

    /* ── Loading state ── */
    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: T.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", gap: 16 }}>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{
                    width: 44, height: 44, borderRadius: "50%", border: `3px solid ${T.border}`,
                    borderTopColor: T.green, animation: "spin 0.9s linear infinite"
                }} />
                <div style={{ color: T.green, fontWeight: 600, fontSize: 14 }}>Loading appointment…</div>
            </div>
        );
    }

    /* ── Error / not found state ── */
    if (error || !appt) {
        return (
            <div style={{ minHeight: "100vh", background: T.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", gap: 20, padding: 24, textAlign: "center" }}>
                <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: "#FEE2E2",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <AlertCircle size={30} color="#DC2626" />
                </div>
                <div>
                    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>{error || "Appointment not found."}</p>
                </div>
                <button onClick={() => navigate("/patient/appointments")} style={{
                    background: T.green, color: T.white, border: "none", borderRadius: 99, padding: "13px 28px",
                    fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 8
                }}>
                    <ArrowLeft size={16} /> Back to Appointments
                </button>
            </div>
        );
    }

    const status = STATUS_CFG[appt.status] || STATUS_CFG.Pending;
    const payment = PAYMENT_CFG[appt.paymentStatus] || PAYMENT_CFG.Pending;
    const initial = (appt.doctorName || "D")[0].toUpperCase();
    const canBill = appt.status === "Confirmed" || appt.status === "Completed";
    const canCall = appt.status === "Confirmed" && !!appt.doctorPhone;

    const hasAnyAction = canCall || canBill || appt.status === "Completed" || appt.isReviewed || appt.status === "Confirmed";

    return (
        <>
            <Toaster position="top-right" />
            <CancelModal open={cancelOpen} loading={cancelLoading} onClose={() => setCancelOpen(false)} onConfirm={cancelAppointment} />
            <ReviewModal
                open={reviewOpen}
                doctorName={appt.doctorName}
                rating={rating}
                comment={comment}
                loading={reviewLoading}
                onClose={() => setReviewOpen(false)}
                onRatingChange={setRating}
                onCommentChange={setComment}
                onSubmit={submitReview}
            />

            <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,600&family=Inter:wght@400;500;600;700&display=swap');
                  *{box-sizing:border-box;}
                  @keyframes spin{to{transform:rotate(360deg)}}
                `}</style>

                {/* ── Hero header band ── */}
                <div style={{ background: T.green, paddingBottom: 56 }}>
                    <div className="w-full px-6 lg:px-16 xl:px-24 2xl:px-32" style={{ paddingTop: 28 }}>
                        <button onClick={() => navigate("/patient/appointments")} style={{
                            display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.8)",
                            fontWeight: 600, fontSize: 14, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 20
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.8)"}
                        >
                            <ArrowLeft size={16} /> Back to Appointments
                        </button>

                        <p style={{ color: T.terraDark, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>
                            Appointment Details
                        </p>
                        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", color: "#fff", margin: 0 }}>
                            {appt.doctorName}
                        </h1>
                        <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.7)", fontSize: 14 }}>
                            {appt.specialization}
                        </p>
                    </div>
                </div>

                <div className="w-full px-6 lg:px-16 xl:px-24 2xl:px-32" style={{ marginTop: -40, paddingBottom: 64 }}>

                    {/* ── Header / summary card, overlapping hero ── */}
                    <div style={{ background: T.white, borderRadius: 24, border: `1px solid ${T.border}`, padding: 28, boxShadow: "0 12px 32px rgba(22,51,43,.08)" }}>

                        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

                            <div style={{
                                width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                                background: `linear-gradient(135deg, ${T.green}, ${T.greenSoft})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: T.white, fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 24,
                                boxShadow: "0 6px 16px rgba(22,51,43,.25)"
                            }}>
                                {initial}
                            </div>

                            <div style={{ flex: 1, minWidth: 200 }}>
                                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color: T.green, margin: 0 }}>
                                    {appt.doctorName}
                                </h2>
                                <p style={{ margin: "4px 0 0", color: T.terra, fontWeight: 600, fontSize: 13 }}>
                                    {appt.specialization}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 13, color: T.muted }}>
                                    <Building2 size={13} />
                                    {appt.hospital}
                                </div>
                            </div>

                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                                background: status.bg, color: status.text, border: `1px solid ${status.border}`, height: "fit-content"
                            }}>
                                {appt.status === "Completed" && <CheckCircle2 size={13} />}
                                {status.label}
                            </span>

                        </div>

                        {/* ── Visit details grid ── */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 20, marginTop: 28, paddingTop: 24, borderTop: `1px solid ${T.border}`
                        }}>

                            <InfoItem icon={<Calendar size={17} color={T.green} />} label="Date" value={fmtDate(appt.appointmentDate)} />
                            <InfoItem icon={<Clock size={17} color={T.green} />} label="Time" value={fmtTime(appt.appointmentTime)} />
                            <InfoItem icon={<MapPin size={17} color={T.green} />} label="Place to visit" value={appt.placeToVisit} />
                            <InfoItem
                                icon={<IndianRupee size={17} color={T.green} />}
                                label="Advance paid"
                                value={`₹${appt.advanceAmount}`}
                                extra={
                                    <span style={{
                                        marginLeft: 8, padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                                        background: payment.bg, color: payment.text
                                    }}>
                                        {appt.paymentStatus}
                                    </span>
                                }
                            />

                        </div>

                    </div>

                    {/* ── Actions card ── */}
                    <div style={{ background: T.white, borderRadius: 24, border: `1px solid ${T.border}`, padding: 28, marginTop: 20 }}>

                        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: T.ink, margin: "0 0 4px" }}>
                            What would you like to do?
                        </h2>
                        <p style={{ fontSize: 13, color: T.muted, margin: "0 0 20px" }}>
                            Manage this appointment or download related documents.
                        </p>

                        {hasAnyAction ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>

                                {canCall && (
                                    <a href={`tel:${appt.doctorPhone}`} style={{ textDecoration: "none" }}>
                                        <ActionButton icon={<Phone size={15} />} label="Call Doctor" bg={T.greenLight} fg={T.green} />
                                    </a>
                                )}

                                {canBill && (
                                    <ActionButton
                                        icon={<Receipt size={15} />}
                                        label="Download Bill"
                                        loadingLabel="Downloading…"
                                        loading={downloadingBill}
                                        onClick={() => downloadPdf(
                                            `/patient/appointments/${appt.id}/bill/pdf`,
                                            `CareConnect_Bill_${appt.id}.pdf`,
                                            setDownloadingBill,
                                            "Bill not available yet."
                                        )}
                                        bg={T.terraLight}
                                        fg={T.terra}
                                    />
                                )}

                                {appt.status === "Completed" && (
                                    <ActionButton
                                        icon={<Download size={15} />}
                                        label="Download Prescription"
                                        loadingLabel="Downloading…"
                                        loading={downloadingRx}
                                        onClick={() => downloadPdf(
                                            `/patient/prescriptions/${appt.id}/pdf`,
                                            `CareConnect_Prescription_${appt.id}.pdf`,
                                            setDownloadingRx,
                                            "Prescription not available yet."
                                        )}
                                        bg={T.greenLight}
                                        fg={T.green}
                                    />
                                )}

                                {appt.status === "Completed" && !appt.isReviewed && (
                                    <ActionButton icon={<Star size={15} />} label="Rate Doctor" onClick={() => setReviewOpen(true)} bg="#FFF7D6" fg="#B7791F" />
                                )}

                                {appt.isReviewed && (
                                    <div style={{
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        padding: "15px 18px", borderRadius: 99, background: T.greenLight, color: "#15803D", fontWeight: 700, fontSize: 14
                                    }}>
                                        ★★★★★ Reviewed
                                    </div>
                                )}

                                {appt.status === "Confirmed" && (
                                    <ActionButton icon={<XCircle size={15} />} label="Cancel Appointment" onClick={() => setCancelOpen(true)} bg="#FEE2E2" fg="#DC2626" />
                                )}

                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center", padding: "32px 16px", color: T.muted, fontSize: 14,
                                background: T.cream, borderRadius: 16, border: `1px dashed ${T.border}`
                            }}>
                                No actions available for this appointment right now.
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </>
    );
}