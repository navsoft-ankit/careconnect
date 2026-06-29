import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import {
    FiMapPin,
    FiNavigation,
    FiCheckCircle,
    FiArrowLeft,
    FiAlertTriangle,
    FiXCircle,
    FiLoader,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const STEPS = ["Pickup", "Destination", "Vehicle", "Confirm"];

// Known destinations with fixed coordinates — avoids needing a paid maps/geocoding API.
const DESTINATIONS = [
    {
        key: "lakeview",
        label: "Lakeview Hospital (main)",
        address: "Lakeview Hospital, Main Campus",
        lat: 22.5726,
        lng: 88.3639,
    },
    {
        key: "lakeview_annex",
        label: "Lakeview Hospital (annex / emergency wing)",
        address: "Lakeview Hospital, Emergency Annex",
        lat: 22.5751,
        lng: 88.3667,
    },
    { key: "other", label: "Other location", address: "", lat: null, lng: null },
];

const VEHICLE_TYPES = [
    {
        key: "NonAC",
        label: "Basic (Non-AC)",
        rate: 25,
        icon: "🚑",
        note: "Standard transport for stable patients",
    },
    {
        key: "AC",
        label: "Advanced (AC)",
        rate: 50,
        icon: "🚨",
        note: "Climate-controlled, for longer transfers",
    },
    {
        key: "Big",
        label: "Critical care (Big vehicle)",
        rate: 150,
        icon: "🏥",
        note: "Fully equipped for critical & trauma cases",
    },
];

function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function StepHeader({ step, driverName }) {
    return (
        <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#C9683F] uppercase tracking-wide">
                    {driverName ? `Booking ${driverName}` : "Ambulance request"}
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
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= step ? "bg-[#16332B]" : "bg-[#E7E2D6]"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function AmbulanceRequest() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ambulanceId = searchParams.get("ambulanceId");
    const driverName = searchParams.get("driverName") || "";

    const [step, setStep] = useState(0);

    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [pickup, setPickup] = useState(null); // { lat, lng }
    const [pickupLabel, setPickupLabel] = useState("");

    const [destinationKey, setDestinationKey] = useState("lakeview");
    const [customDestination, setCustomDestination] = useState({
        address: "",
        lat: "",
        lng: "",
    });

    const [vehicleType, setVehicleType] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // --- Waiting-for-driver state (step 4) ---
    const [rideStatus, setRideStatus] = useState("Pending"); // Pending | Accepted | Rejected | Cancelled
    const [rideInfo, setRideInfo] = useState(null);
    const pollRef = useRef(null);

    const destination = useMemo(() => {
        if (destinationKey === "other") {
            return {
                address: customDestination.address,
                lat: parseFloat(customDestination.lat),
                lng: parseFloat(customDestination.lng),
            };
        }
        return DESTINATIONS.find((d) => d.key === destinationKey);
    }, [destinationKey, customDestination]);

    const distanceKm = useMemo(() => {
        if (!pickup || !destination?.lat || !destination?.lng) return null;
        return haversineKm(pickup.lat, pickup.lng, destination.lat, destination.lng);
    }, [pickup, destination]);

    const estimatedFare = useMemo(() => {
        if (distanceKm == null || !vehicleType) return null;
        const rate = VEHICLE_TYPES.find((v) => v.key === vehicleType)?.rate || 0;
        return Math.round(rate * distanceKm * 100) / 100;
    }, [distanceKm, vehicleType]);

    function detectPickup() {
        if (!navigator.geolocation) {
            setLocationError("Your browser doesn't support location detection.");
            return;
        }
        setLocating(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPickup({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setPickupLabel(
                    `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
                );
                setLocating(false);
            },
            () => {
                setLocationError(
                    "Couldn't access your location. Please allow location access and try again."
                );
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    useEffect(() => {
        detectPickup();
    }, []);

    // Poll ride status once we're on step 4 ("waiting for driver" / done)
    useEffect(() => {
        if (step !== 4 || !result?.requestId) return;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/patient/ambulance-request/${result.requestId}`);
                setRideInfo(res.data);
                setRideStatus(res.data.status);

                // stop polling once the driver has responded either way
                if (res.data.status !== "Pending") {
                    clearInterval(pollRef.current);
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkStatus(); // run immediately
        pollRef.current = setInterval(checkStatus, 5000);

        return () => clearInterval(pollRef.current);
    }, [step, result]);

    function canContinueDestination() {
        if (destinationKey !== "other") return true;
        return (
            customDestination.address.trim() &&
            !Number.isNaN(parseFloat(customDestination.lat)) &&
            !Number.isNaN(parseFloat(customDestination.lng))
        );
    }

    async function submitRequest() {
        if (!ambulanceId) {
            setError("No ambulance selected. Please go back and pick one.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const res = await api.post("/patient/ambulance-request", {
                ambulanceId: parseInt(ambulanceId, 10),
                pickupLocation: pickupLabel,
                destinationLocation: destination.address,
                pickupLat: pickup.lat,
                pickupLng: pickup.lng,
                destinationLat: destination.lat,
                destinationLng: destination.lng,
                vehicleType,
            });

            setResult(res.data);
            setRideStatus("Pending");
            setStep(4);
            toast.success("Request sent — waiting for driver to accept.");
        } catch (err) {
            setError(err?.response?.data || "Couldn't send the request. Please try again.");
            toast.error("Request failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-[#F8F6F0]">
                <div className="max-w-xl mx-auto px-4 py-10">

                    {step < 4 && (
                        <button
                            onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))}
                            className="flex items-center gap-1.5 text-sm text-[#6B6458] hover:text-[#16332B] mb-6 transition"
                        >
                            <FiArrowLeft size={15} />
                            Back
                        </button>
                    )}

                    <div className="bg-white rounded-2xl border border-[#E7E2D6] p-6 sm:p-8">

                        {step < 4 && <StepHeader step={step} driverName={driverName} />}

                        {/* Step 0: Pickup */}
                        {step === 0 && (
                            <div>
                                <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-5">
                                    {locating && (
                                        <div className="flex items-center gap-3 text-[#6B6458] text-sm">
                                            <FiNavigation className="animate-pulse text-[#16332B]" size={16} />
                                            Detecting your location…
                                        </div>
                                    )}

                                    {!locating && pickup && (
                                        <div className="flex items-start gap-3">
                                            <FiMapPin className="text-[#2F6B47] mt-0.5 shrink-0" size={18} />
                                            <div>
                                                <p className="text-sm font-medium text-[#16332B]">
                                                    Location detected
                                                </p>
                                                <p className="text-xs text-[#8B8478] mt-1">{pickupLabel}</p>
                                            </div>
                                        </div>
                                    )}

                                    {!locating && locationError && (
                                        <div className="flex items-start gap-3">
                                            <FiAlertTriangle className="text-[#9E3A20] mt-0.5 shrink-0" size={18} />
                                            <div>
                                                <p className="text-sm font-medium text-[#9E3A20]">
                                                    {locationError}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={detectPickup}
                                    className="w-full mt-4 border border-[#E7E2D6] hover:bg-[#F1EDE3] text-[#16332B] py-2.5 rounded-xl text-sm font-medium transition"
                                >
                                    {pickup ? "Re-detect location" : "Detect my location"}
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    disabled={!pickup}
                                    className="w-full mt-3 bg-[#16332B] hover:bg-[#0F241D] disabled:opacity-40 text-white py-3 rounded-xl font-medium transition"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 1: Destination */}
                        {step === 1 && (
                            <div>
                                <div className="space-y-2.5">
                                    {DESTINATIONS.map((d) => (
                                        <button
                                            key={d.key}
                                            onClick={() => setDestinationKey(d.key)}
                                            className={`w-full text-left rounded-xl border p-4 transition ${
                                                destinationKey === d.key
                                                    ? "border-[#16332B] bg-[#F8F6F0]"
                                                    : "border-[#E7E2D6] hover:border-[#16332B]/30"
                                            }`}
                                        >
                                            <p className="text-sm font-medium text-[#16332B]">{d.label}</p>
                                            {d.address && (
                                                <p className="text-xs text-[#8B8478] mt-1">{d.address}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {destinationKey === "other" && (
                                    <div className="mt-4 space-y-3">
                                        <input
                                            value={customDestination.address}
                                            onChange={(e) =>
                                                setCustomDestination((p) => ({ ...p, address: e.target.value }))
                                            }
                                            placeholder="Destination address"
                                            className="w-full h-11 px-4 rounded-xl border border-[#E7E2D6] focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 focus:border-[#16332B] text-sm"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                value={customDestination.lat}
                                                onChange={(e) =>
                                                    setCustomDestination((p) => ({ ...p, lat: e.target.value }))
                                                }
                                                placeholder="Latitude"
                                                inputMode="decimal"
                                                className="h-11 px-4 rounded-xl border border-[#E7E2D6] focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 focus:border-[#16332B] text-sm"
                                            />
                                            <input
                                                value={customDestination.lng}
                                                onChange={(e) =>
                                                    setCustomDestination((p) => ({ ...p, lng: e.target.value }))
                                                }
                                                placeholder="Longitude"
                                                inputMode="decimal"
                                                className="h-11 px-4 rounded-xl border border-[#E7E2D6] focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 focus:border-[#16332B] text-sm"
                                            />
                                        </div>
                                        <p className="text-xs text-[#A8A192]">
                                            Tip: open Google Maps, long-press the destination, and copy the coordinates shown.
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!canContinueDestination()}
                                    className="w-full mt-6 bg-[#16332B] hover:bg-[#0F241D] disabled:opacity-40 text-white py-3 rounded-xl font-medium transition"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Vehicle type */}
                        {step === 2 && (
                            <div>
                                <div className="space-y-3">
                                    {VEHICLE_TYPES.map((v) => (
                                        <button
                                            key={v.key}
                                            onClick={() => setVehicleType(v.key)}
                                            className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition ${
                                                vehicleType === v.key
                                                    ? "border-[#16332B] bg-[#F8F6F0]"
                                                    : "border-[#E7E2D6] hover:border-[#16332B]/30"
                                            }`}
                                        >
                                            <span className="text-2xl shrink-0">{v.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-[#16332B]">{v.label}</p>
                                                <p className="text-xs text-[#8B8478] mt-0.5">{v.note}</p>
                                            </div>
                                            <span className="text-sm font-medium text-[#C9683F] shrink-0">
                                                ₹{v.rate}/km
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {distanceKm != null && (
                                    <p className="text-xs text-[#A8A192] mt-4 text-center">
                                        Estimated distance: {distanceKm.toFixed(1)} km
                                    </p>
                                )}

                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!vehicleType}
                                    className="w-full mt-6 bg-[#16332B] hover:bg-[#0F241D] disabled:opacity-40 text-white py-3 rounded-xl font-medium transition"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 3 && (
                            <div>
                                <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-5 space-y-3.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Pickup</span>
                                        <span className="font-medium text-[#16332B] text-right">{pickupLabel}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Destination</span>
                                        <span className="font-medium text-[#16332B] text-right">
                                            {destination?.address}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Vehicle</span>
                                        <span className="font-medium text-[#16332B]">
                                            {VEHICLE_TYPES.find((v) => v.key === vehicleType)?.label}
                                        </span>
                                    </div>
                                    {distanceKm != null && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#8B8478]">Distance</span>
                                            <span className="font-medium text-[#16332B]">
                                                {distanceKm.toFixed(1)} km
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-[#E7E2D6] pt-3.5 flex justify-between">
                                        <span className="text-sm font-semibold text-[#16332B]">
                                            Estimated fare
                                        </span>
                                        <span className="text-lg font-semibold text-[#C9683F]">
                                            {estimatedFare != null ? `₹${estimatedFare}` : "—"}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-[#A8A192] mt-3 text-center">
                                    Final fare is confirmed by the dispatcher based on actual route distance.
                                </p>

                                {error && (
                                    <div className="bg-[#FBEAE5] border border-[#E8B8AA] rounded-xl p-3.5 mt-4 text-center">
                                        <p className="text-[#9E3A20] text-sm">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={submitRequest}
                                    disabled={submitting}
                                    className="w-full mt-6 bg-[#C9683F] hover:bg-[#B85A33] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition"
                                >
                                    {submitting ? "Sending request…" : "Confirm & dispatch"}
                                </button>
                            </div>
                        )}

                        {/* Step 4: Waiting / Accepted / Rejected */}
                        {step === 4 && result && (
                            <div className="text-center py-4">
                                {rideStatus === "Pending" && (
                                    <>
                                        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF4E0] flex items-center justify-center">
                                            <FiLoader className="text-[#B3791E] animate-spin" size={28} />
                                        </div>
                                        <h2 className="text-lg font-semibold text-[#16332B] mt-5">
                                            Waiting for driver to accept
                                        </h2>
                                        <p className="text-[#6B6458] text-sm mt-2">
                                            Request #{result.requestId}
                                        </p>
                                        <p className="text-[#8B8478] text-sm mt-1">
                                            {result.distanceKm} km · estimated fare ₹{result.fare}
                                        </p>
                                        <p className="text-[#A8A192] text-xs mt-4">
                                            This page checks for updates automatically — no need to refresh.
                                        </p>
                                    </>
                                )}

                                {rideStatus === "Accepted" && (
                                    <>
                                        <div className="w-16 h-16 mx-auto rounded-full bg-[#E9F2EC] flex items-center justify-center">
                                            <FiCheckCircle className="text-[#2F6B47]" size={30} />
                                        </div>
                                        <h2 className="text-lg font-semibold text-[#16332B] mt-5">
                                            Driver accepted your ride
                                        </h2>
                                        {rideInfo?.driverName && (
                                            <p className="text-[#6B6458] text-sm mt-2">
                                                {rideInfo.driverName}
                                                {rideInfo.vehicleNumber ? ` · ${rideInfo.vehicleNumber}` : ""}
                                            </p>
                                        )}
                                        <p className="text-[#8B8478] text-sm mt-1">
                                            {result.distanceKm} km · estimated fare ₹{result.fare}
                                        </p>

                                        <button
                                            onClick={() => navigate("/patient/ambulance")}
                                            className="w-full mt-7 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                        >
                                            Back to ambulances
                                        </button>
                                    </>
                                )}

                                {rideStatus === "Rejected" && (
                                    <>
                                        <div className="w-16 h-16 mx-auto rounded-full bg-[#FBEAE5] flex items-center justify-center">
                                            <FiXCircle className="text-[#9E3A20]" size={28} />
                                        </div>
                                        <h2 className="text-lg font-semibold text-[#16332B] mt-5">
                                            Driver couldn't accept this ride
                                        </h2>
                                        <p className="text-[#8B8478] text-sm mt-2 max-w-xs mx-auto">
                                            Try a different ambulance, or call 108 if this is urgent.
                                        </p>

                                        <button
                                            onClick={() => navigate("/patient/ambulance")}
                                            className="w-full mt-7 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                        >
                                            Choose another ambulance
                                        </button>
                                    </>
                                )}

                                {rideStatus === "Cancelled" && (
                                    <>
                                        <div className="w-16 h-16 mx-auto rounded-full bg-[#F1EDE3] flex items-center justify-center">
                                            <FiXCircle className="text-[#6B6458]" size={28} />
                                        </div>
                                        <h2 className="text-lg font-semibold text-[#16332B] mt-5">
                                            Ride was cancelled
                                        </h2>
                                        <p className="text-[#8B8478] text-sm mt-2 max-w-xs mx-auto">
                                            You can book another ambulance any time.
                                        </p>

                                        <button
                                            onClick={() => navigate("/patient/ambulance")}
                                            className="w-full mt-7 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                        >
                                            Back to ambulances
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}