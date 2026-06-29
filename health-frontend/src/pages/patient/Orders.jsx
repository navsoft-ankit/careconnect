import { useEffect, useMemo, useState } from "react";
import { Search, Package, Plus } from "lucide-react";
import api from "../../api/axios";

const PAYMENT_STYLES = {
    Paid: "bg-[#E9F2EC] text-[#2F6B47]",
    Pending: "bg-[#FFF4E0] text-[#B3791E]",
    Failed: "bg-[#FBEAE5] text-[#9E3A20]",
};

const STATUS_STYLES = {
    Pending: "bg-[#FFF4E0] text-[#B3791E]",
    Confirmed: "bg-[#E9F1FB] text-[#2A5C9E]",
    Delivered: "bg-[#E9F2EC] text-[#2F6B47]",
    Cancelled: "bg-[#FBEAE5] text-[#9E3A20]",
};

const TABS = ["All", "Pending", "Confirmed", "Delivered", "Cancelled"];

function Skeleton() {
    return (
        <div className="bg-white rounded-[20px] border border-[#E4DFD3] overflow-hidden animate-pulse">
            <div className="h-14 bg-[#FAF8F3] border-b border-[#E4DFD3]" />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#EFEAE0]">
                    <div className="w-10 h-10 bg-[#EFEAE0] rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-[#EFEAE0] rounded-full w-40" />
                        <div className="h-2.5 bg-[#EFEAE0] rounded-full w-24" />
                    </div>
                    <div className="h-3 bg-[#EFEAE0] rounded-full w-16" />
                    <div className="h-5 bg-[#EFEAE0] rounded-full w-16" />
                </div>
            ))}
        </div>
    );
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await api.get("/patient/orders");
            setOrders(res.data || []);
        } catch (err) {
            console.log(err);
            setErrorMsg("Couldn't load your orders right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        let result = orders;
        if (search.trim()) {
            result = result.filter(
                (o) =>
                    String(o.id).includes(search.trim()) ||
                    o.productName?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (activeTab !== "All") result = result.filter((o) => o.status === activeTab);
        return result;
    }, [orders, search, activeTab]);

    const stats = useMemo(
        () => ({
            today: orders.filter(
                (o) => new Date(o.orderDate).toDateString() === new Date().toDateString()
            ).length,
            total: orders.length,
            cancelled: orders.filter((o) => o.status === "Cancelled").length,
            failed: orders.filter((o) => o.paymentStatus === "Failed").length,
            totalSpent: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        }),
        [orders]
    );

    return (
        <div className="min-h-screen bg-[#FAF8F3] text-[#16332B]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-16">

                {/* ───────────────────── HEADER ───────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <p className="text-[13px] uppercase tracking-[0.22em] text-[#3E7C59] font-semibold mb-5">
                            Order history
                        </p>
                        <h1
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="leading-[1.05] tracking-tight"
                        >
                            <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}>
                                Everything you've
                            </span>
                            <br />
                            <span
                                className="italic text-[#B5562C]"
                                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
                            >
                                ordered, in one place.
                            </span>
                        </h1>
                    </div>

                    <a
                        href="/patient/products"
                        className="shrink-0 flex items-center gap-2 bg-[#16332B] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#0F231D] transition"
                    >
                        <Plus size={15} />
                        Order medicine
                    </a>
                </div>

                {/* ───────────────────── STATS STRIP ───────────────────── */}
                {!loading && !errorMsg && orders.length > 0 && (
                    <div className="border border-[#E4DFD3] bg-white rounded-[20px] mb-10 overflow-hidden">
                        <div className="grid grid-cols-2 md:grid-cols-5">
                            {[
                                { label: "Today", value: stats.today },
                                { label: "Total orders", value: stats.total },
                                { label: "Cancelled", value: stats.cancelled, tone: stats.cancelled > 0 ? "#9E3A20" : undefined },
                                { label: "Failed payments", value: stats.failed, tone: stats.failed > 0 ? "#B3791E" : undefined },
                                { label: "Total spent", value: `₹${stats.totalSpent}` },
                            ].map((s, i) => (
                                <div key={s.label} className={`p-5 ${i !== 0 ? "border-l border-[#E4DFD3]" : ""}`}>
                                    <p className="text-[12px] text-[#16332B]/50">{s.label}</p>
                                    <p
                                        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, color: s.tone }}
                                        className="text-[1.6rem] leading-none mt-2"
                                    >
                                        {s.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ───────────────────── ERROR ───────────────────── */}
                {errorMsg && (
                    <div className="mb-8 bg-[#FBEAE5] border border-[#E8B8AA] rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-[#9E3A20] text-sm">{errorMsg}</p>
                        <button onClick={loadOrders} className="text-[#9E3A20] text-xs font-semibold underline">Retry</button>
                    </div>
                )}

                {/* ───────────────────── LOADING ───────────────────── */}
                {loading && <Skeleton />}

                {/* ───────────────────── TABLE ───────────────────── */}
                {!loading && !errorMsg && orders.length > 0 && (
                    <div className="bg-white rounded-[20px] border border-[#E4DFD3] overflow-hidden">
                        {/* Tabs */}
                        <div className="flex gap-0 border-b border-[#E4DFD3] overflow-x-auto">
                            {TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${activeTab === tab
                                        ? "border-[#16332B] text-[#16332B]"
                                        : "border-transparent text-[#16332B]/50 hover:text-[#16332B]/75"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#EFEAE0]">
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#16332B]/35" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by order ID or medicine"
                                    className="h-9 pl-8 pr-4 rounded-lg border border-[#E4DFD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#16332B]/15 bg-[#FAF8F3] w-64"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="text-xs text-[#16332B]/50 border-b border-[#EFEAE0]">
                                        <th className="px-5 py-3 font-medium">Order</th>
                                        <th className="px-5 py-3 font-medium">Date</th>
                                        <th className="px-5 py-3 font-medium">Total</th>
                                        <th className="px-5 py-3 font-medium">Payment</th>
                                        <th className="px-5 py-3 font-medium">Quantity</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((o) => (
                                        <tr
                                            key={o.id}
                                            className="border-t border-[#EFEAE0] hover:bg-[#FAF8F3]/60 group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#FAF8F3] border border-[#E4DFD3] flex items-center justify-center shrink-0">
                                                        <Package size={15} className="text-[#16332B]/40" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#16332B] group-hover:text-[#0F231D]">
                                                            #{o.id}
                                                        </p>
                                                        {o.productName && (
                                                            <p className="text-xs text-[#16332B]/40 truncate max-w-[160px]">
                                                                {o.productName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[#16332B]/55 text-xs">
                                                {new Date(o.orderDate).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td
                                                className="px-5 py-4 font-semibold"
                                                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                                            >
                                                ₹{o.totalAmount}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        PAYMENT_STYLES[o.paymentStatus] || "bg-[#EFEAE0] text-[#16332B]/55"
                                                    }`}
                                                >
                                                    {o.paymentStatus || "—"}
                                                </span>
                                                <p className="text-[11px] text-[#16332B]/40 mt-1">
                                                    {o.paymentMode === "Online" ? "Paid online" : "Cash on delivery"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-[#16332B]/65">
                                                {/* "Quantity" rather than "items" — this is units of one
                                                    product per order, not a count of distinct line items. */}
                                                {o.quantity || 1} unit{o.quantity > 1 ? "s" : ""}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        STATUS_STYLES[o.status] || "bg-[#EFEAE0] text-[#16332B]/55"
                                                    }`}
                                                >
                                                    {o.status || "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredOrders.length === 0 && (
                                <div className="py-14 text-center text-[#16332B]/40 text-sm">
                                    No orders match your search.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ───────────────────── EMPTY STATE ───────────────────── */}
                {!loading && !errorMsg && orders.length === 0 && (
                    <div className="bg-white rounded-[24px] border border-[#E4DFD3] py-24 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF8F3] flex items-center justify-center mb-5">
                            <Package className="text-[#16332B]/35" size={26} strokeWidth={1.5} />
                        </div>
                        <h3
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.4rem]"
                        >
                            No orders yet
                        </h3>
                        <p className="text-[#16332B]/55 mt-2 text-sm">Your medicine orders will show up here once you place one.</p>
                        <a
                            href="/patient/products"
                            className="inline-block mt-7 bg-[#16332B] text-white px-7 py-3 rounded-full font-semibold text-sm hover:bg-[#0F231D] transition"
                        >
                            Browse pharmacy →
                        </a>
                    </div>
                )}

            </div>
        </div>
    );
}