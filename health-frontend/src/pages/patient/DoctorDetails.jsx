import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useSearchParams } from "react-router-dom";

import {
    ArrowLeft,
    Star,
    MapPin,
    Stethoscope,
    IndianRupee,
    CalendarDays,
    ShieldCheck,
    BadgeCheck
} from "lucide-react";

// ================= CARECONNECT DESIGN TOKENS =================
const colors = {
    cream: "#FAF8F3",
    creamDark: "#F5F0E8",
    forestDark: "#16332B",
    forestDarker: "#0F231D",
    forestLight: "#2D5016",
    forestSoft: "#3E7C59",
    terracotta: "#B5562C",
    terracottaLight: "#C4622D",
    border: "#E5DED0",
    ink: "#16332B",
    inkSoft: "#4B5563",
    inkMuted: "#8B8B8B"
};

const fontHeading = { fontFamily: "'Fraunces', serif" };
const fontBody = { fontFamily: "'Inter', sans-serif" };

const card = {
    background: "#fff",
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    boxShadow: "0 1px 3px rgba(22,51,43,0.05)"
};

const sectionTitle = {
    fontSize: 18,
    fontWeight: 600,
    color: colors.forestDark,
    margin: 0,
    ...fontHeading
};

export default function DoctorDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [appointment, setAppointment] = useState(null);
    const [slots, setSlots] = useState([]);
    const [reviews, setReviews] = useState(null);
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get("appointmentId");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDoctor();
    }, [id]);

    const loadDoctor = async () => {

        try {

            const [doctorRes, slotRes, reviewRes] = await Promise.all([
                api.get(`/patient/doctor/${id}`),
                api.get(`/patient/doctor/${id}/slots`),
                api.get(`/review/doctor/${id}`)
            ]);
            if (appointmentId) {
                const res = await api.get(`/patient/appointment/${appointmentId}`);
                setAppointment(res.data);
            }

            setDoctor(doctorRes.data);
            setSlots(slotRes.data);
            setReviews(reviewRes.data);

        }
        catch (err) {

            console.log(err);

        }
        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div style={{ minHeight: "100vh", background: colors.cream, display: "flex", alignItems: "center", justifyContent: "center", ...fontBody }}>
                <div style={{ color: colors.forestDark, fontSize: 15, fontWeight: 500 }}>
                    Loading doctor profile…
                </div>
            </div>

        );

    }

    if (!doctor) {

        return (

            <div style={{ minHeight: "100vh", background: colors.cream, display: "flex", alignItems: "center", justifyContent: "center", ...fontBody, color: colors.inkSoft }}>
                Doctor not found.
            </div>

        );

    }

    function AppointmentActions({ appointment }) {

        return (

            <div className="bg-white rounded-[30px] border border-[#E5DED0] p-10 mt-8">

                <h2
                    className="text-3xl"
                    style={{ fontFamily: "Fraunces" }}
                >
                    Your Appointment
                </h2>

                <div className="grid md:grid-cols-4 gap-6 mt-8">

                    <div>
                        <p className="text-gray-500 text-sm">Date</p>
                        <h4>{new Date(appointment.appointmentDate).toLocaleDateString()}</h4>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">Status</p>
                        <h4>{appointment.status}</h4>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">Payment</p>
                        <h4>{appointment.paymentStatus}</h4>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">Hospital</p>
                        <h4>{appointment.hospitalName}</h4>
                    </div>

                </div>

                <div className="grid md:grid-cols-3 gap-5 mt-10">

                    <button
                        className="h-12 rounded-xl bg-[#FFF4EC]"
                    >
                        Download Bill
                    </button>

                    <button
                        disabled={appointment.status !== "Completed"}
                        className="h-12 rounded-xl bg-[#EEF8EC]"
                    >
                        Prescription
                    </button>

                    {

                        appointment.status === "Completed" &&
                        !appointment.isReviewed &&

                        <button
                            className="h-12 rounded-xl bg-[#FFFBE6]"
                        >
                            Rate Doctor
                        </button>

                    }

                </div>

            </div>

        );

    }

    return (

        <div style={{ minHeight: "100vh", background: colors.cream, ...fontBody }}>

            <div className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 py-16">

                <button

                    onClick={() => navigate(-1)}

                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: colors.forestDark,
                        marginBottom: 24,
                        fontWeight: 500,
                        fontSize: 14,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        ...fontBody
                    }}

                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* ================= DOCTOR HEADER ================= */}
                <div style={{ ...card, padding: 28 }}>

                    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

                        {/* Avatar */}
                        {

                            doctor.imageUrl ?

                                (
                                    <img
                                        src={`http://localhost:5008${doctor.imageUrl}`}
                                        alt={doctor.name}
                                        style={{
                                            width: 88,
                                            height: 88,
                                            borderRadius: 14,
                                            objectFit: "cover",
                                            border: `1px solid ${colors.border}`
                                        }}
                                    />
                                )

                                :

                                (
                                    <div
                                        style={{
                                            width: 88,
                                            height: 88,
                                            borderRadius: 14,
                                            background: colors.forestDark,
                                            color: "#fff",
                                            fontSize: 32,
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            ...fontHeading
                                        }}
                                    >
                                        {doctor.name?.charAt(0)}
                                    </div>
                                )

                        }

                        {/* Identity */}
                        <div style={{ flex: 1, minWidth: 240 }}>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <h1 style={{ fontSize: 26, fontWeight: 600, color: colors.forestDark, margin: 0, ...fontHeading }}>
                                    {doctor.name}
                                </h1>
                                <BadgeCheck size={18} color={colors.terracottaLight} />
                            </div>

                            <p style={{ marginTop: 4, fontSize: 15, color: colors.inkSoft }}>
                                {doctor.specialization}
                            </p>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14 }}>

                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Star size={15} fill={colors.terracottaLight} color={colors.terracottaLight} />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.forestDark }}>
                                        {reviews?.averageRating ?? "New"}
                                    </span>
                                    <span style={{ fontSize: 14, color: colors.inkMuted }}>
                                        ({reviews?.totalReviews ?? 0} reviews)
                                    </span>
                                </div>

                                <div style={{ width: 1, background: colors.border }} />

                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: colors.inkSoft }}>
                                    <MapPin size={15} />
                                    {doctor.hospitalName}
                                </div>

                                <div style={{ width: 1, background: colors.border }} />

                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: colors.inkSoft }}>
                                    <Stethoscope size={15} />
                                    {doctor.experience} yrs experience
                                </div>

                            </div>

                        </div>

                        {/* Fee + CTA */}
                        <div style={{ textAlign: "right", minWidth: 180 }}>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                                <IndianRupee size={20} color={colors.forestDark} />
                                <span style={{ fontSize: 28, fontWeight: 700, color: colors.forestDark }}>
                                    {doctor.fee}
                                </span>
                            </div>
                            <p style={{ margin: "2px 0 12px", fontSize: 13, color: colors.inkMuted }}>
                                Consultation fee
                            </p>

                            <button

                                onClick={
                                    () => navigate(`/patient/bookdoctor?doctorId=${doctor.id}`)}

                                style={{
                                    width: "100%",
                                    height: 44,
                                    borderRadius: 8,
                                    background: colors.forestDark,
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: 14,
                                    border: "none",
                                    cursor: "pointer",
                                    ...fontBody
                                }}

                                onMouseOver={e => e.currentTarget.style.background = colors.forestDarker}
                                onMouseOut={e => e.currentTarget.style.background = colors.forestDark}

                            >
                                Book appointment
                            </button>

                        </div>

                    </div>

                </div>

                {/* ================= BODY GRID ================= */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 20 }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* ABOUT */}
                        <div style={{ ...card, padding: 28 }}>
                            <h2 style={sectionTitle}>About</h2>
                            <p style={{ marginTop: 12, lineHeight: 1.7, color: colors.inkSoft, fontSize: 14.5 }}>
                                {doctor.about || "No biography has been added yet."}
                            </p>

                            <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>

                                <div>
                                    <p style={{ fontSize: 12, color: colors.inkMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                        Qualification
                                    </p>
                                    <p style={{ marginTop: 4, fontSize: 14.5, fontWeight: 600, color: colors.forestDark }}>
                                        {doctor.qualification || "Not available"}
                                    </p>
                                </div>

                                <div>
                                    <p style={{ fontSize: 12, color: colors.inkMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                        Experience
                                    </p>
                                    <p style={{ marginTop: 4, fontSize: 14.5, fontWeight: 600, color: colors.forestDark }}>
                                        {doctor.experience || 0} years
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* HOSPITAL */}
                        <div style={{ ...card, padding: 28, display: "flex", alignItems: "center", gap: 16 }}>

                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: colors.creamDark,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}
                            >
                                <MapPin size={20} color={colors.forestSoft} />
                            </div>

                            <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: colors.forestDark }}>
                                    {doctor.hospitalName}
                                </p>
                                <p style={{ marginTop: 2, fontSize: 13.5, color: colors.inkMuted }}>
                                    Consultation available at this hospital
                                </p>
                            </div>

                        </div>

                        {/* SLOTS */}
                        <div style={{ ...card, padding: 28 }}>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h2 style={sectionTitle}>Available slots</h2>
                                <span style={{ fontSize: 13, color: colors.inkMuted }}>
                                    {slots.length} slot{slots.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>

                                {

                                    slots.length > 0 ?

                                        slots.map(slot => (

                                            <div
                                                key={slot.id}
                                                style={{
                                                    borderRadius: 10,
                                                    border: `1px solid ${colors.border}`,
                                                    padding: 16,
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start"
                                                }}
                                            >

                                                <div>
                                                    <p style={{ fontWeight: 600, color: colors.forestDark, margin: 0, fontSize: 14 }}>
                                                        {
                                                            new Date(slot.availableFrom)
                                                                .toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
                                                        }
                                                    </p>
                                                    <p style={{ marginTop: 4, color: colors.inkMuted, fontSize: 13.5 }}>
                                                        {
                                                            new Date(slot.availableFrom)
                                                                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                        }
                                                        {" – "}
                                                        {
                                                            new Date(slot.availableTo)
                                                                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: 6,
                                                        background: "#EEF4EC",
                                                        color: colors.forestSoft,
                                                        fontSize: 12.5,
                                                        fontWeight: 600,
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    {slot.seatsLeft} left
                                                </span>

                                            </div>

                                        ))

                                        :

                                        (

                                            <div style={{ gridColumn: "span 2", textAlign: "center", padding: "36px 0" }}>
                                                <CalendarDays size={32} color={colors.inkMuted} style={{ margin: "0 auto" }} />
                                                <p style={{ marginTop: 12, color: colors.inkMuted, fontSize: 14 }}>
                                                    No available slots right now
                                                </p>
                                            </div>

                                        )

                                }

                            </div>

                        </div>

                    </div>

                    {/* RIGHT RAIL */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        <div style={{ ...card, padding: 24, position: "sticky", top: 24 }}>

                            <h3 style={{ ...sectionTitle, fontSize: 15 }}>Snapshot</h3>

                            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                    <span style={{ color: colors.inkMuted }}>Experience</span>
                                    <span style={{ fontWeight: 600, color: colors.forestDark }}>{doctor.experience || 0} yrs</span>
                                </div>

                                <div style={{ height: 1, background: colors.border }} />

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                    <span style={{ color: colors.inkMuted }}>Reviews</span>
                                    <span style={{ fontWeight: 600, color: colors.forestDark }}>{reviews?.totalReviews || 0}</span>
                                </div>

                                <div style={{ height: 1, background: colors.border }} />

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                    <span style={{ color: colors.inkMuted }}>Open slots</span>
                                    <span style={{ fontWeight: 600, color: colors.forestDark }}>{slots.length}</span>
                                </div>

                            </div>

                        </div>

                        <div style={{ ...card, padding: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <ShieldCheck size={20} color={colors.forestSoft} style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 13.5, color: colors.inkSoft, margin: 0, lineHeight: 1.6 }}>
                                Verified credentials reviewed by hospital administration.
                            </p>
                        </div>

                    </div>

                </div>

                {/* ======================= REVIEWS ======================= */}
                <div style={{ ...card, padding: 28, marginTop: 20 }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>

                        <div>
                            <h2 style={sectionTitle}>Patient reviews</h2>
                            <p style={{ marginTop: 4, fontSize: 13.5, color: colors.inkMuted }}>
                                From patients who completed appointments
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Star size={18} fill={colors.terracottaLight} color={colors.terracottaLight} />
                            <span style={{ fontSize: 20, fontWeight: 700, color: colors.forestDark }}>
                                {reviews?.averageRating ?? 0}
                            </span>
                            <span style={{ fontSize: 13.5, color: colors.inkMuted }}>
                                ({reviews?.totalReviews ?? 0})
                            </span>
                        </div>

                    </div>

                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

                        {

                            reviews?.reviews?.length > 0 ?

                                reviews.reviews.map((review, index) => (

                                    <div
                                        key={index}
                                        style={{ borderTop: index === 0 ? "none" : `1px solid ${colors.border}`, paddingTop: index === 0 ? 0 : 16 }}
                                    >

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 14.5, color: colors.forestDark, margin: 0 }}>
                                                    {review.patientName}
                                                </p>
                                                <p style={{ fontSize: 12.5, color: colors.inkMuted, marginTop: 2 }}>
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <Star size={14} fill={colors.terracottaLight} color={colors.terracottaLight} />
                                                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{review.rating}</span>
                                            </div>

                                        </div>

                                        <p style={{ marginTop: 8, color: colors.inkSoft, lineHeight: 1.65, fontSize: 14 }}>
                                            {review.comment}
                                        </p>

                                    </div>

                                ))

                                :

                                (

                                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                                        <Star size={32} color={colors.inkMuted} style={{ margin: "0 auto" }} />
                                        <h3 style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: colors.forestDark }}>
                                            No reviews yet
                                        </h3>
                                        <p style={{ marginTop: 4, color: colors.inkMuted, fontSize: 13.5 }}>
                                            Be the first patient to review this doctor
                                        </p>
                                    </div>

                                )

                        }

                    </div>

                </div>

                {/* ======================= CTA ======================= */}
                <div
                    style={{
                        marginTop: 20,
                        borderRadius: 14,
                        background: colors.forestDark,
                        padding: "32px 36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16
                    }}
                >

                    <div>
                        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 600, margin: 0, ...fontHeading }}>
                            Ready to book your appointment?
                        </h2>
                        <p style={{ marginTop: 6, color: "rgba(255,255,255,0.7)", fontSize: 14, maxWidth: 480 }}>
                            Schedule your consultation with this specialist in a few clicks.
                        </p>
                    </div>

                    <button

                        onClick={() => navigate(`/patient/bookdoctor?doctorId=${doctor.id}`)}

                        style={{
                            background: "#fff",
                            color: colors.forestDark,
                            padding: "12px 28px",
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 14,
                            border: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            ...fontBody
                        }}

                        onMouseOver={e => e.currentTarget.style.opacity = 0.9}
                        onMouseOut={e => e.currentTarget.style.opacity = 1}

                    >
                        Book appointment
                    </button>

                </div>
                {appointment && (
                    <AppointmentActions appointment={appointment} />
                )}

            </div>

        </div>

    );

}