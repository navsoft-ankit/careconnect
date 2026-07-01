import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Star, MapPin, Stethoscope, X, ChevronDown, ArrowRight } from "lucide-react";
import api from "../../api/axios";

const FILTERS = [
    "All", "Cardiology", "Neurology", "Orthopedic",
    "Dermatology", "Pediatrics", "General Medicine", "Dental",
];

const SORT_OPTIONS = [
    { value: "default", label: "Recommended" },
    { value: "fee_asc", label: "Lowest fee" },
    { value: "fee_desc", label: "Highest fee" },
    { value: "rating", label: "Top rated" },
    { value: "experience", label: "Most experienced" },
];

// Normalizes specialization strings so "Cardiology", "Cardiologist",
// "cardiology ", etc. are all treated as the same thing.
function normalizeSpecialization(value) {
    if (!value) return "";
    let s = value.trim().toLowerCase();
    s = s.replace(/ologist$/, "ology");
    s = s.replace(/pediatrician/, "pediatrics");
    s = s.replace(/paediatrician/, "pediatrics");
    s = s.replace(/paediatrics/, "pediatrics");
    return s;
}

// Some doctor names already include "Dr." — avoids "Dr. Dr. Ananya Sen".
function displayDoctorName(name) {
    if (!name) return "";
    return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}

function CardSkeleton() {
    return (
        <div className="bg-white rounded-[24px] overflow-hidden animate-pulse border border-[#E4DFD3]">
            <div className="h-60 bg-[#EFEAE0]" />
            <div className="p-5 space-y-3">
                <div className="h-4 bg-[#EFEAE0] rounded-full w-2/3" />
                <div className="h-3 bg-[#EFEAE0] rounded-full w-1/2" />
                <div className="h-10 bg-[#EFEAE0] rounded-full mt-3" />
            </div>
        </div>
    );
}

