import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import MapPicker from "../../components/MapPicker";
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

const STEPS = ["Pickup", "Destination", "Confirm"];

const VEHICLES = {
    NonAC: {
        label: "Basic (Non-AC)",
        rate: 45,
        icon: "🚑",
        note: "Standard transport for stable patients",
    },
    AC: {
        label: "AC Ambulance",
        rate: 75,
        icon: "❄️",
        note: "Comfortable transport",
    },
    Big: {
        label: "Big / ICU Ambulance",
        rate: 150,
        icon: "🏥",
        note: "Critical care support",
    },
};


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
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#16332B]" : "bg-[#E7E2D6]"
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
    const driverName = searchParams.get("driverName") || "";
    const vehicleType = searchParams.get("type") || "NonAC";
    const VEHICLE = VEHICLES[vehicleType] || VEHICLES.NonAC;
    const [ambulances, setAmbulances] = useState([]);
    const [loadingAmbulances, setLoadingAmbulances] = useState(false);
    const [step, setStep] = useState(0);
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [pickup, setPickup] = useState(null); // { lat, lng }
    const [pickupLabel, setPickupLabel] = useState("");
    const [destination, setDestination] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState("");
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // --- Waiting-for-driver state (final step) ---
    const [rideStatus, setRideStatus] = useState("Pending"); // Pending | Accepted | Rejected | Cancelled
    const [rideInfo, setRideInfo] = useState(null);
    const pollRef = useRef(null);

    const distanceKm = useMemo(() => {
        if (!pickup || !destination?.lat || !destination?.lng) return null;
        return haversineKm(pickup.lat, pickup.lng, destination.lat, destination.lng);
    }, [pickup, destination]);

    const estimatedFare = useMemo(() => {
        if (distanceKm == null) return null;
        return Math.round(VEHICLE.rate * distanceKm * 100) / 100;
    }, [distanceKm]);

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

    async function searchLocation(value) {
        if (value.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const res = await api.get(`/maps/search?q=${encodeURIComponent(value)}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    }

    // Poll ride status once we're on the final "waiting for driver" step
    useEffect(() => {
        if (step !== 3 || !result?.requestId) return;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/patient/ambulance-request/${result.requestId}`);
                setRideInfo(res.data);
                setRideStatus(res.data.status);

                if (res.data.status !== "Pending") {
                    clearInterval(pollRef.current);
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkStatus();
        pollRef.current = setInterval(checkStatus, 5000);

        return () => clearInterval(pollRef.current);
    }, [step, result]);

    useEffect(() => {
        if (search.length < 3) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            searchLocation(search);
        }, 600);

        return () => clearTimeout(timer);
    }, [search]);

    async function loadAmbulances() {
        setLoadingAmbulances(true);
        try {
            const res = await api.get(`/patient/ambulances?type=${vehicleType}`);
            setAmbulances(res.data);
            return res.data;
        } catch {
            toast.error("Failed to load ambulances");
            return [];
        } finally {
            setLoadingAmbulances(false);
        }
    }

    async function goToConfirm() {
        const list = await loadAmbulances();
        if (!list || list.length === 0) {
            toast.error("No ambulance available right now.");
            return;
        }
        setStep(2);
    }

    async function submitRequest() {
        if (ambulances.length === 0) {
            setError("No ambulance available.");
            return;
        }

        const ambulanceId = ambulances[0].id;
        setSubmitting(true);
        setError("");
        try {
            const res = await api.post("/patient/ambulance-request", {
                ambulanceId: parseInt(ambulanceId, 10),
                pickupLocation: pickupLabel,
                destinationLocation: destinationAddress,
                pickupLat: pickup.lat,
                pickupLng: pickup.lng,
                destinationLat: destination.lat,
                destinationLng: destination.lng,
                vehicleType,
            });

            setResult(res.data);
            setRideStatus("Pending");
            setStep(3);
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
                        {step < 3 && <StepHeader step={step} driverName={driverName} />}

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
                            <div className="space-y-5">

                                <MapPicker
                                    currentLocation={pickup}
                                    destination={destination}
                                    setDestination={setDestination}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-[#16332B] mb-2">
                                        Destination Address
                                    </label>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search Hospital or Address"
                                        className="w-full h-12 px-4 rounded-xl border border-[#E7E2D6] focus:outline-none focus:ring-2 focus:ring-[#16332B]/20"
                                    />
                                    {searching && (
                                        <p className="text-sm mt-2 text-gray-500">
                                            Searching...
                                        </p>
                                    )}

                                    {searchResults.length > 0 && (
                                        <div className="border rounded-xl mt-2 max-h-60 overflow-y-auto">
                                            {searchResults.map((item, index) => (
                                                <button
                                                    key={index}
                                                    className="w-full text-left p-3 hover:bg-gray-100 border-b"
                                                    onClick={() => {
                                                        setDestination({
                                                            lat: parseFloat(item.lat),
                                                            lng: parseFloat(item.lon)
                                                        });
                                                        setDestinationAddress(item.display_name);
                                                        setSearch(item.display_name);
                                                        setSearchResults([]);
                                                    }}
                                                >
                                                    {item.display_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {destination && (
                                    <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-4">
                                        <p className="font-medium text-[#16332B]">
                                            Selected Location
                                        </p>
                                        <p className="text-sm text-[#777] mt-2">
                                            Latitude : {destination.lat.toFixed(6)}
                                        </p>
                                        <p className="text-sm text-[#777]">
                                            Longitude : {destination.lng.toFixed(6)}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={goToConfirm}
                                    disabled={!destination || loadingAmbulances}
                                    className="w-full mt-4 bg-[#16332B] hover:bg-[#0F241D] disabled:opacity-40 text-white py-3 rounded-xl font-medium transition"
                                >
                                    {loadingAmbulances ? "Checking availability…" : "Continue"}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Confirm — distance & fare shown directly, Non-AC only */}
                        {step === 2 && (
                            <div>
                                <div className="rounded-xl border border-[#E7E2D6] p-4 flex items-center gap-4 mb-5 bg-[#F8F6F0]">
                                    <span className="text-2xl shrink-0">{VEHICLE.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#16332B]">{VEHICLE.label}</p>
                                        <p className="text-xs text-[#8B8478] mt-0.5">{VEHICLE.note}</p>
                                    </div>
                                    <span className="text-sm font-medium text-[#C9683F] shrink-0">
                                        ₹{VEHICLE.rate}/km
                                    </span>
                                </div>

                                <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-5 space-y-3.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Pickup</span>
                                        <span className="font-medium text-[#16332B] text-right">{pickupLabel}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Destination</span>
                                        <span className="font-medium text-[#16332B] text-right">
                                            {destinationAddress}
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

                        {/* Step 3: Waiting / Accepted / Rejected */}
                        {step === 3 && result && (
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