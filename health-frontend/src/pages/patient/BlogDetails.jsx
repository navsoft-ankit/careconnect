import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Tag,
    User,
    Heart,
    Stethoscope,
    Activity,
    Apple,
    Baby,
    Brain,
} from "lucide-react";

// Same category → icon/color map as the blog list page, kept in sync
// so a missing cover image falls back to a consistent visual.
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

function BlogDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-[#FAF8F3]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 py-16 max-w-[900px] mx-auto animate-pulse">
                <div className="h-4 bg-[#EFEAE0] rounded-full w-32 mb-10" />
                <div className="bg-white rounded-[24px] border border-[#E4DFD3] overflow-hidden">
                    <div className="h-[360px] bg-[#EFEAE0]" />
                    <div className="p-10 space-y-4">
                        <div className="h-3 bg-[#EFEAE0] rounded-full w-24" />
                        <div className="h-8 bg-[#EFEAE0] rounded-full w-3/4" />
                        <div className="h-4 bg-[#EFEAE0] rounded-full w-full" />
                        <div className="h-4 bg-[#EFEAE0] rounded-full w-5/6" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BlogDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadBlog();
        window.scrollTo(0, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadBlog() {
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/patient/blogs/${id}`);
            setBlog(res.data);
            setRelated(res.data.related || []);
        } catch (err) {
            setError(
                err?.response?.status === 404
                    ? "not-found"
                    : "This article couldn't be loaded right now."
            );
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <BlogDetailsSkeleton />;

    if (error === "not-found" || (!loading && !blog && !error)) {
        return (
            <div
                className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-8"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
                <div className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-white border border-[#E4DFD3] flex items-center justify-center">
                        <Tag size={22} className="text-[#16332B]/35" strokeWidth={1.5} />
                    </div>
                    <h2
                        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                        className="text-[1.4rem] text-[#16332B] mt-6"
                    >
                        Article not found
                    </h2>
                    <p className="text-[#16332B]/55 text-[14px] mt-2 max-w-xs mx-auto">
                        This article may have been removed or the link is incorrect.
                    </p>
                    <button
                        onClick={() => navigate("/patient/blog")}
                        className="mt-7 inline-flex items-center gap-2 bg-[#16332B] hover:bg-[#0F231D] text-white px-6 py-3 rounded-full font-medium text-sm transition"
                    >
                        <ArrowLeft size={15} /> Back to articles
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-8"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
                <div className="bg-[#FBEAE5] border border-[#E8B8AA] rounded-2xl p-6 text-center max-w-sm">
                    <p className="text-[#9E3A20] text-sm mb-4">{error}</p>
                    <button
                        onClick={loadBlog}
                        className="text-[#9E3A20] text-sm font-semibold hover:underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { icon: CategoryIcon, color: categoryColor } = getCategoryMeta(blog.category);

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

                {/* ── Back ── */}
                <button
                    onClick={() => navigate("/patient/blog")}
                    className="flex items-center gap-1.5 text-sm text-[#16332B]/55 hover:text-[#16332B] mb-8 transition"
                >
                    <ArrowLeft size={15} />
                    Back to articles
                </button>

                {/* ── Article ── */}
                <article className="bg-white rounded-[24px] border border-[#E4DFD3] overflow-hidden">
                    <div className="h-[280px] sm:h-[360px] bg-[#EFEAE0] overflow-hidden">
                        {blog.image ? (
                            <img
                                src={
                                    blog.image.startsWith("http")
                                        ? blog.image
                                        : `http://localhost:5008${blog.image}`
                                }
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <CategoryIcon size={48} strokeWidth={1.5} style={{ color: categoryColor }} />
                            </div>
                        )}
                    </div>

                    <div className="p-6 sm:p-10">
                        <span
                            className="inline-block text-[12px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-5"
                            style={{ background: "#EBF2E3", color: categoryColor }}
                        >
                            {blog.category || "Wellness"}
                        </span>

                        <h1
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.75rem] sm:text-[2.25rem] leading-tight mb-4"
                        >
                            {blog.title}
                        </h1>

                        {blog.excerpt && (
                            <p className="text-[16px] sm:text-[17px] text-[#16332B]/60 leading-8 mb-6">
                                {blog.excerpt}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#16332B]/45 pb-6 mb-8 border-b border-[#E4DFD3]">
                            {blog.authorName && (
                                <span className="flex items-center gap-1.5">
                                    <User size={14} />
                                    {blog.authorName}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {blog.publishedAt
                                    ? new Date(blog.publishedAt).toLocaleDateString(undefined, {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                    : "—"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {blog.readTimeMinutes || 5} min read
                            </span>
                        </div>

                        <div className="text-[16px] leading-8 text-[#16332B]/80 whitespace-pre-wrap">
                            {blog.content}
                        </div>
                    </div>
                </article>

                {/* ── Related articles ── */}
                {related.length > 0 && (
                    <div className="mt-14">
                        <h2
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.35rem] mb-6"
                        >
                            Related articles
                        </h2>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {related.map((item) => {
                                const { icon: Icon, color } = getCategoryMeta(item.category);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(`/patient/blog/${item.id}`)}
                                        className="text-left bg-white rounded-[20px] border border-[#E4DFD3] overflow-hidden hover:border-[#16332B]/25 hover:shadow-[0_15px_35px_-22px_rgba(22,51,43,0.25)] transition-all"
                                    >
                                        <div className="h-36 bg-[#EFEAE0] overflow-hidden">
                                            {item.image ? (
                                                <img
                                                    src={
                                                        item.image.startsWith("http")
                                                            ? item.image
                                                            : `http://localhost:5008${item.image}`
                                                    }
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Icon size={28} strokeWidth={1.5} style={{ color }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <span
                                                className="text-[11px] font-semibold uppercase tracking-wide mb-2 inline-block"
                                                style={{ color }}
                                            >
                                                {item.category || "Wellness"}
                                            </span>
                                            <h3
                                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                                className="text-[14.5px] leading-snug mb-2 line-clamp-2"
                                            >
                                                {item.title}
                                            </h3>
                                            <span className="flex items-center gap-1.5 text-[11px] text-[#16332B]/40">
                                                <Clock size={12} />
                                                {item.readTimeMinutes || 5} min read
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}