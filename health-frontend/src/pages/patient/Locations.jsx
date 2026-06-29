import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Ambulance, Pill, Search, ArrowRight } from "lucide-react";
import api from "../../api/axios";

function CardSkeleton() {
    return (
        <div className="bg-white rounded-[24px] border border-[#E4DFD3] p-7 animate-pulse">
            <div className="h-4 bg-[#EFEAE0] rounded-full w-1/3 mb-6" />
            <div className="h-3 bg-[#EFEAE0] rounded-full w-full mb-2" />
            <div className="h-3 bg-[#EFEAE0] rounded-full w-2/3" />
        </div>
    );
}

export default function Locations() {
    const [coverage, setCoverage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadCoverage();
    }, []);

    const loadCoverage = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/patient/coverage");
            setCoverage(res.data || []);
        } catch (err) {
            console.error(err);
            setError("Couldn't load service coverage right now.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return coverage.filter((c) => c.city.toLowerCase().includes(q));
    }, [coverage, search]);

    const totalDoctors = useMemo(
        () => coverage.reduce((sum, c) => sum + c.doctorCount, 0),
        [coverage]
    );
    const totalAmbulances = useMemo(
        () => coverage.reduce((sum, c) => sum + c.availableAmbulances, 0),
        [coverage]
    );

    return (
        <div className="bg-[#FAF8F3] text-[#16332B] min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ───────────────────── HEADER ───────────────────── */}
            <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 pt-20 pb-10">
                <p className="text-[13px] uppercase tracking-[0.22em] text-[#3E7C59] font-semibold mb-5">
                    Where we operate
                </p>
                <h1
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                    className="leading-[1.05] tracking-tight max-w-2xl"
                >
                    <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)" }}>
                        One platform,
                    </span>
                    <br />
                    <span
                        className="italic text-[#B5562C]"
                        style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)" }}
                    >
                        growing city by city.
                    </span>
                </h1>
                <p className="mt-6 max-w-md text-[16px] leading-7 text-[#16332B]/60">
                    CareConnect isn't tied to one hospital — it's a network of
                    doctors, ambulances, and pharmacies that grows as we expand
                    into new areas. Here's what's live near you right now.
                </p>
            </section>

            {/* ───────────────────── PLATFORM TOTALS ───────────────────── */}
            {!loading && coverage.length > 0 && (
                <section className="border-y border-[#E4DFD3] bg-white">
                    <div className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32">
                        <div className="grid grid-cols-3">
                            <div className="py-9 px-2 lg:px-6">
                                <Stethoscope size={18} className="text-[#3E7C59]" strokeWidth={1.75} />
                                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }} className="text-[2rem] leading-none mt-3.5">
                                    {totalDoctors}+
                                </p>
                                <p className="text-[13px] text-[#16332B]/55 mt-1.5">Doctors on the network</p>
                            </div>
                            <div className="py-9 px-2 lg:px-6 border-l border-[#E4DFD3]">
                                <Ambulance size={18} className="text-[#B5562C]" strokeWidth={1.75} />
                                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }} className="text-[2rem] leading-none mt-3.5">
                                    {totalAmbulances}
                                </p>
                                <p className="text-[13px] text-[#16332B]/55 mt-1.5">Ambulances on standby</p>
                            </div>
                            <div className="py-9 px-2 lg:px-6 border-l border-[#E4DFD3]">
                                <Pill size={18} className="text-[#16332B]" strokeWidth={1.75} />
                                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }} className="text-[2rem] leading-none mt-3.5">
                                    {coverage.length}
                                </p>
                                <p className="text-[13px] text-[#16332B]/55 mt-1.5">Cities with delivery</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ───────────────────── SEARCH ───────────────────── */}
            <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 py-10">
                <div className="relative max-w-md">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#16332B]/35" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search your city..."
                        className="w-full h-12 pl-11 pr-4 rounded-full border border-[#E4DFD3] bg-white focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 text-sm placeholder:text-[#16332B]/35"
                    />
                </div>
            </section>

            {/* ───────────────────── ERROR ───────────────────── */}
            {error && (
                <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 pb-6">
                    <div className="bg-[#FBEAE5] border border-[#E8B8AA] rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-[#9E3A20] text-sm">{error}</p>
                        <button onClick={loadCoverage} className="text-[#9E3A20] text-sm font-semibold hover:underline">
                            Retry
                        </button>
                    </div>
                </section>
            )}

            {/* ───────────────────── CITY CARDS ───────────────────── */}
            <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 pb-24">
                {loading && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                )}

                {!loading && filtered.length === 0 && !error && (
                    <div className="bg-white border border-[#E4DFD3] rounded-[24px] py-20 text-center">
                        <h3 className="text-lg font-semibold">We're not in that city yet</h3>
                        <p className="mt-1.5 text-[#16332B]/55 text-sm max-w-sm mx-auto">
                            We're expanding steadily — check back soon, or browse doctors available for online consultation anywhere.
                        </p>
                        <Link
                            to="/patient/doctors"
                            className="inline-block mt-6 bg-[#16332B] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#0F231D] transition"
                        >
                            Browse all doctors
                        </Link>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filtered.map((c) => {
                            const isLive = c.doctorCount > 0 || c.availableAmbulances > 0;
                            return (
                                <div
                                    key={c.city}
                                    className="bg-white rounded-[24px] border border-[#E4DFD3] p-7 hover:border-[#16332B]/25 hover:shadow-[0_20px_40px_-25px_rgba(22,51,43,0.25)] transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <h3
                                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                            className="text-[1.5rem] leading-tight"
                                        >
                                            {c.city}
                                        </h3>
                                        <span
                                            className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full ${isLive ? "bg-[#E9F2EC] text-[#2F6B47]" : "bg-[#FAF8F3] text-[#16332B]/45"
                                                }`}
                                        >
                                            {isLive ? "Live now" : "Coming soon"}
                                        </span>
                                    </div>

                                    <div className="space-y-3.5">
                                        <div className="flex items-center justify-between text-[14px]">
                                            <span className="flex items-center gap-2 text-[#16332B]/65">
                                                <Stethoscope size={15} className="text-[#3E7C59]" />
                                                Doctors available
                                            </span>
                                            <span className="font-semibold">{c.doctorCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[14px]">
                                            <span className="flex items-center gap-2 text-[#16332B]/65">
                                                <Ambulance size={15} className="text-[#B5562C]" />
                                                Ambulances on standby
                                            </span>
                                            <span className="font-semibold">{c.availableAmbulances}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[14px]">
                                            <span className="flex items-center gap-2 text-[#16332B]/65">
                                                <Pill size={15} className="text-[#16332B]" />
                                                Medicine delivery
                                            </span>
                                            <span className="font-semibold">
                                                {c.medicineDeliveryAvailable ? "Available" : "Not yet"}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/patient/doctors?city=${encodeURIComponent(c.city)}`}
                                        className="inline-flex items-center gap-1.5 mt-6 text-[14px] font-semibold text-[#16332B] hover:gap-2.5 transition-all"
                                    >
                                        Browse {c.city}
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ───────────────────── CLOSING ───────────────────── */}
            <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 pb-20">
                <div className="rounded-[28px] bg-[#16332B] text-[#FAF8F3] px-10 lg:px-14 py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div>
                        <h2
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.65rem] leading-tight"
                        >
                            Don't see your city yet?
                        </h2>
                        <p className="mt-2.5 text-[#FAF8F3]/70 text-[14px] max-w-md">
                            Online consultations and medicine delivery work nationwide —
                            physical ambulance coverage is what we're expanding city by city.
                        </p>
                    </div>
                    <Link
                        to="/patient/doctors"
                        className="shrink-0 bg-[#FAF8F3] text-[#16332B] px-7 py-3.5 rounded-full font-semibold text-[14px] hover:bg-white transition whitespace-nowrap"
                    >
                        Browse all doctors →
                    </Link>
                </div>
            </section>
        </div>
    );
}