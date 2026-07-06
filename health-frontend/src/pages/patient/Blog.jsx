import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Calendar,
    Clock,
    ArrowRight,
    Heart,
    Stethoscope,
    Activity,
    Apple,
    Baby,
    Brain,
} from "lucide-react";
import api from "../../api/axios";

// Icon per category — falls back to Heart if a category doesn't match.
const CATEGORY_META = {
    "Heart Health": { icon: Heart, color: "#9E211A" },
    "General Wellness": { icon: Activity, color: "#3E7C59" },
    Nutrition: { icon: Apple, color: "#B5562C" },
    "Child Health": { icon: Baby, color: "#3E7C59" },
    "Mental Health": { icon: Brain, color: "#6B5B95" },
    "Doctor's Advice": { icon: Stethoscope, color: "#16332B" },
};

function getCategoryMeta(category) {
    return CATEGORY_META[category] || { icon: Heart, color: "#3E7C59" };
}

function BlogCardSkeleton() {
    return (
        <div className="bg-white rounded-[20px] border border-[#E4DFD3] overflow-hidden animate-pulse">
            <div className="h-40 bg-[#EFEAE0]" />
            <div className="p-5 space-y-3">
                <div className="h-3 bg-[#EFEAE0] rounded-full w-20" />
                <div className="h-4 bg-[#EFEAE0] rounded-full w-full" />
                <div className="h-3 bg-[#EFEAE0] rounded-full w-3/4" />
            </div>
        </div>
    );
}