export default function Doctors() {
    const [searchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [activeFilter, setActiveFilter] = useState(searchParams.get("specialization") || "All");
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
        const normalizedActiveFilter = normalizeSpecialization(activeFilter);

        let list = doctors.filter((doc) => {
            const q = search.toLowerCase();
            const matchSearch =
                doc.name?.toLowerCase().includes(q) ||
                doc.specialization?.toLowerCase().includes(q) ||
                doc.hospitalName?.toLowerCase().includes(q);

            const matchFilter =
                activeFilter === "All" ||
                normalizeSpecialization(doc.specialization) === normalizedActiveFilter;

            return matchSearch && matchFilter;
        });

        if (sortBy === "fee_asc") list = [...list].sort((a, b) => (a.fee ?? 0) - (b.fee ?? 0));
        if (sortBy === "fee_desc") list = [...list].sort((a, b) => (b.fee ?? 0) - (a.fee ?? 0));
        if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating ?? 4.9) - (a.rating ?? 4.9));
        if (sortBy === "experience") list = [...list].sort((a, b) => parseInt(b.experience ?? 10) - parseInt(a.experience ?? 10));
        return list;
    }, [doctors, search, activeFilter, sortBy]);

    const availDot = (doc) => doc.availableToday ? "bg-[#3E7C59]" : "bg-[#16332B]/20";
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
        <div className="min-h-screen bg-[#FAF8F3] text-[#16332B]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-16">

                {/* ───────────────────── HEADER ───────────────────── */}
                <div className="mb-10">
                    <p className="text-[13px] uppercase tracking-[0.22em] text-[#3E7C59] font-semibold mb-5">
                        Healthcare professionals
                    </p>
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <h1
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="leading-[1.05] tracking-tight"
                        >
                            <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}>
                                Find a doctor
                            </span>
                            <br />
                            <span
                                className="italic text-[#B5562C]"
                                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
                            >
                                worth trusting.
                            </span>
                        </h1>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#16332B]/35" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Try 'cardiologist' or 'Dr. Smith'..."
                                    className="h-12 w-72 pl-11 pr-10 rounded-full border border-[#E4DFD3] bg-white focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 text-sm placeholder:text-[#16332B]/35"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16332B]/35 hover:text-[#16332B]/60"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowSort(!showSort)}
                                    className="h-12 px-5 rounded-full border border-[#E4DFD3] bg-white hover:border-[#16332B]/25 flex items-center gap-2 text-sm font-medium"
                                >
                                    <SlidersHorizontal size={14} />
                                    {sortLabel}
                                    <ChevronDown size={13} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
                                </button>
                                {showSort && (
                                    <div className="absolute right-0 top-14 bg-white border border-[#E4DFD3] rounded-2xl shadow-xl z-20 py-2 min-w-[180px]">
                                        {SORT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                                                className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#FAF8F3] transition ${sortBy === opt.value ? "font-semibold text-[#16332B]" : "text-[#16332B]/70"
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

                {/* ───────────────────── FILTER CHIPS ───────────────────── */}
                <div className="flex flex-wrap gap-2.5 mb-7">
                    {FILTERS.map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveFilter(item)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === item
                                ? "bg-[#16332B] text-white"
                                : "bg-white border border-[#E4DFD3] text-[#16332B]/65 hover:border-[#16332B]/30"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {!loading && (
                    <p className="text-sm text-[#16332B]/50 mb-6">
                        Showing <span className="font-semibold text-[#16332B]">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? "s" : ""}
                        {activeFilter !== "All" && (
                            <> in <span className="font-semibold text-[#16332B]">{activeFilter}</span></>
                        )}
                    </p>
                )}

                {/* ───────────────────── LOADING ───────────────────── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                )}

                {/* ───────────────────── DOCTOR CARDS ───────────────────── */}
                {!loading && filteredDoctors.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDoctors.map((doc) => (
                            <div
                                key={doc.id}
                                className="group bg-white rounded-[24px] overflow-hidden border border-[#E4DFD3] hover:border-[#16332B]/25 hover:shadow-[0_25px_50px_-25px_rgba(22,51,43,0.25)] transition-all duration-300 flex flex-col"
                            >
                                <div className="relative h-60 bg-gradient-to-b from-[#EFEAE0] to-[#E4DFD3] flex items-center justify-center overflow-hidden">
{doc.imageUrl ? (
    <img
        src={`http://localhost:5008${doc.imageUrl}`}
        alt={doc.name}
        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
    />
) : (
                                        <div
                                            className="w-24 h-24 rounded-full bg-[#16332B] text-white flex items-center justify-center font-medium shadow-lg"
                                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.5rem" }}
                                        >
                                            {doc.name?.charAt(0)?.toUpperCase() ?? "?"}
                                        </div>
                                    )}

                                    {doc.distance != null && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#16332B]/70 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <MapPin size={10} />
                                            {doc.distance} km
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h2
                                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                            className="text-[1.15rem] leading-snug"
                                        >
                                            {displayDoctorName(doc.name)}
                                        </h2>
                                        <span className="flex items-center gap-1.5 shrink-0 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${availDot(doc)}`} />
                                            <span className="text-xs text-[#16332B]/50 font-medium">{availLabel(doc)}</span>
                                        </span>
                                    </div>

                                    <p className="text-sm text-[#16332B]/55 mt-1">{doc.specialization}</p>

                                    {doc.hospitalName && (
                                        <p className="text-xs text-[#16332B]/40 mt-0.5 truncate">{doc.hospitalName}</p>
                                    )}

                                    <div className="flex items-center gap-4 mt-3.5 text-xs text-[#16332B]/55">
                                        <span className="flex items-center gap-1">
                                            <Stethoscope size={12} className="text-[#16332B]/35" />
                                            {doc.experience ?? "10+"}y exp
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={12} className="fill-[#B5562C] text-[#B5562C]" />
                                            <span className="font-semibold text-[#16332B]/75">{doc.rating ?? "4.9"}</span>
                                        </span>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        {doc.onlineAvailable !== false && (
                                            <span className="text-[11px] font-medium px-3 py-1 rounded-full border border-[#E4DFD3] text-[#16332B]/55">
                                                Online
                                            </span>
                                        )}
                                        {doc.inPersonAvailable !== false && (
                                            <span className="text-[11px] font-medium px-3 py-1 rounded-full border border-[#E4DFD3] text-[#16332B]/55">
                                                In-person
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1" />

                                    <div className="flex items-center justify-between mt-5">
                                        <div>
                                            <p className="text-[11px] text-[#16332B]/40 font-medium">Starting at</p>
                                            <p
                                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                                className="text-[1.5rem] leading-none mt-0.5"
                                            >
                                                ₹{doc.fee}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                (window.location.href = `/patient/bookdoctor?doctorId=${doc.id}`)
                                            }
                                            className="flex items-center gap-1.5 bg-[#16332B] hover:bg-[#0F231D] active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                                        >
                                            Book <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ───────────────────── EMPTY STATE ───────────────────── */}
                {!loading && filteredDoctors.length === 0 && (
                    <div className="mt-8 bg-white rounded-[24px] border border-[#E4DFD3] py-24 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF8F3] flex items-center justify-center mb-5">
                            <Stethoscope className="w-8 h-8 text-[#16332B]/35" />
                        </div>
                        <h2
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.4rem]"
                        >
                            No doctors found
                        </h2>
                        <p className="mt-2 text-[#16332B]/55 text-sm">Try adjusting your search or filter criteria.</p>
                        <button
                            onClick={() => { setSearch(""); setActiveFilter("All"); setSortBy("default"); }}
                            className="mt-7 bg-[#16332B] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#0F231D] transition"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

                {/* ───────────────────── BOTTOM CTA ───────────────────── */}
                <div className="mt-20 rounded-[28px] bg-[#16332B] text-[#FAF8F3] overflow-hidden">
                    <div className="px-10 lg:px-16 py-14 flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div>
                            <p className="text-[13px] uppercase tracking-[0.2em] text-[#FAF8F3]/45 font-semibold mb-4">
                                Need help?
                            </p>
                            <h2
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="text-[1.85rem] leading-tight"
                            >
                                Can't find the<br />right doctor?
                            </h2>
                            <p className="mt-4 text-[#FAF8F3]/65 max-w-md text-sm leading-relaxed">
                                Our support team will help you choose the best specialist
                                based on your symptoms and preferred location.
                            </p>
                        </div>
                        <button className="shrink-0 bg-[#FAF8F3] text-[#16332B] px-8 py-4 rounded-full font-semibold text-sm hover:bg-white transition">
                            Contact support →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}