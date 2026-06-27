import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
    FiSearch,
    FiRefreshCw,
    FiCalendar,
    FiClock,
    FiUser,
    FiX,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

import { toast, Toaster } from "react-hot-toast";

const STATUS_CONFIG = {
    Confirmed: {
        label: "Confirmed",
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
    },

    Pending: {
        label: "Pending",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-200",
    },

    Completed: {
        label: "Completed",
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
    },

    CancelledByUser: {
        label: "Cancelled",
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
    },

    CancelledByDoctor: {
        label: "Doctor Cancelled",
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-200",
    },
};

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AppointmentSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
            <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200" />

                <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-48" />

                    <div className="h-4 bg-gray-100 rounded w-36" />

                    <div className="h-4 bg-gray-100 rounded w-28" />

                    <div className="h-4 bg-gray-100 rounded w-32" />
                </div>
            </div>
        </div>
    );
}

function CancelModal({
    open,
    onClose,
    onConfirm,
    loading,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

            <div className="bg-white rounded-2xl w-full max-w-md p-6">

                <h2 className="text-xl font-bold">
                    Cancel Appointment
                </h2>

                <p className="text-gray-500 mt-3">
                    Are you sure you want to cancel this appointment?
                </p>

                <div className="flex justify-end gap-3 mt-8">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border"
                    >
                        No
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl"
                    >
                        {loading ? "Cancelling..." : "Yes Cancel"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [sortBy, setSortBy] = useState("Newest");

    const [page, setPage] = useState(1);

    const perPage = 5;

    const [refreshing, setRefreshing] = useState(false);

    const [cancelId, setCancelId] = useState(null);

    const [cancelLoading, setCancelLoading] = useState(false);

    const tabs = [
        "All",
        "Confirmed",
        "Pending",
        "Completed",
        "Cancelled",
    ];

    async function loadAppointments() {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/patient/appointments");

            setAppointments(res.data || []);
        } catch (err) {
            setError("Unable to load appointments.");
            toast.error("Failed to load appointments.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadAppointments();
    }, []);

    async function refreshAppointments() {
        setRefreshing(true);
        await loadAppointments();
    }

    async function cancelAppointment() {
        try {
            setCancelLoading(true);

            await api.put(
                `/patient/appointment/cancel/${cancelId}`
            );

            toast.success("Appointment cancelled.");

            setAppointments((prev) =>
                prev.map((item) =>
                    item.id === cancelId
                        ? {
                            ...item,
                            status: "CancelledByUser",
                        }
                        : item
                )
            );

            setCancelId(null);
        } catch {
            toast.error("Unable to cancel appointment.");
        } finally {
            setCancelLoading(false);
        }
    }

    const filteredAppointments = useMemo(() => {
        let data = [...appointments];

        if (search) {
            data = data.filter((item) =>
                (`Doctor ${item.doctorId}`)
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        if (statusFilter !== "All") {
            if (statusFilter === "Cancelled") {
                data = data.filter((x) =>
                    x.status.includes("Cancelled")
                );
            } else {
                data = data.filter(
                    (x) => x.status === statusFilter
                );
            }
        }

        if (sortBy === "Newest") {
            data.sort(
                (a, b) =>
                    new Date(b.bookedAt) -
                    new Date(a.bookedAt)
            );
        }

        if (sortBy === "Oldest") {
            data.sort(
                (a, b) =>
                    new Date(a.bookedAt) -
                    new Date(b.bookedAt)
            );
        }

        return data;
    }, [
        appointments,
        search,
        statusFilter,
        sortBy,
    ]);

    const totalPages = Math.ceil(
        filteredAppointments.length / perPage
    );

    const currentAppointments =
        filteredAppointments.slice(
            (page - 1) * perPage,
            page * perPage
        );

    const stats = {
        total: appointments.length,

        confirmed: appointments.filter(
            (x) => x.status === "Confirmed"
        ).length,

        completed: appointments.filter(
            (x) => x.status === "Completed"
        ).length,

        pending: appointments.filter(
            (x) => x.status === "Pending"
        ).length,

        totalPaid: appointments.reduce(
            (sum, x) => sum + (x.advanceAmount || 0),
            0
        ),
    };
    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-slate-50">

                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

                    {/* Header */}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

                        <div>

                            <h1 className="text-3xl font-bold text-slate-900">
                                My Appointments
                            </h1>

                            <p className="text-gray-500 mt-2">
                                View, manage and track your appointments.
                            </p>

                        </div>

                        <div className="flex gap-3">

                            <button
                                onClick={refreshAppointments}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl border bg-white hover:bg-gray-100 transition"
                            >
                                <FiRefreshCw
                                    className={`${refreshing ? "animate-spin" : ""}`}
                                />

                                Refresh
                            </button>

                            <a
                                href="/patient/doctors"
                                className="px-6 py-3 rounded-xl bg-[#16332B] hover:bg-[#0F241D] text-white font-medium transition"
                            >
                                + Book Appointment
                            </a>

                        </div>

                    </div>

                    {/* Statistics */}

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                        <div className="bg-white rounded-2xl p-5 shadow-sm border">

                            <p className="text-gray-500 text-sm">
                                Total
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                {stats.total}
                            </h2>

                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm border">

                            <p className="text-gray-500 text-sm">
                                Confirmed
                            </p>

                            <h2 className="text-3xl font-bold text-green-600 mt-2">
                                {stats.confirmed}
                            </h2>

                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm border">

                            <p className="text-gray-500 text-sm">
                                Pending
                            </p>

                            <h2 className="text-3xl font-bold text-yellow-500 mt-2">
                                {stats.pending}
                            </h2>

                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm border">

                            <p className="text-gray-500 text-sm">
                                Completed
                            </p>

                            <h2 className="text-3xl font-bold text-blue-600 mt-2">
                                {stats.completed}
                            </h2>

                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm border">

                            <p className="text-gray-500 text-sm">
                                Total Paid
                            </p>

                            <h2 className="text-3xl font-bold text-[#16332B] mt-2">
                                ₹{stats.totalPaid}
                            </h2>

                        </div>

                    </div>

                    {/* Search + Sort */}

                    <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">

                        <div className="flex flex-col lg:flex-row gap-4">

                            <div className="relative flex-1">

                                <FiSearch className="absolute left-4 top-4 text-gray-400" />

                                <input
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search doctor..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#16332B] outline-none"
                                />

                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-5 py-3 rounded-xl border"
                            >

                                <option>Newest</option>

                                <option>Oldest</option>

                            </select>

                        </div>

                    </div>

                    {/* Tabs */}

                    <div className="flex gap-3 overflow-x-auto pb-3 mb-8">

                        {tabs.map((tab) => (

                            <button
                                key={tab}
                                onClick={() => {
                                    setStatusFilter(tab);
                                    setPage(1);
                                }}
                                className={`px-5 py-3 rounded-full whitespace-nowrap font-medium transition

                ${statusFilter === tab
                                        ? "bg-[#16332B] text-white"
                                        : "bg-white border hover:bg-gray-100"
                                    }
                `}
                            >

                                {tab}

                            </button>

                        ))}

                    </div>

                    {/* Error */}

                    {error && (

                        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">

                            <h2 className="text-xl font-bold text-red-600">

                                {error}

                            </h2>

                            <button
                                onClick={loadAppointments}
                                className="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
                            >
                                Retry
                            </button>

                        </div>

                    )}

                    {/* Loading */}

                    {loading && (

                        <div className="space-y-5">

                            {[1, 2, 3, 4, 5].map((i) => (

                                <AppointmentSkeleton key={i} />

                            ))}

                        </div>

                    )}

                    {/* Cards Start */}

                    {!loading && currentAppointments.length > 0 && (

                        <div className="space-y-5">
                            {currentAppointments.map((appointment) => {
                                const status =
                                    STATUS_CONFIG[appointment.status] || STATUS_CONFIG.Pending;

                                return (
                                    <div
                                        key={appointment.id}
                                        className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="p-6">

                                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                                                {/* Doctor Image */}

                                                <div className="flex items-center gap-4">

                                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#16332B] to-[#1d4f43] text-white flex items-center justify-center text-3xl font-bold">
                                                        <FiUser />
                                                    </div>

                                                    <div>

                                                        <h2 className="text-xl font-bold text-slate-900">
                                                            Dr. #{appointment.doctorId}
                                                        </h2>

                                                        <p className="text-gray-500 mt-1">
                                                            General Physician
                                                        </p>

                                                        <div
                                                            className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.text} ${status.border}`}
                                                        >
                                                            {status.label}
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* Appointment Details */}

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                                                    <div>

                                                        <p className="text-gray-400 text-sm">
                                                            Appointment Date
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-2">

                                                            <FiCalendar className="text-[#16332B]" />

                                                            <span className="font-semibold">
                                                                {formatDate(appointment.bookedAt)}
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <div>

                                                        <p className="text-gray-400 text-sm">
                                                            Appointment Time
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-2">

                                                            <FiClock className="text-[#16332B]" />

                                                            <span className="font-semibold">
                                                                {formatTime(appointment.bookedAt)}
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <div>

                                                        <p className="text-gray-400 text-sm">
                                                            Payment Status
                                                        </p>

                                                        <span
                                                            className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-semibold

                ${appointment.paymentStatus === "Paid"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : appointment.paymentStatus === "Pending"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-red-100 text-red-700"
                                                                }
                `}
                                                        >
                                                            {appointment.paymentStatus}
                                                        </span>

                                                    </div>

                                                    <div>

                                                        <p className="text-gray-400 text-sm">
                                                            Advance Paid
                                                        </p>

                                                        <h3 className="mt-2 text-xl font-bold text-[#16332B]">
                                                            ₹{appointment.advanceAmount}
                                                        </h3>

                                                    </div>

                                                </div>

                                                {/* Actions */}

                                                <div className="flex flex-col gap-3 lg:w-56">

                                                    {appointment.status === "Confirmed" && (
                                                        <button
                                                            onClick={() => setCancelId(appointment.id)}
                                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition"
                                                        >
                                                            Cancel Appointment
                                                        </button>
                                                    )}

                                                    {appointment.status === "Completed" && (
                                                        <button
                                                            className="w-full bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                                        >
                                                            Book Again
                                                        </button>
                                                    )}

                                                    <button
                                                        className="w-full border border-gray-300 hover:bg-gray-50 py-3 rounded-xl font-medium transition"
                                                    >
                                                        View Details
                                                    </button>

                                                </div>

                                            </div>

                                            {/* Footer */}

                                            <div className="mt-6 pt-5 border-t flex flex-wrap justify-between gap-3 text-sm text-gray-500">

                                                <span>
                                                    Appointment ID :
                                                    <span className="font-semibold text-gray-700 ml-2">
                                                        #{appointment.id}
                                                    </span>
                                                </span>

                                                <span>
                                                    Slot :
                                                    <span className="font-semibold text-gray-700 ml-2">
                                                        #{appointment.doctorAvailabilityId}
                                                    </span>
                                                </span>

                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty State */}

                    {!loading && currentAppointments.length === 0 && (
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm py-20 px-6 text-center">

                            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-5xl">
                                📅
                            </div>

                            <h2 className="text-2xl font-bold mt-6 text-slate-900">
                                No Appointments Found
                            </h2>

                            <p className="text-gray-500 mt-3 max-w-md mx-auto">
                                We couldn't find any appointments matching your search or filter.
                            </p>

                            <a
                                href="/patient/doctors"
                                className="inline-flex mt-8 bg-[#16332B] hover:bg-[#0F241D] text-white px-7 py-3 rounded-xl font-semibold transition"
                            >
                                Book Appointment
                            </a>

                        </div>
                    )}

                    {/* Pagination */}

                    {!loading &&
                        totalPages > 1 &&
                        currentAppointments.length > 0 && (

                            <div className="flex items-center justify-center gap-3 mt-10">

                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((prev) => prev - 1)}
                                    className="w-11 h-11 rounded-xl border bg-white disabled:opacity-40 hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <FiChevronLeft />
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map((number) => (

                                    <button
                                        key={number}
                                        onClick={() => setPage(number)}
                                        className={`w-11 h-11 rounded-xl font-semibold transition

                    ${page === number
                                                ? "bg-[#16332B] text-white"
                                                : "bg-white border hover:bg-gray-100"
                                            }
                    `}
                                    >
                                        {number}
                                    </button>

                                ))}

                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((prev) => prev + 1)}
                                    className="w-11 h-11 rounded-xl border bg-white disabled:opacity-40 hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <FiChevronRight />
                                </button>

                            </div>

                        )}

                </div>

            </div>

            {/* Cancel Modal */}

            <CancelModal
                open={cancelId !== null}
                loading={cancelLoading}
                onClose={() => setCancelId(null)}
                onConfirm={cancelAppointment}
            />

        </>
    );
}

