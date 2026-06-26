import { useEffect, useState } from "react";
import api from "../../api/axios";

const STATUS_CONFIG = {
    Confirmed: { label: "Confirmed", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    CancelledByUser: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
    CancelledByDoctor: { label: "Cancelled by Doctor", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
    Pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
    Completed: { label: "Completed", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
};

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gray-100 rounded w-36" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                    <div className="h-3 bg-gray-100 rounded w-28" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
        </div>
    );
}

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [activeTab, setActiveTab] = useState("All");

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const res = await api.get("/patient/appointments");
            setAppointments(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        setCancellingId(id);
        try {
            await api.put(`/patient/appointment/cancel/${id}`);
            await loadAppointments();
        } catch (err) {
            console.log(err);
            alert(err?.response?.data || "Cancel failed");
        } finally {
            setCancellingId(null);
        }
    };

    const tabs = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];

    const filtered = activeTab === "All"
        ? appointments
        : appointments.filter((a) => {
            if (activeTab === "Cancelled") return a.status?.includes("Cancelled");
            return a.status === activeTab;
        });

    const stats = {
        total: appointments.length,
        confirmed: appointments.filter((a) => a.status === "Confirmed").length,
        completed: appointments.filter((a) => a.status === "Completed").length,
        totalPaid: appointments.reduce((s, a) => s + (a.advanceAmount || 0), 0),
    };

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        My Appointments
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage your doctor appointments</p>
                </div>

                {/* Stats */}
                {!loading && appointments.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                        {[
                            { label: "Total", value: stats.total },
                            { label: "Confirmed", value: stats.confirmed },
                            { label: "Completed", value: stats.completed },
                            { label: "Total Paid", value: `₹${stats.totalPaid}` },
                        ].map((s) => (
                            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                                <p className="text-xs text-gray-500">{s.label}</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-full border border-gray-100 p-1 mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                                activeTab === tab
                                    ? "bg-[#16332B] text-white"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Appointment Cards */}
                {!loading && filtered.length > 0 && (
                    <div className="space-y-3">
                        {filtered.map((a) => {
                            const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.Pending;
                            return (
                                <div
                                    key={a.id}
                                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Doctor Avatar */}
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16332B]/10 to-[#16332B]/5 flex items-center justify-center text-2xl shrink-0">
                                            👨‍⚕️
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-gray-900">
                                                    Doctor #{a.doctorId}
                                                </p>
                                                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-500">
                                                <span>📋 Slot #{a.doctorAvailabilityId}</span>
                                                <span>🕐 {new Date(a.bookedAt).toLocaleString("en-IN", {
                                                    day: "2-digit", month: "short", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit"
                                                })}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-xs">
                                                <span className="text-blue-600 font-medium">
                                                    {a.paymentStatus}
                                                </span>
                                                <span className="text-gray-500">
                                                    Advance: <span className="font-semibold text-gray-700">₹{a.advanceAmount}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="shrink-0">
                                            {a.status === "Confirmed" && (
                                                <button
                                                    onClick={() => cancelAppointment(a.id)}
                                                    disabled={cancellingId === a.id}
                                                    className="px-4 py-2 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                                                >
                                                    {cancellingId === a.id ? "Cancelling..." : "Cancel"}
                                                </button>
                                            )}
                                            {a.status === "Completed" && (
                                                <button className="px-4 py-2 rounded-full border border-[#16332B]/20 text-[#16332B] text-sm font-medium hover:bg-[#16332B]/5 transition">
                                                    Book Again
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                        <p className="text-4xl mb-3"></p>
                        <h3 className="font-bold text-lg text-gray-900">No appointments found</h3>
                        <p className="text-gray-500 mt-2 text-sm">
                            {activeTab !== "All" ? `No ${activeTab.toLowerCase()} appointments.` : "Book a doctor appointment to get started."}
                        </p>
                        <a
                            href="/patient/doctors"
                            className="inline-block mt-6 bg-[#16332B] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0F231D] transition"
                        >
                            Find a Doctor →
                        </a>
                    </div>
                )}

            </div>
        </div>
    );
}