export default function Blog() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/patient/blogs");
            setPosts(res.data || []);
        } catch (err) {
            setError("Unable to load articles right now.");
        } finally {
            setLoading(false);
        }
    }

    const categories = useMemo(() => {
        const set = new Set(posts.map((p) => p.category).filter(Boolean));
        return ["All", ...Array.from(set)];
    }, [posts]);

    const filtered = posts.filter((p) => {
        const matchCategory = activeCategory === "All" || p.category === activeCategory;
        const matchSearch =
            !search ||
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.excerpt?.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    const featured = filtered[0];
    const rest = filtered.slice(1);

    return (
        <div
            className="min-h-screen bg-[#FAF8F3] text-[#16332B]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            <div
    className="w-full mx-auto"
    style={{
        maxWidth: "1500px",
        padding: "48px 40px",
    }}
>

                {/* ── Header ── */}
                <div className="mb-12 max-w-xl">
                    <p className="text-[13px] uppercase tracking-[0.22em] text-[#B5562C] font-semibold mb-5">
                        Health & wellness
                    </p>
                    <h1
                        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                        className="leading-[1.05] tracking-tight"
                    >
                        <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)" }}>
                            Stories worth
                        </span>
                        <br />
                        <span
                            className="italic text-[#3E7C59]"
                            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)" }}
                        >
                            your attention.
                        </span>
                    </h1>
                    <p className="mt-5 text-[16px] leading-7 text-[#16332B]/60">
                        Practical guidance from our doctors — on prevention, recovery, and
                        everyday habits that keep you well.
                    </p>
                </div>

                {/* ── Search + Categories ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="relative max-w-md w-full">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#16332B]/35"
                            size={16}
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search articles"
                            className="w-full h-12 pl-11 pr-4 rounded-full border border-[#E4DFD3] bg-white focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 text-sm placeholder:text-[#16332B]/35 transition"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium border transition ${activeCategory === cat
                                    ? "bg-[#16332B] border-[#16332B] text-white"
                                    : "bg-white border-[#E4DFD3] text-[#16332B]/60 hover:border-[#16332B]/25"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-8 bg-[#FBEAE5] border border-[#E8B8AA] rounded-2xl p-4 flex items-center justify-between gap-3">
                        <p className="text-[#9E3A20] text-sm">{error}</p>
                        <button
                            onClick={loadPosts}
                            className="text-[#9E3A20] text-sm font-semibold shrink-0 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Loading ── */}
                {loading && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <BlogCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* ── Featured + Grid ── */}
                {!loading && filtered.length > 0 && (
                    <>
                        {/* Featured post */}
                        <button
                            onClick={() => navigate(`/patient/blog/${featured.id}`)}
                            className="w-full text-left bg-white rounded-[24px] border border-[#E4DFD3] overflow-hidden mb-8 grid md:grid-cols-2 hover:border-[#16332B]/25 hover:shadow-[0_15px_35px_-22px_rgba(22,51,43,0.25)] transition-all"
                        >
                            <div className="h-56 md:h-full bg-[#EFEAE0] overflow-hidden">
                                {featured.image ? (
                                    <img
                                        src={`http://localhost:5008${featured.image}`}
                                        alt={featured.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {(() => {
                                            const { icon: Icon, color } = getCategoryMeta(featured.category);
                                            return <Icon size={40} strokeWidth={1.5} style={{ color }} />;
                                        })()}
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex flex-col justify-center">
                                <span className="text-[12px] font-semibold uppercase tracking-wide text-[#B5562C] mb-3">
                                    {featured.category || "Wellness"}
                                </span>
                                <h2
                                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                    className="text-[1.5rem] leading-tight mb-3"
                                >
                                    {featured.title}
                                </h2>
                                <p className="text-[14px] text-[#16332B]/55 leading-6 mb-5 line-clamp-3">
                                    {featured.excerpt}
                                </p>
                                <div className="flex items-center gap-4 text-[12px] text-[#16332B]/45 mb-5">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={13} />
                                        {featured.publishedAt
                                            ? new Date(featured.publishedAt).toLocaleDateString()
                                            : "—"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={13} />
                                        {featured.readTimeMinutes || 5} min read
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-2 text-[#16332B] font-semibold text-sm">
                                    Read article <ArrowRight size={14} />
                                </span>
                            </div>
                        </button>

                        {/* Rest of the posts */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {rest.map((post) => {
                                const { icon: Icon, color } = getCategoryMeta(post.category);
                                return (
                                    <button
                                        key={post.id}
                                        onClick={() => navigate(`/patient/blog/${post.id}`)}
                                        className="text-left bg-white rounded-[20px] border border-[#E4DFD3] overflow-hidden hover:border-[#16332B]/25 hover:shadow-[0_15px_35px_-22px_rgba(22,51,43,0.25)] transition-all"
                                    >
                                        <div className="h-40 bg-[#EFEAE0] overflow-hidden">
                                            {post.image ? (
                                                <img
                                                    src={`http://localhost:5008${post.image}`}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Icon size={30} strokeWidth={1.5} style={{ color }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <span
                                                className="text-[11px] font-semibold uppercase tracking-wide mb-2 inline-block"
                                                style={{ color }}
                                            >
                                                {post.category || "Wellness"}
                                            </span>
                                            <h3
                                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                                className="text-[15px] leading-snug mb-2 line-clamp-2"
                                            >
                                                {post.title}
                                            </h3>
                                            <p className="text-[13px] text-[#16332B]/50 leading-5 mb-4 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center gap-3 text-[11px] text-[#16332B]/40">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {post.publishedAt
                                                        ? new Date(post.publishedAt).toLocaleDateString()
                                                        : "—"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {post.readTimeMinutes || 5} min
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ── Empty state ── */}
                {!loading && filtered.length === 0 && !error && (
                    <div className="bg-white rounded-[24px] border border-[#E4DFD3] py-20 px-6 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F3] flex items-center justify-center">
                            <Search size={22} className="text-[#16332B]/35" strokeWidth={1.5} />
                        </div>
                        <h2
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.3rem] mt-6"
                        >
                            No articles found
                        </h2>
                        <p className="text-[#16332B]/55 text-[14px] mt-2 max-w-xs mx-auto">
                            Try a different search term or category.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}