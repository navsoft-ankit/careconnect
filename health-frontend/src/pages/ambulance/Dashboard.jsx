import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

// Same hex palette as patient-side Ambulance.jsx — no tailwind.config tokens needed
const COLORS = {
  bg: "#F8F6F0",
  forest: "#16332B",
  forestDark: "#0F241D",
  terracotta: "#C9683F",
  terracottaDark: "#B85A33",
  border: "#E7E2D6",
  textMuted: "#6B6458",
  textFaint: "#8B8478",
  green: "#3F8A5C",
  red: "#B3261E",
  redBg: "#FBEAE5",
  redText: "#9E3A20",
};

const API_BASE = "/api/Ambulance";

function authConfig() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function AmbulanceDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequests();
    // poll every 15s so new requests show up without manual refresh
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests`, authConfig());
      setRequests(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not load ride requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, status) => {
    setUpdatingId(requestId);
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
    try {
      await axios.put(
        `${API_BASE}/request-status`,
        { requestId, status },
        authConfig()
      );
      const messages = {
        Accepted: "Ride accepted",
        Rejected: "Ride rejected",
        Cancelled: "Ride cancelled",
        Completed: "Marked completed",
      };
      toast.success(messages[status] || "Updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not update ride. Reverting.");
      fetchRequests();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        r.pickupLocation?.toLowerCase().includes(search.toLowerCase()) ||
        r.destinationLocation?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "Pending").length,
      accepted: requests.filter((r) => r.status === "Accepted").length,
      completed: requests.filter((r) => r.status === "Completed").length,
    }),
    [requests]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-5xl mx-auto px-6 py-10 pb-16">
          <header>
            <h1 className="text-[28px] font-serif font-semibold" style={{ color: COLORS.forest }}>
              Ambulance Dashboard
            </h1>
            <p className="text-sm mt-1.5" style={{ color: COLORS.textMuted }}>
              View ride requests, pickup/drop locations, and manage bookings
            </p>
          </header>

          {error && (
            <div
              className="mt-4 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: COLORS.redBg, color: COLORS.redText, border: `1px solid #E8B8AA` }}
            >
              {error}
            </div>
          )}

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-3 mt-7">
            <StatCard label="Pending" value={counts.pending} />
            <StatCard label="Accepted" value={counts.accepted} />
            <StatCard label="Completed" value={counts.completed} />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mt-7 mb-4">
            <input
              type="text"
              placeholder="Search by patient name, pickup or drop location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] h-12 px-4 rounded-xl text-sm focus:outline-none"
              style={{ border: `1px solid ${COLORS.border}`, backgroundColor: "white" }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 px-4 rounded-xl text-sm"
              style={{ border: `1px solid ${COLORS.border}`, backgroundColor: "white", color: COLORS.forest }}
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {filteredRequests.length === 0 ? (
            <EmptyState
              title="No ride requests here"
              message="When patients book an ambulance with you, requests will show up in this list."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredRequests.map((r) => (
                <RideCard
                  key={r.id}
                  ride={r}
                  onStatusChange={handleStatusChange}
                  isUpdating={updatingId === r.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl px-4 py-4 text-center" style={{ backgroundColor: "white", border: `1px solid ${COLORS.border}` }}>
      <div className="text-2xl font-bold" style={{ color: COLORS.forest }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: COLORS.textFaint }}>{label}</div>
    </div>
  );
}

const STATUS_STYLES = {
  Pending: { bg: "#FFF4E0", text: "#B3791E" },
  Accepted: { bg: "#E9F2EC", text: "#2F6B47" },
  Completed: { bg: "#E7E7F5", text: "#4B4B9C" },
  Rejected: { bg: "#FBEAE5", text: "#9E3A20" },
  Cancelled: { bg: "#F1EDE3", text: "#6B6458" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "#F1EDE3", text: "#6B6458" };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function RideCard({ ride, onStatusChange, isUpdating }) {
  const mapsUrl = (lat, lng) =>
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="rounded-2xl px-5 py-4 flex flex-col gap-3" style={{ backgroundColor: "white", border: `1px solid ${COLORS.border}` }}>
      {/* Top row */}
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div className="flex flex-col">
          <strong className="text-sm" style={{ color: COLORS.forest }}>{ride.patientName}</strong>
          <span className="text-xs" style={{ color: COLORS.textFaint }}>{ride.patientEmail}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F1EDE3", color: COLORS.textMuted }}>
            {ride.vehicleType}
          </span>
          <StatusBadge status={ride.status} />
        </div>
      </div>

      {/* Route */}
      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-start gap-2">
          <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.forest }} />
          <a
            href={mapsUrl(ride.pickupLat, ride.pickupLng)}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
            style={{ color: COLORS.textMuted }}
          >
            {ride.pickupLocation}
          </a>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.terracotta }} />
          <a
            href={mapsUrl(ride.destinationLat, ride.destinationLng)}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
            style={{ color: COLORS.textMuted }}
          >
            {ride.destinationLocation}
          </a>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-4 text-xs pt-3" style={{ color: COLORS.textFaint, borderTop: `1px solid ${COLORS.border}` }}>
        <span>Requested {formatDateTime(ride.requestTime)}</span>
        <span>{ride.distanceKm?.toFixed(1)} km</span>
        <span className="font-semibold" style={{ color: COLORS.forest }}>
          ₹{ride.fare?.toFixed(0)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {ride.status === "Pending" && (
          <>
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(ride.id, "Accepted")}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: COLORS.forest }}
            >
              Accept
            </button>
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(ride.id, "Rejected")}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ border: `1px solid ${COLORS.terracotta}`, color: COLORS.terracotta, backgroundColor: "white" }}
            >
              Reject
            </button>
          </>
        )}
        {ride.status === "Accepted" && (
          <>
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(ride.id, "Completed")}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: COLORS.forest }}
            >
              Mark completed
            </button>
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(ride.id, "Cancelled")}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ border: `1px solid ${COLORS.terracotta}`, color: COLORS.terracotta, backgroundColor: "white" }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="text-center px-5 py-16 rounded-2xl" style={{ backgroundColor: "white", border: `1px solid ${COLORS.border}` }}>
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: COLORS.bg }}>
        🚑
      </div>
      <h4 className="text-sm font-semibold mt-5" style={{ color: COLORS.forest }}>{title}</h4>
      <p className="text-xs mt-2" style={{ color: COLORS.textFaint }}>{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-9 w-64 rounded-lg mb-6" style={{ backgroundColor: COLORS.border }} />
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="h-20 rounded-2xl" style={{ backgroundColor: COLORS.border }} />
          <div className="h-20 rounded-2xl" style={{ backgroundColor: COLORS.border }} />
          <div className="h-20 rounded-2xl" style={{ backgroundColor: COLORS.border }} />
        </div>
        <div className="h-12 w-full rounded-xl mb-4" style={{ backgroundColor: COLORS.border }} />
        <div className="flex flex-col gap-3">
          <div className="h-36 w-full rounded-2xl" style={{ backgroundColor: COLORS.border }} />
          <div className="h-36 w-full rounded-2xl" style={{ backgroundColor: COLORS.border }} />
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}