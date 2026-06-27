import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
    FiSearch,
    FiMapPin,
    FiPhoneCall,
    FiTruck,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const TYPE_META = {
    "Basic Life Support": { tag: "BLS", note: "Standard emergency transport" },
    "Advanced Life Support": { tag: "ALS", note: "Critical & trauma support" },
    "Neonatal Care": { tag: "NICU", note: "Infant & newborn transport" },
};

function getTypeMeta(type) {
    return TYPE_META[type] || { tag: "BLS", note: "Standard emergency transport" };
}

function AmbulanceCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-[#E7E2D6] p-4 flex items-center gap-4 animate-pulse">
            <div className="w-16 h-16 rounded-xl bg-[#EFEAE0] shrink-0" />
            <div className="flex-1 space-y-2.5 min-w-0">
                <div className="h-3.5 bg-[#EFEAE0] rounded w-32" />
                <div className="h-3 bg-[#EFEAE0] rounded w-24" />
                <div className="h-3 bg-[#EFEAE0] rounded w-20" />
            </div>
            <div className="w-20 h-10 bg-[#EFEAE0] rounded-full shrink-0" />
        </div>
    );
}

export default function Ambulance() {
    const navigate = useNavigate();
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [activeZone, setActiveZone] = useState("Local");

    const zones = ["Local", "City", "District"];

    useEffect(() => {
        loadAmbulances();
    }, []);

    async function loadAmbulances() {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/patient/ambulances");
            setAmbulances(res.data || []);
        } catch (err) {
            setError("Unable to load ambulances right now.");
            toast.error("Couldn't load nearby ambulances.");
        } finally {
            setLoading(false);
        }
    }

    function goToBooking(amb) {
        const params = new URLSearchParams({
            ambulanceId: amb.id,
            driverName: amb.driverName || "",
        });
        navigate(`/patient/ambulance/request?${params.toString()}`);
    }

    const filtered = ambulances.filter((a) => {
        if (!search) return true;
        const haystack = `${a.driverName || ""} ${a.vehicleNumber || ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
    });

    const grouped = filtered.reduce((acc, a) => {
        const type = a.type || "Basic Life Support";
        if (!acc[type]) acc[type] = [];
        acc[type].push(a);
        return acc;
    }, {});

    const hasResults = filtered.length > 0;

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-[#F8F6F0]">
                <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10">

                    {/* Header */}
                    <div className="mb-7">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9683F] uppercase tracking-wide">
                            <FiTruck size={13} /> Emergency transport
                        </span>
                        <h1 className="text-[28px] font-serif font-semibold text-[#16332B] mt-2 leading-tight">
                            Book an ambulance
                        </h1>
                        <p className="text-[#6B6458] text-sm mt-1.5">
                            Find a nearby driver and dispatch help in minutes.
                        </p>
                    </div>

                    {/* Emergency banner — kept high-visibility red as a safety convention */}
                    <a
                        href="tel:108"
                        className="flex items-center gap-4 bg-[#B3261E] rounded-2xl p-5 text-white mb-7 hover:bg-[#9E211A] transition group"
                    >
                        <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                            <FiPhoneCall size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold leading-tight">Life-threatening emergency?</p>
                            <p className="text-white/80 text-sm mt-0.5">Call 108 directly — don't wait for booking</p>
                        </div>
                        <span className="shrink-0 bg-white text-[#B3261E] font-semibold px-4 py-2 rounded-full text-sm group-hover:bg-white/90 transition">
                            Call 108
                        </span>
                    </a>

                    {/* Search */}
                    <div className="relative mb-4">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8478]" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by driver or vehicle number"
                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#E7E2D6] bg-white focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 focus:border-[#16332B] text-sm placeholder:text-[#A8A192] transition"
                        />
                    </div>

                    {/* Zone tabs */}
                    <div className="flex gap-2 mb-7">
                        {zones.map((zone) => (
                            <button
                                key={zone}
                                onClick={() => setActiveZone(zone)}
                                className={`flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-medium transition ${
                                    activeZone === zone
                                        ? "bg-[#16332B] text-white"
                                        : "bg-white border border-[#E7E2D6] text-[#6B6458] hover:border-[#16332B]/30"
                                }`}
                            >
                                <FiMapPin size={13} />
                                {zone}
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 bg-[#FBEAE5] border border-[#E8B8AA] rounded-2xl p-4 flex items-center justify-between gap-3">
                            <p className="text-[#9E3A20] text-sm">{error}</p>
                            <button
                                onClick={loadAmbulances}
                                className="text-[#9E3A20] text-sm font-semibold shrink-0 hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <AmbulanceCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Results */}
                    {!loading && hasResults && (
                        <div className="space-y-7">
                            {Object.entries(grouped).map(([type, list]) => {
                                const meta = getTypeMeta(type);
                                return (
                                    <section key={type}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[10px] font-bold tracking-wider text-white bg-[#16332B] rounded px-1.5 py-0.5">
                                                    {meta.tag}
                                                </span>
                                                <h2 className="font-semibold text-[#16332B] text-[15px]">
                                                    {type}
                                                </h2>
                                            </div>
                                            <span className="text-xs text-[#A8A192]">{list.length} available</span>
                                        </div>

                                        <div className="space-y-3">
                                            {list.map((amb) => (
                                                <div
                                                    key={amb.id}
                                                    className="bg-white rounded-2xl border border-[#E7E2D6] p-4 flex items-center gap-4 hover:border-[#16332B]/25 hover:shadow-sm transition"
                                                >
                                                    <div className="w-16 h-16 rounded-xl bg-[#F8F6F0] border border-[#E7E2D6] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                                                        {amb.image ? (
                                                            <img
                                                                src={amb.image}
                                                                alt={amb.driverName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            "🚑"
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-[#16332B] text-sm truncate">
                                                            {amb.driverName || "Driver"}
                                                        </p>
                                                        <p className="text-xs text-[#8B8478] mt-1">
                                                            {amb.distance ?? "1.2"} km away
                                                            {amb.vehicleNumber ? ` · ${amb.vehicleNumber}` : ""}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                            <span className="w-1.5 h-1.5 bg-[#3F8A5C] rounded-full" />
                                                            <span className="text-xs text-[#3F8A5C] font-medium">
                                                                Available now
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        disabled={amb.isAvailable === false}
                                                        onClick={() => goToBooking(amb)}
                                                        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                                                            amb.isAvailable === false
                                                                ? "bg-[#E7E2D6] text-[#A8A192] cursor-not-allowed"
                                                                : "bg-[#C9683F] hover:bg-[#B85A33] text-white"
                                                        }`}
                                                    >
                                                        {amb.isAvailable === false ? "Already booked" : "Book"}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !hasResults && !error && (
                        <div className="bg-white rounded-2xl border border-[#E7E2D6] py-16 px-6 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-[#F8F6F0] flex items-center justify-center text-3xl">
                                🚑
                            </div>
                            <h2 className="text-[#16332B] font-semibold mt-5">
                                {search ? "No matches found" : "No ambulances nearby"}
                            </h2>
                            <p className="text-[#8B8478] text-sm mt-2 max-w-xs mx-auto">
                                {search
                                    ? "Try a different name or vehicle number."
                                    : "Try a different zone, or call 108 for an immediate dispatch."}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}