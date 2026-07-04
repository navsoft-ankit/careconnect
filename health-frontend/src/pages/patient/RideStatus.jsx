import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Phone, CarFront, MapPin, IndianRupee, Navigation, ArrowLeft,
    CheckCircle2, X, CreditCard, Lock, Loader2, User, Hash,
    AlertCircle, RefreshCw,
} from "lucide-react";
import api from "../../api/axios";

/* ─── Tokens — matches the rest of CareConnect ─── */
const T = {
    cream: "#F5F0E8",
    creamDark: "#EDE7D9",
    green: "#2D5016",
    greenDeep: "#16332B",
    greenLight: "#EBF2E3",
    terra: "#C4622D",
    terraLight: "#FAF0EA",
    ink: "#1A1A1A",
    muted: "#6B7280",
    border: "#E2DACE",
    white: "#FFFFFF",
};

const STATUS_CFG = {
    Pending: { bg: "#FEF3C7", text: "#D97706", label: "Finding your driver…" },
    Accepted: { bg: T.greenLight, text: T.green, label: "Driver is on the way" },
    "En Route": { bg: T.greenLight, text: T.green, label: "Driver is on the way" },
    Completed: { bg: "#DBEAFE", text: "#1D4ED8", label: "Ride Completed" },
    Cancelled: { bg: "#FEE2E2", text: "#DC2626", label: "Ride Cancelled" },
};

function formatCardNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/* ─── Skeleton ────────────────────────────────── */
function LoadingSkeleton() {
    return (
        <div style={{
            minHeight: "100vh",
            background: T.cream,
            padding: "36px 20px"
        }}>

            <style>
                {`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}
            </style>

            <div style={{
                maxWidth: 560,
                margin: "0 auto"
            }}>

                <div style={{
                    height: 18,
                    width: 80,
                    background: T.creamDark,
                    borderRadius: 8,
                    marginBottom: 24,
                    animation: "pulse 1.5s infinite"
                }} />

                <div style={{
                    background: T.white,
                    borderRadius: 24,
                    border: `1px solid ${T.border}`,
                    overflow: "hidden"
                }}>
                    <div style={{
                        height: 180,
                        background: T.creamDark,
                        animation: "pulse 1.5s infinite"
                    }} />

                    <div style={{ padding: 28 }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i}
                                style={{
                                    height: 14,
                                    background: T.creamDark,
                                    borderRadius: 6,
                                    marginBottom: 16,
                                    width: `${70 - i * 8}%`,
                                    animation: "pulse 1.5s infinite"
                                }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Payment Modal ──────────────────────────────── */
function PaymentModal({ open, amount, onClose, onSuccess }) {
    const [stage, setStage] = useState("form");
    const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setStage("form");
            setCard({ number: "", name: "", expiry: "", cvv: "" });
            setError("");
        }
    }, [open]);

    if (!open) return null;

    function handlePay(e) {
        e.preventDefault();
        setError("");

        const digits = card.number.replace(/\s/g, "");
        if (digits.length !== 16) return setError("Enter a valid 16-digit card number.");
        if (!card.name.trim()) return setError("Enter the name on card.");
        if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return setError("Enter expiry as MM/YY.");
        if (card.cvv.length !== 3) return setError("Enter a valid 3-digit CVV.");

        setStage("processing");
        setTimeout(() => {
            setStage("success");
            setTimeout(() => onSuccess(), 1300);
        }, 1500);
    }

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
        }}>
            <div style={{
                background: T.white,
                borderRadius: 24,
                width: "100%",
                maxWidth: 420,
                boxShadow: "0 24px 70px rgba(0,0,0,.25)",
                overflow: "hidden",
                fontFamily: "Inter, sans-serif",
            }}>
                {stage === "form" && (
                    <>
                        <div style={{
                            background: T.greenDeep,
                            padding: "24px 28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}>
                            <div>
                                <p style={{
                                    color: "#BFD3C6",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    margin: 0,
                                    letterSpacing: .4
                                }}>
                                    CareConnect Secure Pay
                                </p>
                                <h2 style={{
                                    color: T.white,
                                    fontFamily: "Fraunces, Georgia, serif",
                                    fontWeight: 700,
                                    fontSize: 24,
                                    margin: "4px 0 0"
                                }}>
                                    ₹{amount}
                                </h2>
                            </div>
                            <button onClick={onClose}
                                style={{
                                    border: "none",
                                    background: "rgba(255,255,255,.15)",
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                <X size={16} color={T.white} />
                            </button>
                        </div>

                        <form onSubmit={handlePay} style={{ padding: "24px 28px" }}>
                            {error && (
                                <div style={{
                                    background: "#FEF2F2",
                                    border: "1px solid #FCA5A5",
                                    color: "#DC2626",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    fontSize: 13,
                                    marginBottom: 16,
                                }}>
                                    {error}
                                </div>
                            )}

                            <label style={labelStyle}>Card Number</label>
                            <div style={{ position: "relative", marginBottom: 14 }}>
                                <CreditCard size={16}
                                    style={{
                                        position: "absolute",
                                        left: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: T.muted
                                    }} />
                                <input
                                    value={card.number}
                                    onChange={e => setCard({
                                        ...card,
                                        number: formatCardNumber(e.target.value)
                                    })}
                                    placeholder="1234 5678 9012 3456"
                                    style={{ ...inputStyle, paddingLeft: 38 }}
                                    inputMode="numeric"
                                />
                            </div>

                            <label style={labelStyle}>Name on Card</label>
                            <input
                                value={card.name}
                                onChange={e => setCard({
                                    ...card,
                                    name: e.target.value
                                })}
                                placeholder="As shown on card"
                                style={{ ...inputStyle, marginBottom: 14 }}
                            />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Expiry</label>
                                    <input
                                        value={card.expiry}
                                        onChange={e => setCard({
                                            ...card,
                                            expiry: formatExpiry(e.target.value)
                                        })}
                                        placeholder="MM/YY"
                                        style={inputStyle}
                                        inputMode="numeric"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>CVV</label>
                                    <input
                                        value={card.cvv}
                                        onChange={e =>
                                            setCard({
                                                ...card,
                                                cvv: e.target.value.replace(/\D/g, "").slice(0, 3)
                                            })}
                                        placeholder="123"
                                        style={inputStyle}
                                        inputMode="numeric"
                                        type="password"
                                    />
                                </div>
                            </div>

                            <button type="submit"
                                style={{
                                    width: "100%",
                                    marginTop: 22,
                                    padding: "13px 0",
                                    borderRadius: 12,
                                    border: "none",
                                    background: T.terra,
                                    color: T.white,
                                    fontWeight: 700,
                                    fontSize: 15,
                                    cursor: "pointer",
                                }}>
                                Pay ₹{amount}
                            </button>

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                marginTop: 14
                            }}>
                                <Lock size={12} color={T.muted} />
                                <span style={{
                                    fontSize: 11,
                                    color: T.muted
                                }}>Secured, encrypted test transaction
                                </span>
                            </div>
                        </form>
                    </>
                )}

                {stage === "processing" && (
                    <div style={{
                        padding: "60px 28px",
                        textAlign: "center"
                    }}>

                        <Loader2 size={44}
                            color={T.green} style={{ animation: "spin 1s linear infinite" }} />

                        <h3 style={{
                            fontFamily: "Fraunces, Georgia, serif",
                            fontWeight: 700,
                            fontSize: 18,
                            color: T.ink,
                            margin: "20px 0 6px"
                        }}>
                            Processing Payment
                        </h3>
                        <p style={{
                            fontSize: 13,
                            color: T.muted, margin: 0
                        }}>Please don't close this window…
                        </p>
                    </div>
                )}

                {stage === "success" && (
                    <div style={{
                        padding: "50px 28px",
                        textAlign: "center"
                    }}>

                        <div style={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: T.greenLight,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                        }}>

                            <CheckCircle2 size={38} color={T.green} />
                        </div>
                        <h3 style={{
                            fontFamily: "Fraunces, Georgia, serif",
                            fontWeight: 700,
                            fontSize: 20,
                            color: T.ink,
                            margin: "20px 0 6px"
                        }}>
                            Payment Successful
                        </h3>
                        <p style={{
                            fontSize: 13,
                            color: T.muted,
                            margin: 0
                        }}>
                            ₹{amount} paid for your ambulance ride
                        </p>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: T.ink, margin: "0 0 6px" };
const inputStyle = {
    width: "100%", padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`,
    fontSize: 14, outline: "none", background: T.cream, color: T.ink, boxSizing: "border-box",
};

/* ─── Info row ─── */
function InfoRow({ icon, label, value, last }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 0", borderBottom: last ? "none" : `1px solid ${T.border}`,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.muted, fontSize: 13 }}>
                {icon}
                {label}
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{value}</span>
        </div>
    );
}

/* ─── Main ────────────────────────────────────────── */
export default function RideStatus() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPayment, setShowPayment] = useState(false);
    const [paid, setPaid] = useState(false);

    async function loadRide(silent = false) {
        try {
            if (!silent) setLoading(true);
            setError("");
            const res = await api.get(`/patient/ride/${id}`);
            setRide(res.data);
            if (res.data?.paymentStatus === "Paid") setPaid(true);
        } catch (err) {
            setError("Unable to load ride details.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRide();
        const timer = setInterval(() => loadRide(true), 5000);
        return () => clearInterval(timer);
    }, []);

    async function handlePaymentSuccess() {
        setShowPayment(false);
        setPaid(true);
        try {
            await api.put(`/patient/ambulance-request/${id}/pay`);
        } catch {
            // best-effort — UI already reflects payment
        }
    }

    if (loading) return <LoadingSkeleton />;

    if (error || !ride) {
        return (
            <div style={{ minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, sans-serif" }}>
                <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: 36, textAlign: "center", maxWidth: 380 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <AlertCircle size={26} color="#DC2626" />
                    </div>
                    <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: T.ink, margin: "0 0 8px" }}>{error || "Ride not found"}</h2>
                    <button onClick={() => loadRide()} style={{
                        display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 20px",
                        borderRadius: 10, border: "none", background: T.greenDeep, color: T.white, fontWeight: 700, cursor: "pointer",
                    }}>
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    const status = STATUS_CFG[ride.status] || STATUS_CFG.Pending;

    return (
        <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,600&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.15)}}
      `}</style>

            <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>

                {/* Back link */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
                        color: T.greenDeep, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 22,
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* ── Main card ── */}
                <div style={{ background: T.white, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: "0 4px 24px rgba(0,0,0,.05)", overflow: "hidden" }}>

                    {/* Hero status band */}
                    <div style={{
                        background: `linear-gradient(135deg, ${T.greenDeep}, ${T.green})`,
                        padding: "40px 28px 32px", textAlign: "center", position: "relative",
                    }}>
                        <div style={{
                            width: 76, height: 76, borderRadius: "50%", background: T.white, margin: "0 auto",
                            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                        }}>
                            <Navigation size={34} color={T.green} />
                            {ride.status !== "Completed" && ride.status !== "Cancelled" && (
                                <span style={{
                                    position: "absolute", inset: -6, borderRadius: "50%",
                                    border: `2px solid ${T.white}`, opacity: .4, animation: "pulseDot 2s infinite",
                                }} />
                            )}
                        </div>

                        <h1 style={{ color: T.white, fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 24, margin: "20px 0 6px" }}>
                            {status.label}
                        </h1>
                        <p style={{ color: "#C9D9CC", fontSize: 13, margin: 0 }}>
                            Thank you for booking with CareConnect
                        </p>

                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
                            padding: "5px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                            background: "rgba(255,255,255,.15)", color: T.white,
                        }}>
                            <Hash size={11} /> Request #{ride.id ?? id}
                        </span>
                    </div>

                    <div style={{ padding: "28px" }}>

                        {/* Driver info */}
                        <div style={{ marginBottom: 8 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: .5, textTransform: "uppercase", margin: "0 0 4px" }}>
                                Driver Details
                            </p>
                            <InfoRow icon={<User size={14} />} label="Driver" value={ride.driverName || "—"} />
                            <InfoRow icon={<CarFront size={14} />} label="Vehicle" value={ride.vehicleNumber || "—"} />
                            <InfoRow icon={<Phone size={14} />} label="Phone" value={ride.driverPhone || "—"} last />
                        </div>

                        {/* Route */}
                        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: .5, textTransform: "uppercase", margin: "0 0 14px" }}>
                                Route
                            </p>

                            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.terraLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <MapPin size={15} color={T.terra} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 13, color: T.ink, margin: 0 }}>Pickup</p>
                                    <p style={{ fontSize: 13, color: T.muted, margin: "2px 0 0" }}>{ride.pickupLocation}</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Navigation size={15} color={T.green} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 13, color: T.ink, margin: 0 }}>Destination</p>
                                    <p style={{ fontSize: 13, color: T.muted, margin: "2px 0 0" }}>{ride.destinationLocation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Fare / distance stat cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 24 }}>
                            <div style={{ background: T.cream, borderRadius: 16, padding: "18px 16px", textAlign: "center", border: `1px solid ${T.border}` }}>
                                <IndianRupee size={18} color={T.greenDeep} style={{ margin: "0 auto" }} />
                                <p style={{ fontSize: 12, color: T.muted, margin: "8px 0 2px" }}>Fare</p>
                                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, color: T.ink, margin: 0 }}>₹{ride.fare}</h3>
                            </div>
                            <div style={{ background: T.cream, borderRadius: 16, padding: "18px 16px", textAlign: "center", border: `1px solid ${T.border}` }}>
                                <CarFront size={18} color={T.greenDeep} style={{ margin: "0 auto" }} />
                                <p style={{ fontSize: 12, color: T.muted, margin: "8px 0 2px" }}>Distance</p>
                                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, color: T.ink, margin: 0 }}>{ride.distanceKm} km</h3>
                            </div>
                        </div>

                        {/* Status banner */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 12, marginTop: 20,
                            background: status.bg, border: `1px solid ${status.text}33`, borderRadius: 14, padding: "14px 16px",
                        }}>
                            <CheckCircle2 size={20} color={status.text} />
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 13, color: status.text, margin: 0 }}>{ride.status}</p>
                                <p style={{ fontSize: 12, color: status.text, opacity: .85, margin: "2px 0 0" }}>
                                    Ambulance is coming to your pickup location.
                                </p>
                            </div>
                        </div>

                        {/* Payment confirmation banner */}
                        {paid && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12, marginTop: 12,
                                background: T.greenLight, border: "1px solid #BBD9A0", borderRadius: 14, padding: "14px 16px",
                            }}>
                                <CheckCircle2 size={20} color={T.green} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 13, color: T.green, margin: 0 }}>Payment Complete</p>
                                    <p style={{ fontSize: 12, color: T.green, opacity: .85, margin: "2px 0 0" }}>₹{ride.fare} paid successfully.</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
                            <button
                                onClick={() => !paid && setShowPayment(true)}
                                disabled={paid}
                                style={{
                                    padding: "13px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 14,
                                    cursor: paid ? "not-allowed" : "pointer",
                                    background: paid ? T.creamDark : T.greenDeep,
                                    color: paid ? T.muted : T.white,
                                }}
                            >
                                {paid ? "Paid" : "Pay Now"}
                            </button>

                            <a
                                href={`tel:${ride.driverPhone}`}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    padding: "13px 0", borderRadius: 12, background: T.terra, color: T.white,
                                    fontWeight: 700, fontSize: 14, textDecoration: "none",
                                }}
                            >
                                <Phone size={16} /> Call Driver
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                open={showPayment}
                amount={ride.fare}
                onClose={() => setShowPayment(false)}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}