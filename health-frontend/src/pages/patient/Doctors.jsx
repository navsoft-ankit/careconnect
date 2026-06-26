import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star, MapPin, Stethoscope, X, ChevronDown } from "lucide-react";
import api from "../../api/axios";

const FILTERS = [
    "All", "Cardiology", "Neurology", "Orthopedic",
    "Dermatology", "Pediatrics", "General Physician", "Dentist",
];

const SORT_OPTIONS = [
    { value: "default", label: "Recommended" },
    { value: "fee_asc", label: "Lowest Fee" },
    { value: "fee_desc", label: "Highest Fee" },
    { value: "rating", label: "Top Rated" },
    { value: "experience", label: "Most Experienced" },
];

/* ───── skeleton ───── */
function CardSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden animate-pulse shadow-sm">
            <div className="h-64 bg-gray-100" />
            <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                <div className="flex gap-2 pt-1">
                    <div className="h-6 bg-gray-100 rounded-full w-16" />
                    <div className="h-6 bg-gray-100 rounded-full w-20" />
                </div>
                <div className="h-11 bg-gray-100 rounded-full mt-2" />
            </div>
        </div>
    );
}

/* ───── main ───── */
export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortBy, setSortBy] = useState("default");
    const [showSort, setShowSort] = useState(false);

    useEffect(() => { loadDoctors(); }, []);

    const loadDoctors = async () => {
        try {
            const res = await api.get("/patient/doctors");
            setDoctors(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = useMemo(() => {
        let list = doctors.filter((doc) => {
            const q = search.toLowerCase();
            const matchSearch =
                doc.name?.toLowerCase().includes(q) ||
                doc.specialization?.toLowerCase().includes(q) ||
                doc.hospitalName?.toLowerCase().includes(q);
            const matchFilter =
                activeFilter === "All" || doc.specialization === activeFilter;
            return matchSearch && matchFilter;
        });

        if (sortBy === "fee_asc") list = [...list].sort((a, b) => (a.fee ?? 0) - (b.fee ?? 0));
        if (sortBy === "fee_desc") list = [...list].sort((a, b) => (b.fee ?? 0) - (a.fee ?? 0));
        if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating ?? 4.9) - (a.rating ?? 4.9));
        if (sortBy === "experience") list = [...list].sort((a, b) => parseInt(b.experience ?? 10) - parseInt(a.experience ?? 10));
        return list;
    }, [doctors, search, activeFilter, sortBy]);

    const availDot = (doc) => doc.availableToday ? "bg-emerald-400" : "bg-gray-300";
    const availLabel = (doc) => {
        if (doc.availableToday) return "Available";
        if (doc.nextAvailable) {
            const d = new Date(doc.nextAvailable);
            return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
        }
        return "Available";
    };

    const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? "Recommended";

    return (
        <div className="min-h-screen bg-[#F2F0EB]">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">

                {/* ── PAGE HEADER ── */}
                <div className="mb-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16332B] mb-2">
                        Healthcare Professionals
                    </p>
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                        <div>
                            <h1 className="text-[2.6rem] font-bold text-gray-900 leading-[1.15]">
                                Find Your Doctor
                            </h1>
                            <p className="text-gray-500 mt-2.5 text-[0.93rem] max-w-lg leading-relaxed">
                                Search by name, specialty, or location — we'll help you find the right care
                            </p>
                        </div>

                        {/* Search + Filter row */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Try 'cardiologist' or 'Dr. Smith'..."
                                    className="h-12 w-72 pl-11 pr-10 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#16332B]/25 text-sm shadow-sm placeholder:text-gray-400"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Sort dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSort(!showSort)}
                                    className="h-12 px-5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm"
                                >
                                    <SlidersHorizontal size={14} />
                                    {sortLabel}
                                    <ChevronDown size={13} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
                                </button>
                                {showSort && (
                                    <div className="absolute right-0 top-14 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 min-w-[180px]">
                                        {SORT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                                                className={`w-full text-left px-5 py-2.5 text-sm hover:bg-gray-50 transition ${sortBy === opt.value ? "font-semibold text-[#16332B]" : "text-gray-700"
                                                    }`}
                                            >
                                                {sortBy === opt.value && "✓ "}{opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FILTER CHIPS ── */}
                <div className="flex flex-wrap gap-2.5 mb-7">
                    {FILTERS.map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveFilter(item)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === item
                                    ? "bg-[#16332B] text-white shadow-md shadow-[#16332B]/20"
                                    : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Result count */}
                {!loading && (
                    <p className="text-sm text-gray-500 mb-6">
                        Showing <span className="font-semibold text-gray-800">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? "s" : ""}
                        {activeFilter !== "All" && (
                            <> in <span className="font-semibold text-gray-800">{activeFilter}</span></>
                        )}
                    </p>
                )}

                {/* ── LOADING SKELETON ── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                )}

                {/* ── DOCTOR CARDS GRID ── */}
                {!loading && filteredDoctors.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDoctors.map((doc) => (
                            <div
                                key={doc.id}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                {/* ── IMAGE ZONE ── */}
                                <div className="relative h-64 bg-gradient-to-b from-[#E8E5DF] to-[#D8D4CC] flex items-end justify-center overflow-hidden">
                                    {doc.profileImage ? (
                                        <img
                                            src={doc.profileImage}
                                            alt={doc.name}
                                            className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                                        />
                                    ) : (
                                        /* No-image fallback: big initials circle sitting at bottom of zone */
                                        <div className="mb-0 w-full h-full flex items-center justify-center">
                                            <div className="w-28 h-28 rounded-full bg-[#16332B] text-white flex items-center justify-center text-5xl font-bold shadow-lg">
                                                {doc.name?.charAt(0)?.toUpperCase() ?? "?"}
                                            </div>
                                        </div>
                                    )}

                                    {/* Distance pill — top right */}
                                    {doc.distance != null && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <MapPin size={10} />
                                            {doc.distance} km
                                        </div>
                                    )}
                                </div>

                                {/* ── CARD BODY ── */}
                                <div className="p-5 flex flex-col flex-1">

                                    {/* Name + availability */}
                                    <div className="flex items-start justify-between gap-2">
                                        <h2 className="font-bold text-gray-900 text-[1.05rem] leading-snug">
                                            {doc.name}
                                        </h2>
                                        <span className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                            <span className={`w-2 h-2 rounded-full ${availDot(doc)}`} />
                                            <span className="text-xs text-gray-500 font-medium">{availLabel(doc)}</span>
                                        </span>
                                    </div>

                                    {/* Specialization */}
                                    <p className="text-sm text-gray-500 mt-1">{doc.specialization}</p>

                                    {/* Hospital */}
                                    {doc.hospitalName && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.hospitalName}</p>
                                    )}

                                    {/* Stats: experience + rating */}
                                    <div className="flex items-center gap-4 mt-3.5 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Stethoscope size={12} className="text-gray-400" />
                                            <span>{doc.experience ?? "10+"}y exp</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold text-gray-700">{doc.rating ?? "4.9"}</span>
                                        </span>
                                    </div>

                                    {/* Mode chips */}
                                    <div className="flex gap-2 mt-3">
                                        {doc.onlineAvailable !== false && (
                                            <span className="text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 text-gray-600">
                                                Online
                                            </span>
                                        )}
                                        {doc.inPersonAvailable !== false && (
                                            <span className="text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 text-gray-600">
                                                In-Person
                                            </span>
                                        )}
                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1" />

                                    {/* Fee + Book button */}
                                    <div className="flex items-center justify-between mt-5">
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-medium">Starting at</p>
                                            <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5">
                                                ₹{doc.fee}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                (window.location.href = `/patient/bookdoctor?doctorId=${doc.id}`)
                                            }
                                            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 transition-all duration-150"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── EMPTY STATE ── */}
                {!loading && filteredDoctors.length === 0 && (
                    <div className="mt-8 bg-white rounded-3xl border border-gray-100 py-24 text-center shadow-sm">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
                            <Stethoscope className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">No Doctors Found</h2>
                        <p className="mt-2 text-gray-500 text-sm">Try adjusting your search or filter criteria.</p>
                        <button
                            onClick={() => { setSearch(""); setActiveFilter("All"); setSortBy("default"); }}
                            className="mt-7 bg-[#16332B] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#0F231D] transition shadow-md"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* ── BOTTOM CTA BANNER ── */}
                <div className="mt-20 rounded-[2rem] bg-[#16332B] text-white overflow-hidden">
                    <div className="px-10 lg:px-16 py-14 flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3">
                                Need Help?
                            </p>
                            <h2 className="text-[2rem] font-bold leading-tight">
                                Can't find the<br />right doctor?
                            </h2>
                            <p className="mt-4 text-gray-300 max-w-md text-sm leading-relaxed">
                                Our support team will help you choose the best specialist
                                based on your symptoms and preferred location.
                            </p>
                        </div>
                        <button className="shrink-0 bg-white text-[#16332B] px-8 py-4 rounded-2xl font-semibold text-sm hover:scale-105 active:scale-100 transition shadow-xl">
                            Contact Support →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}