import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const STATUS_STYLES = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-600",
    Refunded: "bg-blue-100 text-blue-700",
};

const DELIVERY_STYLES = {
    "Free Shipping": "text-green-600",
    "Express": "text-blue-600",
    "Standard": "text-gray-500",
};

function Skeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-14 bg-gray-50 border-b border-gray-100" />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-40" />
                        <div className="h-2.5 bg-gray-100 rounded w-24" />
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
            ))}
        </div>
    );
}

const TABS = ["All", "Shipped", "Ready to Ship", "Sent", "Completed", "Cancellation", "Returns"];

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
        if (search.trim()) result = result.filter((o) => String(o.id).includes(search.trim()) || o.productName?.toLowerCase().includes(search.toLowerCase()));
        if (activeTab !== "All") result = result.filter((o) => o.deliveryStatus === activeTab);
        return result;
    }, [orders, search, activeTab]);

    const stats = useMemo(() => ({
        today: orders.filter((o) => new Date(o.orderDate).toDateString() === new Date().toDateString()).length,
        total: orders.length,
        returned: orders.filter((o) => o.deliveryStatus === "Returns").length,
        failed: orders.filter((o) => o.paymentStatus === "Failed").length,
        totalSpent: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
    }), [orders]);

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                        <p className="text-gray-500 text-sm mt-1">View all your medicine purchase history</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            ↑ Export
                        </button>
                        <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            ⋯ More actions
                        </button>
                        <a
                            href="/patient/products"
                            className="h-9 px-4 rounded-lg bg-[#16332B] text-white text-sm font-medium hover:bg-[#0F231D] flex items-center gap-2 transition"
                        >
                            + Create Order
                        </a>
                    </div>
                </div>

                {/* Stats Row */}
                {!loading && !errorMsg && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        {[
                            { label: "Today", value: stats.today, color: "text-gray-900" },
                            { label: "Total Orders", value: stats.total, color: "text-gray-900" },
                            { label: "Returns", value: stats.returned, color: "text-amber-600" },
                            { label: "Failed", value: stats.failed, color: "text-red-600" },
                            { label: "Total Spent", value: `₹${stats.totalSpent}`, color: "text-[#16332B]" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                                <p className="text-xs text-gray-500">{s.label}</p>
                                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {errorMsg && (
                    <div className="mb-5 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
                        <p className="text-red-700 text-sm">{errorMsg}</p>
                        <button onClick={loadOrders} className="text-red-600 text-xs font-medium underline">Retry</button>
                    </div>
                )}

                {/* Loading */}
                {loading && <Skeleton />}

                {/* Table */}
                {!loading && !errorMsg && orders.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex gap-0 border-b border-gray-100 overflow-x-auto scrollbar-none">
                            {TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                                        activeTab === tab
                                            ? "border-[#16332B] text-[#16332B]"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-50">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search orders..."
                                    className="h-9 pl-8 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 bg-gray-50 w-52"
                                />
                            </div>
                            <button className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                                ⊟ Filter
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="text-xs text-gray-500 border-b border-gray-50">
                                        <th className="px-5 py-3 font-medium w-8">
                                            <input type="checkbox" className="rounded" />
                                        </th>
                                        <th className="px-5 py-3 font-medium">Order</th>
                                        <th className="px-5 py-3 font-medium">Date</th>
                                        <th className="px-5 py-3 font-medium">Total</th>
                                        <th className="px-5 py-3 font-medium">Payment</th>
                                        <th className="px-5 py-3 font-medium">Items</th>
                                        <th className="px-5 py-3 font-medium">Delivery</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((o) => (
                                        <tr
                                            key={o.id}
                                            className="border-t border-gray-50 hover:bg-gray-50/60 cursor-pointer group"
                                        >
                                            <td className="px-5 py-4">
                                                <input type="checkbox" className="rounded" />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm shrink-0">
                                                        💊
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 group-hover:text-[#16332B]">
                                                            #{o.id}
                                                        </p>
                                                        {o.productName && (
                                                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{o.productName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-500 text-xs">
                                                {new Date(o.orderDate).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-gray-900">
                                                ₹{o.totalAmount}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                                                    {o.paymentStatus || "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-gray-500">
                                                {o.quantity || 1} item{o.quantity > 1 ? "s" : ""}
                                            </td>
                                            <td className={`px-5 py-4 text-xs font-medium ${DELIVERY_STYLES[o.deliveryMethod] || "text-gray-500"}`}>
                                                {o.deliveryMethod || "Free Shipping"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredOrders.length === 0 && (
                                <div className="py-14 text-center text-gray-400 text-sm">
                                    No orders match your search.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty */}
                {!loading && !errorMsg && orders.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                        <p className="text-4xl mb-3">📦</p>
                        <h3 className="font-bold text-lg text-gray-900">No orders yet</h3>
                        <p className="text-gray-500 mt-2 text-sm">Your medicine orders will show up here once you place one.</p>
                        <a
                            href="/patient/products"
                            className="inline-block mt-6 bg-[#16332B] text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-[#0F231D] transition"
                        >
                            Browse Pharmacy →
                        </a>
                    </div>
                )}

            </div>
        </div>
    );
}