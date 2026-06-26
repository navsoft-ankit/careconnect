import { useEffect, useState } from "react";
import api from "../../api/axios";

const AMBULANCE_TYPES = [
    { key: "basic", label: "Basic Life Support", icon: "🚑", color: "from-red-500 to-red-600" },
    { key: "advanced", label: "Advanced Life Support", icon: "🚨", color: "from-red-700 to-red-800" },
    { key: "neonatal", label: "Neonatal Care", icon: "👶", color: "from-rose-500 to-rose-600" },
];

function AmbulanceCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 animate-pulse">
            <div className="w-20 h-16 bg-gray-100 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
            <div className="w-20 h-9 bg-gray-100 rounded-full" />
        </div>
    );
}

export default function Ambulance() {
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState("Local");
    const [bookingId, setBookingId] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(null);
    const [error, setError] = useState("");

    const locationTabs = ["Local", "City", "District"];

    useEffect(() => {
        loadAmbulances();
    }, []);

    const loadAmbulances = async () => {
        setLoading(true);
        try {
            const res = await api.get("/patient/ambulances");
            setAmbulances(res.data || []);
        } catch (err) {
            console.log(err);
            setError("Unable to load ambulances. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (ambulanceId) => {
        setBookingLoading(ambulanceId);
        try {
            const res = await api.post("/patient/ambulance/book", { ambulanceId });
            setBookingId(res.data?.bookingId || ambulanceId);
        } catch (err) {
            console.log(err);
            alert(err?.response?.data || "Booking failed. Please try again.");
        } finally {
            setBookingLoading(null);
        }
    };

    // Group ambulances by type
    const grouped = ambulances.reduce((acc, a) => {
        const type = a.type || "Basic Life Support";
        if (!acc[type]) acc[type] = [];
        acc[type].push(a);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-500 text-xl">🚑</span>
                        <h1 className="text-2xl font-bold text-gray-900">Ambulance Booking</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Find and book the nearest ambulance for emergency care</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        placeholder="Search for Ambulance, Hospital..."
                        className="w-full h-12 pl-10 pr-5 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-200 text-sm shadow-sm"
                    />
                </div>

                {/* Location Tabs */}
                <div className="flex gap-2 mb-7">
                    {locationTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveType(tab)}
                            className={`flex-1 h-10 rounded-full text-sm font-semibold transition ${
                                activeType === tab
                                    ? "bg-red-500 text-white shadow-md shadow-red-200"
                                    : "bg-white border border-gray-200 text-gray-600 hover:border-red-200"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Booking success */}
                {bookingId && (
                    <div className="mb-5 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
                        <div>
                            <p className="font-semibold text-green-800 text-sm">Ambulance Booked!</p>
                            <p className="text-green-700 text-xs mt-0.5">Booking ID: #{bookingId} — Help is on the way</p>
                        </div>
                        <button onClick={() => setBookingId(null)} className="ml-auto text-green-600 text-xs underline">Dismiss</button>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-5 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-red-700 text-sm">{error}</p>
                        <button onClick={loadAmbulances} className="text-red-600 text-xs font-medium underline">Retry</button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => <AmbulanceCardSkeleton key={i} />)}
                    </div>
                )}

                {/* Grouped Ambulance Lists */}
                {!loading && ambulances.length > 0 && (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([type, list]) => (
                            <section key={type}>
                                {/* Section Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 bg-red-500 rounded-full" />
                                        <h2 className="font-bold text-gray-900 text-base">{type} Ambulance</h2>
                                    </div>
                                    <button className="text-red-500 text-sm font-medium">View all</button>
                                </div>

                                {/* Cards */}
                                <div className="space-y-3">
                                    {list.map((amb) => (
                                        <div
                                            key={amb.id}
                                            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition"
                                        >
                                            {/* Ambulance Image/Icon */}
                                            <div className="w-20 h-16 bg-red-50 rounded-xl flex items-center justify-center text-3xl shrink-0 border border-red-100">
                                                {amb.image ? (
                                                    <img src={amb.image} alt={amb.driverName} className="w-full h-full object-contain rounded-xl" />
                                                ) : (
                                                    "🚑"
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm truncate">
                                                    {amb.driverName || "Mr. Driver"}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {amb.distance || "1.2"} km away
                                                </p>
                                                {amb.vehicleNumber && (
                                                    <p className="text-xs text-gray-400 mt-0.5">{amb.vehicleNumber}</p>
                                                )}
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="text-xs text-green-600 font-medium">Available now</span>
                                                </div>
                                            </div>

                                            {/* Book Button */}
                                            <button
                                                onClick={() => handleBook(amb.id)}
                                                disabled={bookingLoading === amb.id}
                                                className="shrink-0 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
                                            >
                                                {bookingLoading === amb.id ? "..." : "Book"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {/* Fallback sample if API returns empty (for UI preview) */}
                {!loading && ambulances.length === 0 && !error && (
                    <div className="space-y-8">
                        {AMBULANCE_TYPES.map((type) => (
                            <section key={type.key}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 bg-red-500 rounded-full" />
                                        <h2 className="font-bold text-gray-900 text-base">{type.label}</h2>
                                    </div>
                                    <button className="text-red-500 text-sm font-medium">View all</button>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
                                    No ambulances available nearby
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {/* Emergency Banner */}
                <div className="mt-10 bg-red-500 rounded-3xl p-6 text-white flex items-center gap-4">
                    <div className="text-4xl">🆘</div>
                    <div className="flex-1">
                        <p className="font-bold text-lg">Need Urgent Help?</p>
                        <p className="text-red-100 text-sm mt-0.5">Call 108 for immediate emergency assistance</p>
                    </div>
                    <a
                        href="tel:108"
                        className="shrink-0 bg-white text-red-600 font-bold px-5 py-2.5 rounded-full text-sm hover:bg-red-50 transition"
                    >
                        Call 108
                    </a>
                </div>

            </div>
        </div>
    );
}