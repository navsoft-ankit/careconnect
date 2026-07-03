import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Activity, BadgeCheck, Bell, Calendar, CalendarDays,
  CheckCircle2, ClipboardList, Clock3, HeartPulse, Mail,
  Menu, Phone, PieChart, RefreshCw, Search, Stethoscope,
  TimerReset, TrendingDown, TrendingUp, UserCircle2, Users,
  X, XCircle, Eye, Edit3,
} from "lucide-react";

/* ─── API ─────────────────────────────────────────── */
const API = axios.create({ baseURL: "http://localhost:5008/api" });
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ─── Design tokens ───────────────────────────────── */
const T = {
  cream: "#F5F0E8",
  creamDark: "#EDE7D9",
  green: "#2D5016",
  greenMid: "#3D6B1F",
  greenLight: "#EBF2E3",
  terra: "#C4622D",
  terraLight: "#FAF0EA",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
};

/* ─── Status config ───────────────────────────────── */
const STATUS = {
  Pending: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A" },
  Confirmed: { bg: T.greenLight, text: T.green, border: "#BBD9A0" },
  Completed: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
  Cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
};

/* ─── Tiny helpers ────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: T.white, borderRadius: 20, padding: 24, border: `1px solid ${T.border}`, animation: "pulse 1.5s infinite" }}>
      <div style={{ height: 14, background: T.creamDark, borderRadius: 8, width: "40%", marginBottom: 16 }} />
      <div style={{ height: 40, background: T.creamDark, borderRadius: 8, width: "60%", marginBottom: 12 }} />
      <div style={{ height: 10, background: T.creamDark, borderRadius: 8 }} />
    </div>
  );
}

function MiniBar({ value, max, color = T.green }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 6, borderRadius: 99, background: T.creamDark, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width .4s ease" }} />
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS[status] || { bg: T.creamDark, text: T.muted, border: T.border };
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`, whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

function StatCard({ title, value, icon, accent, growth }) {
  return (
    <div style={{
      background: T.white, borderRadius: 20, padding: 24,
      border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      transition: "box-shadow .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.09)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{title}</p>
          <h2 style={{ fontSize: 40, fontWeight: 800, margin: "10px 0 14px", color: T.ink, fontFamily: "Fraunces, serif" }}>{value}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {growth >= 0
              ? <TrendingUp size={15} color="#16A34A" />
              : <TrendingDown size={15} color="#DC2626" />}
            <span style={{ fontWeight: 700, fontSize: 13, color: growth >= 0 ? "#16A34A" : "#DC2626" }}>{Math.abs(growth)}%</span>
            <span style={{ fontSize: 12, color: T.muted }}>this month</span>
          </div>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: accent, marginTop: 20, opacity: 0.7 }} />
    </div>
  );
}

/* ─── Main ────────────────────────────────────────── */
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [stats, setStats] = useState({
    totalPatients: 0, todayAppointments: 0,
    completed: 0, pending: 0, cancelled: 0, earnings: 0,
  });

  async function loadDashboard() {
    try {
      setLoading(true);
      const [profileRes, apptRes, availRes] = await Promise.all([
        API.get("/doctor/profile"),
        API.get("/doctor/appointments"),
        API.get("/doctor/availability"),
      ]);
      const apptData = Array.isArray(apptRes.data) ? apptRes.data : [];
      const availData = Array.isArray(availRes.data) ? availRes.data : [];
      setDoctor(profileRes.data || {});
      setAppointments(apptData);
      setAvailability(availData);

      const today = new Date().toDateString();
      const completed = apptData.filter(a => a.status === "Completed").length;
      const pending = apptData.filter(a => a.status === "Pending" || a.status === "Confirmed").length;
      const cancelled = apptData.filter(a => a.status === "Cancelled").length;
const todayAppts = apptData.filter(
  a => new Date(a.appointmentDate).toDateString() === today
).length;      const totalPatients = new Set(apptData.map(a => a.patientId || a.patientEmail)).size;
      const earnings = apptData.filter(a => a.status === "Completed").reduce((s, a) => s + Number(a.amount || a.fee || 0), 0);
      setStats({ totalPatients, todayAppointments: todayAppts, completed, pending, cancelled, earnings });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function updateStatus(id, status) {
    try {
      await API.put("/doctor/appointment/status", { appointmentId: id, status });
      toast.success("Appointment updated.");
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      loadDashboard();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to update.");
    }
  }

  const filtered = useMemo(() => appointments.filter(a => {
    const s = a.patientName?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    const f = filterStatus === "All" || a.status === filterStatus;
    return s && f;
  }), [appointments, search, filterStatus]);

  const maxVal = Math.max(stats.completed, stats.pending, stats.cancelled, 1);

  /* ─── Nav link ──── */
  const NavLink = ({ icon, label, path, active }) => (
    <button onClick={() => navigate(path)} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%",
      padding: "11px 16px", borderRadius: 12, border: "none", cursor: "pointer",
      background: active ? T.terra : "transparent",
      color: active ? T.white : "#CBD5E1",
      fontWeight: active ? 700 : 500, fontSize: 14, transition: "all .15s",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {icon}{label}
    </button>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.cream, padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
        {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
      </div>
    </div>
  );

  /* ─── Shared card style ─── */
  const card = {
    background: T.white, borderRadius: 20,
    border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
    overflow: "hidden",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius:99px; }
        input[type=time]::-webkit-calendar-picker-indicator { filter: invert(.4); }
        select option { background: ${T.white}; color: ${T.ink}; }
      `}</style>

      {/* Overlay */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 40 }} />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, zIndex: 50,
        width: 268, height: "100vh",
        background: "#111827",
        transform: drawerOpen ? "translateX(0)" : undefined,
        display: "flex", flexDirection: "column",
        transition: "transform .25s",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.terra, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HeartPulse size={22} color={T.white} />
            </div>
            <div>
              <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.white, lineHeight: 1.1 }}>CareConnect</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Doctor Panel</div>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "none" }}>
            <X size={20} />
          </button>
        </div>

        {/* Doctor info */}
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1F2937", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCircle2 size={30} color="#94A3B8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: T.white, fontSize: 14 }}>{doctor.name || "Doctor"}</div>
              <div style={{ fontSize: 12, color: T.terra, marginTop: 2 }}>{doctor.specialization || "Specialist"}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          <NavLink active icon={<Activity size={17} />} label="Dashboard" path="/doctor/dashboard" />
          <NavLink icon={<Calendar size={17} />} label="Appointments" path="/doctor/appointments" />
          <NavLink icon={<Clock3 size={17} />} label="Availability" path="/doctor/availability" />
          <NavLink icon={<UserCircle2 size={17} />} label="Profile" path="/doctor/profile" />
          <NavLink icon={<Clock3 size={17} />} label="Request Slot" path="/doctor/request-slot" />
        </nav>

        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <button onClick={loadDashboard} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: T.white, color: T.ink, border: "none", borderRadius: 12,
            padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────── */}
      <main style={{ marginLeft: 268, minHeight: "100vh" }}>

        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "rgba(245,240,232,.92)", backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`,
          padding: "16px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: T.ink, display: "none" }}>
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 22, margin: 0, color: T.ink }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 13, color: T.muted, margin: "3px 0 0" }}>Manage your appointments and availability</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: T.ink }}>
              <Bell size={20} />
              <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: T.terra, color: T.white, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </button>
            <div style={{ width: 1, height: 24, background: T.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{doctor.name}</div>
                <div style={{ fontSize: 11, color: T.terra }}>{doctor.specialization}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.creamDark, border: `2px solid ${T.terra}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserCircle2 size={22} color={T.muted} />
              </div>
            </div>
          </div>
        </header>

        <section style={{ padding: 28 }}>

          {/* ── Stat cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            <StatCard title="Today's Appointments" value={stats.todayAppointments} growth={12} accent={T.green} icon={<Calendar size={24} />} />
            <StatCard title="Total Patients" value={stats.totalPatients} growth={8} accent="#0E7490" icon={<Users size={24} />} />
            <StatCard title="Completed" value={stats.completed} growth={18} accent={T.green} icon={<BadgeCheck size={24} />} />
            <StatCard title="Pending / Confirmed" value={stats.pending} growth={-4} accent={T.terra} icon={<Clock3 size={24} />} />
          </div>

          {/* ── Analytics + Profile ── */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 24 }}>

            {/* Analytics */}
            <div style={{ ...card, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, margin: 0, color: T.ink }}>Appointment Analytics</h2>
                  <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>Overall appointment performance</p>
                </div>
                <PieChart size={20} color={T.terra} />
              </div>

              {[
                { label: "Completed", value: stats.completed, color: T.green },
                { label: "Pending", value: stats.pending, color: "#D97706" },
                { label: "Cancelled", value: stats.cancelled, color: "#DC2626" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}</span>
                  </div>
                  <MiniBar value={value} max={maxVal} color={color} />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 28 }}>
                {[
                  { label: "Total Bookings", value: appointments.length, icon: <ClipboardList size={18} color={T.green} />, bg: T.greenLight },
                  { label: "Earnings", value: `₹${stats.earnings}`, icon: <HeartPulse size={18} color={T.terra} />, bg: T.terraLight },
                  { label: "Working Days", value: availability.filter(a => a.available).length, icon: <CalendarDays size={18} color="#7C3AED" />, bg: "#F3F0FF" },
                ].map(({ label, value, icon, bg }) => (
                  <div key={label} style={{ background: bg, borderRadius: 14, padding: "18px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 26, color: T.ink }}>{value}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor profile card */}
            <div style={{ ...card, padding: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: T.creamDark, border: `3px solid ${T.terra}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <UserCircle2 size={52} color={T.muted} />
              </div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color: T.ink, margin: 0 }}>{doctor.name}</h2>
              <span style={{ fontSize: 13, color: T.terra, fontWeight: 600, marginTop: 4 }}>{doctor.specialization}</span>

              <div style={{ width: "100%", marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: <Mail size={15} color={T.green} />, val: doctor.email },
                  { icon: <Phone size={15} color={T.green} />, val: doctor.phone },
                  { icon: <Stethoscope size={15} color={T.green} />, val: doctor.department || doctor.specialization },
                ].map(({ icon, val }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.cream, borderRadius: 10 }}>
                    {icon}
                    <span style={{ fontSize: 13, color: T.ink, fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate("/doctor/profile")} style={{
                marginTop: 24, width: "100%", padding: "12px 0", borderRadius: 12,
                background: T.terra, color: T.white, border: "none",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                transition: "background .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#A8502A"}
                onMouseLeave={e => e.currentTarget.style.background = T.terra}
              >
                View Full Profile
              </button>
            </div>
          </div>

          {/* ── Recent Appointments table ── */}
          <div style={{ ...card, marginTop: 24 }}>
            <div style={{ padding: "24px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, margin: 0 }}>Recent Appointments</h2>
                <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>Search and manage patient appointments</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search patient…"
                    style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, outline: "none", background: T.cream, color: T.ink, width: 200 }}
                  />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, background: T.cream, color: T.ink, cursor: "pointer" }}>
                  {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.cream }}>
                    {["Patient", "Date", "Time", "Contact", "Status"].map(h => (
                      <th key={h} style={{ padding: "13px 20px", textAlign: h === "Actions" ? "center" : "left", fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .5, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                        <ClipboardList size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                        No appointments found.
                      </td>
                    </tr>
                  ) : filtered.map(a => (
                    <tr key={a.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.cream}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <UserCircle2 size={22} color={T.green} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{a.patientName}</div>
                            <div style={{ fontSize: 12, color: T.muted }}>{a.gender} · {a.age} yrs</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>{a.appointmentDate}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>{a.appointmentTime}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={12} color={T.green} /><span style={{ fontSize: 12, color: T.ink }}>{a.patientPhone}</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={12} color={T.green} /><span style={{ fontSize: 12, color: T.ink }}>{a.patientEmail}</span></div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}><Badge status={a.status} /></td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Upcoming + Quick Overview ── */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 24 }}>

            {/* Upcoming */}
            <div style={{ ...card, padding: 28 }}>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, margin: "0 0 20px", color: T.ink }}>Upcoming Appointments</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.filter(a => a.status === "Pending" || a.status === "Confirmed").slice(0, 5).map(a => (
                  <div key={a.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: 16, borderRadius: 12, background: T.cream, border: `1px solid ${T.border}`,
                    transition: "box-shadow .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.07)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{a.patientName}</div>
                      <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.muted }}><Calendar size={12} />{a.appointmentDate}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.muted }}><Clock3 size={12} />{a.appointmentTime}</span>
                      </div>
                    </div>
                    <Badge status={a.status} />
                  </div>
                ))}
                {filtered.filter(a => a.status === "Pending" || a.status === "Confirmed").length === 0 && (
                  <div style={{ textAlign: "center", padding: "36px 0", color: T.muted }}>
                    <CalendarDays size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                    No upcoming appointments.
                  </div>
                )}
              </div>
            </div>

            {/* Quick overview */}
            <div style={{ ...card, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, margin: 0 }}>Quick Overview</h2>
                <TimerReset size={18} color={T.terra} />
              </div>
              {[
                { label: "Completed", value: stats.completed, color: T.green },
                { label: "Pending", value: stats.pending, color: "#D97706" },
                { label: "Cancelled", value: stats.cancelled, color: "#DC2626" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: T.cream, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}</span>
                  </div>
                  <MiniBar value={value} max={maxVal} color={color} />
                </div>
              ))}
              <div style={{ background: T.green, borderRadius: 14, padding: 20, marginTop: 8 }}>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 16, color: T.white }}>Today's Schedule</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.75)", margin: "8px 0 0" }}>
                  {stats.todayAppointments} appointment{stats.todayAppointments !== 1 ? "s" : ""} scheduled today.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 16, color: T.ink }}>CareConnect</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Doctor Dashboard · v1.0</div>
            </div>
            <button onClick={loadDashboard} style={{
              display: "flex", alignItems: "center", gap: 8, background: T.green,
              color: T.white, border: "none", borderRadius: 12, padding: "12px 22px",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>
              <RefreshCw size={15} /> Refresh Dashboard
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}

/* Tiny icon button */
function Btn({ icon, title, bg, fg, onClick }) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
      background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center",
      transition: "opacity .15s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
      {icon}
    </button>
  );
}