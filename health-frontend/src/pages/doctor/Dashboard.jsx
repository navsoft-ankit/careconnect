import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HeartPulse,
  Mail,
  Menu,
  Phone,
  PieChart,
  RefreshCw,
  Search,
  Stethoscope,
  TimerReset,
  TrendingDown,
  TrendingUp,
  UserCircle2,
  Users,
  X,
  XCircle,
  Eye,
  Edit3,
  ChevronRight,
} from "lucide-react";

/* ===========================
   API
=========================== */

const API = axios.create({
  baseURL: "http://localhost:5008/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===========================
   Constants
=========================== */

const STATUS_COLOR = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-green-100 text-green-700 border-green-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* ===========================
   Reusable Components
=========================== */

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-3xl p-6 border">
      <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-slate-200 rounded w-1/2 mb-5"></div>
      <div className="h-4 bg-slate-200 rounded"></div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  growth,
}) {
  return (
    <Card className="p-6 hover:shadow-xl transition-all">

      <div className="flex justify-between">

        <div>

          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>

          <div className="flex items-center gap-2 mt-4">

            {growth >= 0 ? (
              <TrendingUp className="text-green-600" size={18} />
            ) : (
              <TrendingDown className="text-red-600" size={18} />
            )}

            <span
              className={
                growth >= 0
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {Math.abs(growth)}%
            </span>

            <span className="text-slate-500 text-sm">
              this month
            </span>

          </div>

        </div>

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>

      </div>

    </Card>
  );
}

function AppointmentBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-semibold ${STATUS_COLOR[status] ||
        "bg-slate-100 text-slate-700 border-slate-200"
        }`}
    >
      {status}
    </span>
  );
}

function MiniBar({ value, max }) {
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
        style={{
          width: `${(value / max) * 100}%`,
        }}
      />
    </div>
  );
}

/* ===========================
   Main Component
=========================== */

export default function DoctorDashboard() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    earnings: 0,
  });
  /* ===========================
   Load Dashboard
=========================== */

  async function loadDashboard() {
    try {
      setLoading(true);

      const [
        profileRes,
        appointmentsRes,
        availabilityRes,
      ] = await Promise.all([
        API.get("/doctor/profile"),
        API.get("/doctor/appointments"),
        API.get("/doctor/availability"),
      ]);

      const doctorData = profileRes.data || {};
      const appointmentData = Array.isArray(appointmentsRes.data)
        ? appointmentsRes.data
        : [];
      const availabilityData = Array.isArray(availabilityRes.data)
        ? availabilityRes.data
        : [];
      setDoctor(doctorData);
      setAppointments(appointmentData);
      setAvailability(availabilityData);

      const completed = appointmentData.filter(
        (a) => a.status === "Completed"
      ).length;

      const pending = appointmentData.filter(
        (a) =>
          a.status === "Pending" ||
          a.status === "Confirmed"
      ).length;

      const cancelled = appointmentData.filter(
        (a) => a.status === "Cancelled"
      ).length;

      const today = new Date().toDateString();

      const todayAppointments = appointmentData.filter(
        (a) =>
          new Date(a.date).toDateString() === today
      ).length;

      const totalPatients = new Set(
        appointmentData.map(
          (a) => a.patientId || a.patientEmail
        )
      ).size;

      const earnings = appointmentData
        .filter((a) => a.status === "Completed")
        .reduce(
          (sum, a) =>
            sum + Number(a.amount || a.fee || 0),
          0
        );

      setStats({
        totalPatients,
        todayAppointments,
        completed,
        pending,
        cancelled,
        earnings,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ===========================
     Appointment Status
  =========================== */

  async function updateAppointmentStatus(
    appointmentId,
    status
  ) {
    try {
      await API.put("/doctor/appointment/status", {
        appointmentId,
        status,
      });

      toast.success("Appointment updated.");

      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId
            ? {
              ...item,
              status,
            }
            : item
        )
      );
      loadDashboard();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Unable to update appointment."
      );
    }
  }

  /* ===========================
     Availability
  =========================== */

  function toggleAvailability(day) {
    setAvailability((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
            ...item,
            available: !item.available,
          }
          : item
      )
    );
  }

  async function saveAvailability() {
    try {
      await API.post("/doctor/availability", {
        availableFrom,
        availableTo,
      });

      toast.success("Availability added.");

      loadDashboard();
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Failed to save availability.");
    }
  }

  /* ===========================
     Filters
  =========================== */

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {

      const matchesSearch =
        appointment.patientName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        appointment.email
          ?.toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "All"
          ? true
          : appointment.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [
    appointments,
    search,
    filterStatus,
  ]);

  const maxValue = Math.max(
    stats.completed,
    stats.pending,
    stats.cancelled,
    1
  );

  /* ===========================
     Loading Screen
  =========================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}

        </div>
        <div className="grid xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 h-[500px] rounded-3xl bg-white animate-pulse"></div>
          <div className="h-[500px] rounded-3xl bg-white animate-pulse"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Mobile Overlay */}

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed top-0 left-0 z-50
          w-72 h-screen
          bg-slate-900 text-white
          transition-transform duration-300
          ${drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}

          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                <HeartPulse size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Doctor Panel
                </h2>
                <p className="text-slate-400 text-sm">
                  Healthcare
                </p>
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden"
            >
              <X size={24} />
            </button>

          </div>

          {/* Doctor */}

          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <UserCircle2 size={42} />
              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  Dr. {doctor.fullName || "Doctor"}
                </h3>

                <p className="text-slate-400 text-sm">
                  {doctor.specialization || "Specialist"}
                </p>

              </div>

            </div>

          </div>

          {/* Navigation */}

          <nav className="flex-1 px-4 space-y-2">

            <button
              onClick={() => navigate("/doctor/dashboard")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-600"
            >
              <Activity size={18} />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/doctor/appointments")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-800 transition"
            >
              <Calendar size={18} />
              Appointments
            </button>

            <button
              onClick={() => navigate("/doctor/availability")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-800 transition"
            >
              <Clock3 size={18} />
              Availability
            </button>

            <button
              onClick={() => navigate("/doctor/profile")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-800 transition"
            >
              <UserCircle2 size={18} />
              Profile
            </button>

          </nav>

          {/* Refresh */}

          <div className="p-6 border-t border-slate-700">

            <button
              onClick={loadDashboard}
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 rounded-xl py-3 font-semibold hover:bg-slate-100"
            >
              <RefreshCw size={18} />
              Refresh Dashboard
            </button>

          </div>

        </div>

      </aside>

      {/* Main */}

      <main className="lg:ml-72 min-h-screen">

        {/* Header */}

        <header className="sticky top-0 bg-white border-b border-slate-200 z-20">

          <div className="flex justify-between items-center px-6 py-5">

            <div className="flex items-center gap-4">

              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden"
              >
                <Menu size={24} />
              </button>

              <div>

                <h1 className="text-3xl font-bold text-slate-800">
                  Welcome, Dr. {doctor.name}
                </h1>

                <p className="text-slate-500 mt-1">
                  Manage appointments and availability.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-5">

              <button className="relative">

                <Bell size={22} />

                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  3
                </span>

              </button>

              <div className="hidden md:flex items-center gap-3">

                <div className="text-right">

                  <h4 className="font-semibold">
                    Dr. {doctor.fullName}
                  </h4>

                  <p className="text-xs text-slate-500">
                    {doctor.specialization}
                  </p>

                </div>

                <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center">
                  <UserCircle2 />
                </div>

              </div>

            </div>

          </div>

        </header>

        <section className="p-6">

          {/* Statistics */}

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

            <StatCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              growth={12}
              color="bg-blue-100 text-blue-600"
              icon={<Calendar size={28} />}
            />

            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              growth={8}
              color="bg-green-100 text-green-600"
              icon={<Users size={28} />}
            />

            <StatCard
              title="Completed"
              value={stats.completed}
              growth={18}
              color="bg-cyan-100 text-cyan-600"
              icon={<BadgeCheck size={28} />}
            />

            <StatCard
              title="Pending"
              value={stats.pending}
              growth={-4}
              color="bg-orange-100 text-orange-600"
              icon={<Clock3 size={28} />}
            />

          </div>
          {/* Analytics + Profile */}

          <div className="grid xl:grid-cols-3 gap-6 mt-8">

            {/* Analytics */}

            <Card className="xl:col-span-2 p-6">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    Appointment Analytics
                  </h2>

                  <p className="text-sm text-slate-500">
                    Overall appointment performance
                  </p>

                </div>

                <PieChart className="text-blue-600" />

              </div>

              <div className="space-y-6">

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="font-medium">
                      Completed
                    </span>

                    <span className="font-bold">
                      {stats.completed}
                    </span>

                  </div>

                  <MiniBar
                    value={stats.completed}
                    max={maxValue}
                  />

                </div>

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="font-medium">
                      Pending
                    </span>

                    <span className="font-bold">
                      {stats.pending}
                    </span>

                  </div>

                  <MiniBar
                    value={stats.pending}
                    max={maxValue}
                  />

                </div>

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="font-medium">
                      Cancelled
                    </span>

                    <span className="font-bold">
                      {stats.cancelled}
                    </span>

                  </div>

                  <MiniBar
                    value={stats.cancelled}
                    max={maxValue}
                  />

                </div>

              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">

                <div className="rounded-2xl bg-blue-50 p-5 text-center">

                  <ClipboardList
                    className="mx-auto text-blue-600 mb-2"
                  />

                  <h3 className="text-2xl font-bold">
                    {appointments.length}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Total Appointments
                  </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <HeartPulse
                    className="mx-auto text-green-600 mb-2"
                  />

                  <h3 className="text-2xl font-bold">
                    ₹{stats.earnings}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Earnings
                  </p>

                </div>

                <div className="rounded-2xl bg-purple-50 p-5 text-center">

                  <CalendarDays
                    className="mx-auto text-purple-600 mb-2"
                  />

                  <h3 className="text-2xl font-bold">
                    {
                      availability.filter(
                        (a) => a.available
                      ).length
                    }
                  </h3>

                  <p className="text-sm text-slate-500">
                    Working Days
                  </p>

                </div>

              </div>

            </Card>

            {/* Doctor Profile */}

            <Card className="p-6">

              <div className="text-center">

                <div className="mx-auto w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">

                  <UserCircle2 size={70} />

                </div>

                <h2 className="text-2xl font-bold mt-4">
                  Dr. {doctor.fullName}
                </h2>

                <p className="text-slate-500">
                  {doctor.specialization}
                </p>

              </div>

              <div className="space-y-5 mt-8">

                <div className="flex items-center gap-3">

                  <Mail
                    className="text-blue-600"
                    size={18}
                  />

                  <span>{doctor.email}</span>

                </div>

                <div className="flex items-center gap-3">

                  <Phone
                    className="text-green-600"
                    size={18}
                  />

                  <span>{doctor.phone}</span>

                </div>

                <div className="flex items-center gap-3">

                  <Stethoscope
                    className="text-purple-600"
                    size={18}
                  />

                  <span>
                    {doctor.department ||
                      doctor.specialization}
                  </span>

                </div>

              </div>

              <button
                onClick={() =>
                  navigate("/doctor/profile")
                }
                className="mt-8 w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
              >
                View Profile
              </button>

            </Card>

          </div>
          {/* Recent Appointments */}

          <Card className="mt-8 p-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

              <div>

                <h2 className="text-2xl font-bold">
                  Recent Appointments
                </h2>

                <p className="text-slate-500">
                  Search and manage appointments.
                </p>

              </div>

              <div className="flex gap-3 flex-wrap">

                <div className="relative">

                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search patient..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="pl-10 pr-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value)
                  }
                  className="px-4 rounded-xl border border-slate-300"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-3 py-4">Patient</th>

                    <th className="px-3 py-4">Date</th>

                    <th className="px-3 py-4">Time</th>

                    <th className="px-3 py-4">Contact</th>

                    <th className="px-3 py-4">Status</th>

                    <th className="px-3 py-4 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAppointments.length === 0 ? (

                    <tr>

                      <td
                        colSpan={6}
                        className="text-center py-16 text-slate-500"
                      >

                        <ClipboardList
                          size={48}
                          className="mx-auto mb-3 text-slate-300"
                        />

                        No appointments found.

                      </td>

                    </tr>

                  ) : (

                    filteredAppointments.map((appointment) => (

                      <tr
                        key={appointment.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >

                        <td className="px-3 py-5">

                          <div className="flex items-center gap-3">

                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">

                              <UserCircle2 className="text-blue-600" />

                            </div>

                            <div>

                              <h4 className="font-semibold">
                                {appointment.patientName}
                              </h4>

                              <p className="text-sm text-slate-500">
                                {appointment.gender} • {appointment.age} yrs
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-3 py-5 whitespace-nowrap">
                          {appointment.date}
                        </td>

                        <td className="px-3 py-5 whitespace-nowrap">
                          {appointment.time}
                        </td>

                        <td className="px-3 py-5">

                          <div className="space-y-1">

                            <div className="flex items-center gap-2">

                              <Phone
                                size={15}
                                className="text-green-600"
                              />

                              <span className="text-sm">
                                {appointment.phone}
                              </span>

                            </div>

                            <div className="flex items-center gap-2">

                              <Mail
                                size={15}
                                className="text-blue-600"
                              />

                              <span className="text-sm">
                                {appointment.email}
                              </span>

                            </div>

                          </div>

                        </td>

                        <td className="px-3 py-5">

                          <AppointmentBadge
                            status={appointment.status}
                          />

                        </td>

                        <td className="px-3 py-5">

                          <div className="flex justify-center gap-2">

                            <button
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/doctor/profile?id=${appointment.patientId}`
                                )
                              }
                              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                              title="Patient"
                            >
                              <Edit3 size={18} />
                            </button>

                            {appointment.status !==
                              "Completed" && (

                                <button
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment.id,
                                      "Completed"
                                    )
                                  }
                                  className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                                  title="Complete"
                                >
                                  <CheckCircle2 size={18} />
                                </button>

                              )}

                            {appointment.status !==
                              "Cancelled" && (

                                <button
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment.id,
                                      "Cancelled"
                                    )
                                  }
                                  className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                  title="Cancel"
                                >
                                  <XCircle size={18} />
                                </button>

                              )}

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </Card>
          {/* Availability + Quick Overview */}

          <div className="grid xl:grid-cols-3 gap-6 mt-8">

            {/* Weekly Availability */}

            <Card className="xl:col-span-2 p-6">

              <input
                type="datetime-local"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />

              <input
                type="datetime-local"
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
              />

              <button onClick={saveAvailability}>
                Save
              </button>

              <div className="grid md:grid-cols-2 gap-4">

                {(availability.length
                  ? availability
                  : DAYS.map((day) => ({
                    day,
                    available: false,
                    startTime: "09:00",
                    endTime: "17:00",
                  }))
                ).map((item) => (

                  <div
                    key={item.day}
                    className={`rounded-2xl border p-5 transition ${item.available
                      ? "border-green-300 bg-green-50"
                      : "border-slate-200 bg-white"
                      }`}
                  >

                    <div className="flex justify-between items-center">

                      <div>

                        <h3 className="font-bold">
                          {item.day}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {item.available
                            ? "Available"
                            : "Unavailable"}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          toggleAvailability(item.day)
                        }
                        className={`relative w-14 h-8 rounded-full transition ${item.available
                          ? "bg-green-500"
                          : "bg-slate-300"
                          }`}
                      >

                        <span
                          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${item.available
                            ? "left-7"
                            : "left-1"
                            }`}
                        />

                      </button>

                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <div>

                        <label className="text-sm text-slate-500">
                          Start Time
                        </label>

                        <input
                          type="time"
                          value={item.startTime || ""}
                          disabled={!item.available}
                          onChange={(e) =>
                            setAvailability((prev) =>
                              prev.map((d) =>
                                d.day === item.day
                                  ? {
                                    ...d,
                                    startTime:
                                      e.target.value,
                                  }
                                  : d
                              )
                            )
                          }
                          className="mt-1 w-full border rounded-xl px-3 py-2 disabled:bg-slate-100"
                        />

                      </div>

                      <div>

                        <label className="text-sm text-slate-500">
                          End Time
                        </label>

                        <input
                          type="time"
                          value={item.endTime || ""}
                          disabled={!item.available}
                          onChange={(e) =>
                            setAvailability((prev) =>
                              prev.map((d) =>
                                d.day === item.day
                                  ? {
                                    ...d,
                                    endTime:
                                      e.target.value,
                                  }
                                  : d
                              )
                            )
                          }
                          className="mt-1 w-full border rounded-xl px-3 py-2 disabled:bg-slate-100"
                        />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </Card>

            {/* Quick Overview */}

            <Card className="p-6">

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-xl font-bold">
                  Quick Overview
                </h2>

                <TimerReset className="text-blue-600" />

              </div>

              <div className="space-y-5">

                <div className="rounded-2xl bg-slate-50 p-4">

                  <div className="flex justify-between mb-2">

                    <span>Completed</span>

                    <span className="font-bold">
                      {stats.completed}
                    </span>

                  </div>

                  <MiniBar
                    value={stats.completed}
                    max={maxValue}
                  />

                </div>

                <div className="rounded-2xl bg-slate-50 p-4">

                  <div className="flex justify-between mb-2">

                    <span>Pending</span>

                    <span className="font-bold">
                      {stats.pending}
                    </span>

                  </div>

                  <MiniBar
                    value={stats.pending}
                    max={maxValue}
                  />

                </div>

                <div className="rounded-2xl bg-slate-50 p-4">

                  <div className="flex justify-between mb-2">

                    <span>Cancelled</span>

                    <span className="font-bold">
                      {stats.cancelled}
                    </span>

                  </div>

                  <MiniBar
                    value={stats.cancelled}
                    max={maxValue}
                  />

                </div>

                <div className="rounded-2xl bg-blue-600 text-white p-5">

                  <h3 className="font-bold text-lg">
                    Today's Schedule
                  </h3>

                  <p className="mt-2 text-blue-100">
                    {stats.todayAppointments} appointment(s)
                    scheduled today.
                  </p>

                </div>

              </div>

            </Card>

          </div>

          {/* Upcoming Appointments */}

          <Card className="mt-8 p-6">

            <div className="flex justify-between items-center mb-6">

              <div>

                <h2 className="text-2xl font-bold">
                  Upcoming Appointments
                </h2>

                <p className="text-slate-500">
                  Next scheduled patients
                </p>

              </div>

            </div>

            <div className="space-y-4">

              {filteredAppointments
                .filter(
                  (a) =>
                    a.status === "Pending" ||
                    a.status === "Confirmed"
                )
                .slice(0, 5)
                .map((appointment) => (

                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-slate-200 p-4 hover:shadow-md transition"
                  >

                    <div className="flex justify-between items-start">

                      <div>

                        <h3 className="font-semibold">
                          {appointment.patientName}
                        </h3>

                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">

                          <Calendar size={15} />

                          {appointment.date}

                        </div>

                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">

                          <Clock3 size={15} />

                          {appointment.time}

                        </div>

                      </div>

                      <AppointmentBadge
                        status={appointment.status}
                      />

                    </div>

                  </div>

                ))}

              {filteredAppointments.filter(
                (a) =>
                  a.status === "Pending" ||
                  a.status === "Confirmed"
              ).length === 0 && (

                  <div className="text-center py-10 text-slate-500">

                    <CalendarDays
                      size={48}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    No upcoming appointments.

                  </div>

                )}

            </div>

          </Card>
          {/* Activity Feed */}

          <Card className="mt-8 p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Activity Feed
                </h2>

                <p className="text-slate-500">
                  Latest doctor activities
                </p>

              </div>

              <Bell className="text-blue-600" />

            </div>

            <div className="space-y-5">

              <div className="flex gap-4">

                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">

                  <CheckCircle2 className="text-green-600" />

                </div>

                <div>

                  <h4 className="font-semibold">
                    Appointment Completed
                  </h4>

                  <p className="text-sm text-slate-500">
                    A consultation has been completed successfully.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <div className="w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center">

                  <Clock3 className="text-yellow-600" />

                </div>

                <div>

                  <h4 className="font-semibold">
                    Pending Appointments
                  </h4>

                  <p className="text-sm text-slate-500">
                    {stats.pending} appointment(s) are waiting for action.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">

                  <Users className="text-blue-600" />

                </div>

                <div>

                  <h4 className="font-semibold">
                    Total Patients
                  </h4>

                  <p className="text-sm text-slate-500">
                    You have treated {stats.totalPatients} patient(s).
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">

                  <XCircle className="text-red-600" />

                </div>

                <div>

                  <h4 className="font-semibold">
                    Cancelled Appointments
                  </h4>

                  <p className="text-sm text-slate-500">
                    {stats.cancelled} appointment(s) have been cancelled.
                  </p>

                </div>

              </div>

            </div>

          </Card>

          {/* Footer */}

          <div className="mt-10 border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between">

            <div>

              <h3 className="font-bold text-slate-800">
                Healthcare Management System
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Doctor Dashboard • Version 1.0
              </p>

            </div>

            <button
              onClick={loadDashboard}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <RefreshCw size={18} />
              Refresh Dashboard
            </button>

          </div>

        </section>

      </main>

    </div>

  );

}