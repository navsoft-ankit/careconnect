import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Tailwind tokens used (match tomar tailwind.config.js):
// bg-cream, text-forest, bg-forest, bg-terracotta, text-terracotta, border-terracotta

const API_BASE = "/api/Doctor"; // tomar controller route: api/[controller] -> api/Doctor

export default function DoctorDashboard() {
  const [tab, setTab] = useState("appointments"); // "appointments" | "availability"
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ from: "", to: "" });
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [apptRes, availRes] = await Promise.all([
        axios.get(`${API_BASE}/appointments`, config),
        axios.get(`${API_BASE}/availability`, config),
      ]);

      console.log("Appointments:", apptRes.data);
      console.log("Availability:", availRes.data);

      setAppointments(apptRes.data);
      setAvailability(availRes.data);

    } catch (err) {
      console.error(err);
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!form.from || !form.to) {
      toast.error("Pick both start and end time.");
      return;
    }

    if (new Date(form.to) <= new Date(form.from)) {
      toast.error("End time must be after start time.");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `${API_BASE}/availability`,
        {
          availableFrom: form.from,
          availableTo: form.to,
        },
        config
      );

      toast.success("Slot added");

      setForm({
        from: "",
        to: "",
      });

      const availRes = await axios.get(
        `${API_BASE}/availability`,
        config
      );

      setAvailability(availRes.data);

    } catch (err) {
      console.error(err);
      toast.error("Could not add slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );
    try {
      await axios.put(
        `${API_BASE}/appointment/status`,
        {
          appointmentId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Marked ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Status update failed, reverting.");
      fetchAll();
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch =
        a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        a.patientEmail?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const slotBookedCount = (availabilityId) =>
    appointments.filter((a) => a.doctorAvailabilityId === availabilityId)
      .length;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-forest">Doctor Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          View appointments + manage your availability
        </p>
      </header>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Tabs */}
      <nav className="flex gap-2 mt-6 border-b border-gray-200">
        <button
          onClick={() => setTab("appointments")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === "appointments"
              ? "text-forest border-terracotta"
              : "text-gray-500 border-transparent hover:text-forest"
            }`}
        >
          Appointments
          <span className="text-[11px] bg-cream text-forest px-2 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </button>
        <button
          onClick={() => setTab("availability")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === "availability"
              ? "text-forest border-terracotta"
              : "text-gray-500 border-transparent hover:text-forest"
            }`}
        >
          My Availability
          <span className="text-[11px] bg-cream text-forest px-2 py-0.5 rounded-full">
            {availability.length}
          </span>
        </button>
      </nav>

      {/* Appointments tab */}
      {tab === "appointments" && (
        <section className="mt-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by patient name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-white"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {filteredAppointments.length === 0 ? (
            <EmptyState
              title="No appointments here"
              message="When patients book a slot with you, they'll show up in this list."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredAppointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appt={a}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Availability tab */}
      {tab === "availability" && (
        <section className="mt-6 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
          <form onSubmit={handleAddSlot} className="space-y-4">

            <div>
              <label>From</label>
              <input
                type="datetime-local"
                value={form.from}
                onChange={(e) =>
                  setForm({ ...form, from: e.target.value })
                }
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label>To</label>
              <input
                type="datetime-local"
                value={form.to}
                onChange={(e) =>
                  setForm({ ...form, to: e.target.value })
                }
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleAddSlot}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
            >
              {submitting ? "Saving..." : "Save Availability"}
            </button>

          </form>

          <div>
            <h3 className="text-sm font-semibold text-forest mb-3">Your slots</h3>
            {availability.length === 0 ? (
              <EmptyState
                title="No slots yet"
                message="Add your first availability slot using the form."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex flex-col text-sm">
                      <strong className="text-gray-800">
                        {formatDateTime(slot.availableFrom)}
                      </strong>
                      <span className="text-xs text-gray-500">
                        to {formatDateTime(slot.availableTo)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-forest bg-cream px-2.5 py-1 rounded-full">
                      {slotBookedCount(slot.id)} booking
                      {slotBookedCount(slot.id) === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function AppointmentCard({ appt, onStatusChange }) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4">
      <div className="flex flex-col">
        <strong className="text-sm text-gray-800">{appt.patientName}</strong>
        <span className="text-xs text-gray-500">{appt.patientEmail}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>Booked {formatDateTime(appt.bookedAt)}</span>
        <StatusBadge status={appt.status} />
      </div>

      <div className="flex gap-2">
        {appt.status === "Pending" && (
          <>
            <button
              onClick={() => onStatusChange(appt.id, "Confirmed")}
              className="bg-forest text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:opacity-85 transition-opacity"
            >
              Confirm
            </button>
            <button
              onClick={() => onStatusChange(appt.id, "Cancelled")}
              className="border border-terracotta text-terracotta text-xs font-semibold px-3.5 py-2 rounded-lg hover:opacity-85 transition-opacity"
            >
              Decline
            </button>
          </>
        )}
        {appt.status === "Confirmed" && (
          <button
            onClick={() => onStatusChange(appt.id, "Completed")}
            className="bg-forest text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:opacity-85 transition-opacity"
          >
            Mark completed
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700",
    Confirmed: "bg-emerald-50 text-forest",
    Completed: "bg-indigo-50 text-indigo-700",
    Cancelled: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"
        }`}
    >
      {status}
    </span>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="text-center px-5 py-10 bg-cream rounded-xl">
      <h4 className="text-sm font-semibold text-forest mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-9 w-60 bg-cream rounded-lg mb-6" />
      <div className="h-9 w-full bg-cream rounded-lg mb-4" />
      <div className="flex flex-col gap-2.5">
        <div className="h-16 w-full bg-cream rounded-xl" />
        <div className="h-16 w-full bg-cream rounded-xl" />
        <div className="h-16 w-full bg-cream rounded-xl" />
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