import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FiMapPin } from "react-icons/fi";
import {
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiArrowLeft,
    FiShield,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const STEPS = [
    "Select Slot",
    "Patient Details",
    "Confirm",
    "Payment",
    "Done"
];

function formatSlotDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
    });
}

function formatSlotTime(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StepHeader({ step, doctorName }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#C9683F] uppercase tracking-wide">
                    {doctorName ? `Booking with Dr. ${doctorName}` : "Request an appointment"}
                </span>
                <span className="text-xs text-[#A8A192] font-medium">
                    Step {step + 1} of {STEPS.length}
                </span>
            </div>
            <h1 className="text-[26px] font-serif font-semibold text-[#16332B] leading-tight">
                {STEPS[step]}
            </h1>

            <div className="flex gap-1.5 mt-4">
                {STEPS.map((s, i) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#16332B]" : "bg-[#E7E2D6]"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

function SlotSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="h-16 rounded-xl bg-[#EFEAE0] animate-pulse"
                />
            ))}
        </div>
    );
}

export default function BookAppointment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const doctorId = searchParams.get("doctorId");
    const [step, setStep] = useState(0);
    const [doctor, setDoctor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [error, setError] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [paying, setPaying] = useState(false);
    const [appointmentResult, setAppointmentResult] = useState(null);
    const [refundBalance, setRefundBalance] = useState(0);
    const [useRefundBalance, setUseRefundBalance] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("Online");
    const [useProfile, setUseProfile] = useState(true);

    const [billing, setBilling] = useState({
        patientName: "",
        patientPhone: "",
        patientEmail: "",
        patientDob: "",
        gender: "",
        bloodGroup: "",
        address: "",
        relationship: "Self",
    });

    const advanceAmount = useMemo(() => {
        if (!doctor?.fee) return 0;
        return Math.round(doctor.fee * 0.5 * 100) / 100;
    }, [doctor]);
    const walletUsed = useMemo(() => {
        if (!useRefundBalance) return 0;
        return Math.min(refundBalance, advanceAmount);
    }, [refundBalance, advanceAmount, useRefundBalance]);

    const payableAmount = useMemo(() => {
        return advanceAmount - walletUsed;
    }, [advanceAmount, walletUsed]);

    useEffect(() => {
        if (!doctorId) {
            setError("No doctor selected.");
            setLoadingSlots(false);
            return;
        }
        loadDoctorAndSlots();
    }, [doctorId]);

    async function loadDoctorAndSlots() {
        setLoadingSlots(true);
        setError("");
        try {
            const [doctorsRes, slotsRes, refundRes] = await Promise.all([
                api.get("/patient/doctors"),
                api.get(`/patient/doctor/${doctorId}/slots`),
                api.get("/patient/refund-balance"),
            ]);

            setRefundBalance(refundRes.data.refundBalance ?? 0);
            const found = (doctorsRes.data || []).find(
                (d) => String(d.id) === String(doctorId)
            );
            setDoctor(found || null);
            setSlots(slotsRes.data || []);
        } catch (err) {
            setError("Unable to load doctor availability.");
            toast.error("Failed to load slots.");
        } finally {
            setLoadingSlots(false);
        }
    }
    async function loadProfile() {

        try {
            const res = await api.get("/patient/profile");
            setBilling({
                patientName: res.data.fullName || "",
                patientPhone: res.data.phone || "",
                patientEmail: res.data.email || "",
                patientDob: res.data.dob
                    ? res.data.dob.substring(0, 10)
                    : "",
                gender: res.data.gender || "",
                bloodGroup: res.data.bloodGroup || "",
                address: res.data.address || "",
                relationship: "Self"
            });
        } catch {

            toast.error("Failed to load profile.");
        }
    }

    function goToConfirm(slot) {
        const seatsLeft = slot.seatsLeft ?? (slot.maxPatients - slot.bookedCount);
        if (seatsLeft <= 0) {
            toast.error("This slot just got fully booked. Please pick another.");
            loadDoctorAndSlots();
            return;
        }
        setSelectedSlot(slot);
        setStep(1);
    }

    useEffect(() => {
        if (!useProfile) return;
        loadProfile();
    }, [useProfile]);

    async function confirmBooking(paymentId = null) {
        setPaying(true);

        try {
            const res = await api.post("/patient/book", {
                doctorAvailabilityId: selectedSlot.id, paymentMethod, useRefundBalance, razorpayPaymentId: paymentId,
                patientName: billing.patientName,
                patientPhone: billing.patientPhone,
                patientEmail: billing.patientEmail,
                patientDob: billing.patientDob,
                gender: billing.gender,
                bloodGroup: billing.bloodGroup,
                address: billing.address,
                relationship: billing.relationship
            });

            setAppointmentResult({
                appointmentId: res.data.appointmentId,
                originalAdvance: res.data.originalAdvance,
                walletUsed: res.data.walletUsed,
                payNow: res.data.payNow,
                walletBalance: res.data.walletBalance,
                seatsLeft: res.data.seatsLeft,
            });
            toast.success("Appointment Booked Successfully");
            setStep(4);

        } catch (err) {
            const msg = err?.response?.data;
            if (typeof msg === "string" && msg.toLowerCase().includes("fully booked")) {
                toast.error("This slot just got fully booked. Please pick another slot.");
                setStep(0);
                loadDoctorAndSlots();
            } else {
                toast.error(typeof msg === "string" ? msg : "Booking failed. Please try again.");
            }
        } finally {
            setPaying(false);
        }
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-[#F8F6F0]">
                <div
                    className="w-full mx-auto"
                    style={{
                        maxWidth: "1500px",
                        padding: "48px 40px",
                    }}
                >

                    {step < 3 && (
                        <button
                            onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))}
                            className="flex items-center gap-1.5 text-sm text-[#6B6458] hover:text-[#16332B] mb-6 transition"
                        >
                            <FiArrowLeft size={15} />
                            Back
                        </button>
                    )}
                    <div
                        className="bg-white shadow-lg"
                        style={{
                            borderRadius: "32px",
                            border: "1px solid #E7E2D6",
                            padding: "48px",
                            minHeight: "82vh",
                        }}
                    >
                        <StepHeader step={step} doctorName={doctor?.name} />

                        {error && (
                            <div className="bg-[#FBEAE5] border border-[#E8B8AA] rounded-xl p-4 text-center">
                                <p className="text-[#9E3A20] text-sm">{error}</p>
                            </div>
                        )}

                        {!error && step === 0 && (
                            <div>
                                {loadingSlots && <SlotSkeleton />}
                                {!loadingSlots && slots.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-[#16332B] font-medium mt-4">
                                            No open slots right now
                                        </p>
                                        <p className="text-[#8B8478] text-sm mt-1">
                                            Check back later or try another doctor.
                                        </p>
                                    </div>
                                )}

                                {!loadingSlots && slots.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {slots.map((slot) => {
                                            const seatsLeft = slot.seatsLeft ?? (slot.maxPatients - slot.bookedCount);
                                            const low = seatsLeft <= 3;
                                            return (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => goToConfirm(slot)}
                                                    className="text-left rounded-xl border border-[#E7E2D6] hover:border-[#16332B] hover:bg-[#F8F6F0] p-3.5 transition group"
                                                >
                                                    <div className="flex items-center gap-1.5 text-[#16332B]">
                                                        <FiCalendar size={13} />
                                                        <span className="text-xs font-semibold">
                                                            {formatSlotDate(slot.availableFrom)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1.5 text-[#6B6458]">
                                                        <FiClock size={13} />
                                                        <span className="text-sm font-medium">
                                                            {formatSlotTime(slot.availableFrom)} - {formatSlotTime(slot.availableTo)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1.5 text-[#6B6458]">
                                                        <FiMapPin size={13} />
                                                        <span className="text-sm font-medium">
                                                            {slot.place}
                                                        </span>
                                                    </div>

                                                    {seatsLeft != null && (
                                                        <span
                                                            className={`inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${low
                                                                ? "bg-[#FBEAE0] text-[#C9683F]"
                                                                : "bg-[#EEF5F2] text-[#2F6B47]"
                                                                }`}
                                                        >
                                                            {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                        {!error && step === 1 && selectedSlot && (
                            <div>
                                <div className="flex items-center justify-between mb-6">

                                    <h3 className="text-xl font-semibold text-[#16332B]">
                                        Patient Details
                                    </h3>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={useProfile}
                                            onChange={(e) =>
                                                setUseProfile(e.target.checked)
                                            }
                                        />
                                        Use My Profile
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    <div>
                                        <label className="block text-sm mb-1">
                                            Patient Name
                                        </label>

                                        <input
                                            className="w-full border rounded-xl p-3"
                                            value={billing.patientName}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    patientName: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">
                                            Phone
                                        </label>

                                        <input
                                            className="w-full border rounded-xl p-3"
                                            value={billing.patientPhone}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    patientPhone: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">
                                            Email
                                        </label>

                                        <input
                                            className="w-full border rounded-xl p-3"
                                            value={billing.patientEmail}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    patientEmail: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">
                                            Date of Birth
                                        </label>

                                        <input
                                            type="date"
                                            className="w-full border rounded-xl p-3"
                                            value={billing.patientDob}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    patientDob: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">
                                            Gender
                                        </label>

                                        <input
                                            className="w-full border rounded-xl p-3"
                                            value={billing.gender}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    gender: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">
                                            Blood Group
                                        </label>

                                        <input
                                            className="w-full border rounded-xl p-3"
                                            value={billing.bloodGroup}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    bloodGroup: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">
                                            Relationship
                                        </label>

                                        <select
                                            className="w-full border rounded-xl p-3"
                                            value={billing.relationship}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    relationship: e.target.value
                                                })
                                            }
                                        >
                                            <option>Self</option>
                                            <option>Father</option>
                                            <option>Mother</option>
                                            <option>Brother</option>
                                            <option>Sister</option>
                                            <option>Spouse</option>
                                            <option>Child</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">

                                        <label className="block text-sm mb-1">
                                            Address
                                        </label>

                                        <textarea
                                            rows={3}
                                            className="w-full border rounded-xl p-3"
                                            value={billing.address}
                                            onChange={(e) =>
                                                setBilling({
                                                    ...billing,
                                                    address: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => {

                                        if (!billing.patientName.trim()) {
                                            toast.error("Patient name is required");
                                            return;
                                        }

                                        if (!billing.patientPhone.trim()) {
                                            toast.error("Phone number is required");
                                            return;
                                        }

                                        setStep(2);

                                    }}
                                    className="w-full mt-8 bg-[#16332B] text-white py-3 rounded-xl"
                                >
                                    Continue
                                </button>

                            </div>
                        )}

                        {!error && step === 2 && selectedSlot && (
                            <div>
                                <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-5 space-y-3.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Doctor</span>
                                        <span className="font-medium text-[#16332B]">
                                            {doctor?.name || `#${doctorId}`}
                                        </span>
                                    </div>
                                    {doctor?.specialization && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#8B8478]">Specialization</span>
                                            <span className="font-medium text-[#16332B]">
                                                {doctor.specialization}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Date</span>
                                        <span className="font-medium text-[#16332B]">
                                            {formatSlotDate(selectedSlot.availableFrom)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Visiting Time</span>
                                        <span className="font-medium text-[#16332B]">
                                            {formatSlotTime(selectedSlot.availableFrom)} - {formatSlotTime(selectedSlot.availableTo)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Seats left</span>
                                        <span className="font-medium text-[#16332B]">
                                            {selectedSlot.seatsLeft ?? (selectedSlot.maxPatients - selectedSlot.bookedCount)}
                                        </span>
                                    </div>
                                    <div className="border-t border-[#E7E2D6] pt-3.5 flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Consultation fee</span>
                                        <span className="font-medium text-[#16332B]">
                                            ₹{doctor?.fee ?? "—"}
                                        </span>
                                    </div>
                                    <div className="mt-6 rounded-2xl border border-[#E7E2D6] bg-white p-5">

                                        <h3 className="text-lg font-semibold text-[#16332B] mb-4">
                                            Patient Details
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-4">

                                            <div>
                                                <p className="text-xs text-gray-500">Patient Name</p>
                                                <p className="font-medium">{billing.patientName}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="font-medium">{billing.patientPhone}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="font-medium">
                                                    {billing.patientEmail || "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">Date of Birth</p>
                                                <p className="font-medium">
                                                    {billing.patientDob || "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">Gender</p>
                                                <p className="font-medium">
                                                    {billing.gender || "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">Blood Group</p>
                                                <p className="font-medium">
                                                    {billing.bloodGroup || "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500">Relationship</p>
                                                <p className="font-medium">
                                                    {billing.relationship}
                                                </p>
                                            </div>

                                            <div className="md:col-span-2">
                                                <p className="text-xs text-gray-500">Address</p>
                                                <p className="font-medium">
                                                    {billing.address || "-"}
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="rounded-2xl border border-[#E7E2D6] bg-[#FCFBF8] p-5 mb-6">

                                        <h3 className="text-lg font-semibold text-[#16332B] mb-4">
                                            Booking For
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">

                                            <div>
                                                <p className="text-xs text-[#8B8478]">Patient Name</p>
                                                <p className="font-semibold text-[#16332B]">
                                                    {billing.patientName}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-[#8B8478]">Relationship</p>
                                                <p className="font-semibold text-[#16332B]">
                                                    {billing.relationship}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-[#8B8478]">Phone</p>
                                                <p className="font-semibold text-[#16332B]">
                                                    {billing.patientPhone}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-[#8B8478]">Email</p>
                                                <p className="font-semibold text-[#16332B]">
                                                    {billing.patientEmail || "-"}
                                                </p>
                                            </div>

                                        </div>

                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-[#16332B]">
                                            Pay now (50% advance)
                                        </span>
                                        <span className="text-lg font-semibold text-[#C9683F]">
                                            ₹{advanceAmount}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-[#A8A192] mt-4 text-center">
                                    Remaining balance is settled at the clinic after your visit.
                                </p>

                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full mt-6 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                >
                                    Continue to payment
                                </button>
                            </div>
                        )}

                        {!error && step === 3 && selectedSlot && (
                            <div>
                                <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-6">

                                    <h3 className="text-lg font-semibold text-[#16332B] mb-5">
                                        Select Payment Method
                                    </h3>

                                    <div className="space-y-4">
                                        <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${paymentMethod === "Online"
                                            ? "border-[#16332B] bg-[#EEF5F2]"
                                            : "border-[#E7E2D6]"
                                            }`}>
                                            <div>
                                                <h4 className="font-semibold">💳 Online Payment</h4>
                                                <p className="text-sm text-gray-500">
                                                    Pay advance online
                                                </p>
                                            </div>

                                            <input
                                                type="radio"
                                                checked={paymentMethod === "Online"}
                                                onChange={() => setPaymentMethod("Online")}
                                            />
                                        </label>

                                        <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${paymentMethod === "Cash"
                                            ? "border-[#16332B] bg-[#EEF5F2]"
                                            : "border-[#E7E2D6]"
                                            }`}>
                                        </label>
                                    </div>

                                    <div className="mt-6 border-t border-[#E7E2D6] pt-4 space-y-2">

                                        <div className="flex justify-between text-sm">
                                            <span>Advance Fee</span>
                                            <span>₹{advanceAmount}</span>
                                        </div>

                                        {useRefundBalance && walletUsed > 0 && (
                                            <div className="flex justify-between text-sm text-green-700">
                                                <span>Refund Balance Used</span>
                                                <span>-₹{walletUsed}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-lg font-bold border-t border-[#E7E2D6] pt-3">
                                            <span>Pay Now</span>
                                            <span>
                                                {paymentMethod === "Online"
                                                    ? `₹${payableAmount}`
                                                    : "₹0"}
                                            </span>
                                        </div>

                                    </div>
                                    {refundBalance > 0 && (
                                        <label
                                            className={`flex items-center justify-between p-4 rounded-xl border mt-3 cursor-pointer ${useRefundBalance
                                                ? "border-[#16332B] bg-[#EEF5F2]"
                                                : "border-[#E7E2D6]"
                                                }`}
                                        >
                                            <div>
                                                <h4 className="font-semibold text-[#16332B]">
                                                    Use Refund Balance
                                                </h4>

                                                <p className="text-sm text-[#6B6458]">
                                                    Available Balance : ₹{refundBalance}
                                                </p>
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={useRefundBalance}
                                                onChange={(e) => setUseRefundBalance(e.target.checked)}
                                            />
                                        </label>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (paymentMethod === "Online" && payableAmount > 0) {
                                                setShowPaymentModal(true);
                                            } else {
                                                confirmBooking();
                                            }
                                        }}
                                        className="w-full mt-6 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                    >
                                        {paying
                                            ? "Booking..."
                                            : paymentMethod === "Online"
                                                ? "Pay & Confirm"
                                                : "Confirm Booking"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-[#E9F2EC] flex items-center justify-center">
                                    <FiCheckCircle className="text-[#2F6B47]" size={30} />
                                </div>
                                <h2 className="text-lg font-semibold text-[#16332B] mt-5">
                                    Appointment confirmed
                                </h2>
                                <p className="text-[#6B6458] text-sm mt-2">
                                    Reference #{appointmentResult?.appointmentId}
                                </p>
                                <p className="text-[#8B8478] text-sm mt-1">
                                    Payment Method: {paymentMethod}
                                </p>

                                <p className="text-[#8B8478] text-sm">
                                    <div className="text-[#8B8478] text-sm mt-2">
                                        <p>Wallet Used : ₹{appointmentResult?.walletUsed ?? 0}</p>
                                        <p>Paid Online : ₹{appointmentResult?.payNow ?? 0}</p>
                                    </div>
                                </p>

                                <button
                                    onClick={() => navigate("/patient/appointments")}
                                    className="w-full mt-7 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                >
                                    View my appointments
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white rounded-2xl w-[420px] p-6">

                        <h2 className="text-xl font-bold text-[#16332B]">
                            Demo Payment Gateway
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Amount to Pay
                        </p>

                        <h1 className="text-3xl font-bold mt-2">
                            ₹{payableAmount}
                        </h1>

                        <div className="mt-6 space-y-3">

                            <button className="w-full border rounded-xl p-3 text-left">
                                💳 Card Payment
                            </button>
                            <button className="w-full border rounded-xl p-3 text-left">
                                📱 UPI
                            </button>
                            <button className="w-full border rounded-xl p-3 text-left">
                                🏦 Net Banking
                            </button>

                        </div>

                        <button
                            className="w-full mt-6 bg-[#16332B] text-white py-3 rounded-xl"
                            onClick={async () => {

                                setProcessingPayment(true);
                                await new Promise(r => setTimeout(r, 2000));
                                setShowPaymentModal(false);
                                confirmBooking("DEMO_PAYMENT_" + Date.now());
                            }}
                        >
                            {processingPayment
                                ? "Processing..."
                                : `Pay ₹${payableAmount}`}
                        </button>

                    </div>
                </div>
            )}
        </>
    );
}