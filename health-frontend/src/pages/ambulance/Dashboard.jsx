import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Ambulance, MapPin, Navigation, Clock, CheckCircle2,
  XCircle, AlertCircle, User, Mail, Phone, RefreshCw,
  TrendingUp, TrendingDown, Activity, IndianRupee,
  Route, LayoutDashboard, ClipboardList, UserCircle2,
  Menu, X, Bell, ChevronRight, Gauge,
} from "lucide-react";

/* ─── API ─────────────────────────────────────── */
const API = axios.create({ baseURL: "http://localhost:5008/api" });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* ─── Tokens ──────────────────────────────────── */
const T = {
  cream:      "#F5F0E8",
  creamDark:  "#EDE7D9",
  green:      "#2D5016",
  greenLight: "#EBF2E3",
  terra:      "#C4622D",
  terraLight: "#FAF0EA",
  ink:        "#1A1A1A",
  muted:      "#6B7280",
  border:     "#E2DACE",
  white:      "#FFFFFF",
  amber:      "#D97706",
  amberLight: "#FEF3C7",
  red:        "#DC2626",
  redLight:   "#FEE2E2",
  blue:       "#1D4ED8",
  blueLight:  "#DBEAFE",
};

const STATUS_CFG = {
  Pending:   { bg: T.amberLight, text: T.amber,  border: "#FDE68A", label: "Pending"   },
  Accepted:  { bg: T.greenLight, text: T.green,  border: "#BBD9A0", label: "Accepted"  },
  OnTheWay:  { bg: T.blueLight,  text: T.blue,   border: "#BFDBFE", label: "On The Way"},
  Completed: { bg: T.greenLight, text: T.green,  border: "#BBD9A0", label: "Completed" },
  Rejected:  { bg: T.redLight,   text: T.red,    border: "#FECACA", label: "Rejected"  },
  Cancelled: { bg: T.redLight,   text: T.red,    border: "#FECACA", label: "Cancelled" },
};

/* ─── Helpers ─────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { bg: T.creamDark, text: T.muted, border: T.border, label: status };
  return (
    <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: s.bg, color: s.text, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function StatCard({ title, value, accent, icon, growth, sub }) {
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
          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 42, margin: "8px 0 12px", color: T.ink }}>{value}</h2>
          {growth !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {growth >= 0 ? <TrendingUp size={14} color="#16A34A" /> : <TrendingDown size={14} color={T.red} />}
              <span style={{ fontWeight: 700, fontSize: 12, color: growth >= 0 ? "#16A34A" : T.red }}>{Math.abs(growth)}%</span>
              <span style={{ fontSize: 12, color: T.muted }}>{sub || "this month"}</span>
            </div>
          )}
        </div>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: accent, marginTop: 20, opacity: .7 }} />
    </div>
  );
}

function NavLink({ icon, label, path, active, navigate }) {
  return (
    <button onClick={() => navigate(path)} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%",
      padding: "11px 16px", borderRadius: 12, border: "none", cursor: "pointer",
      background: active ? T.terra : "transparent",
      color: active ? T.white : "#CBD5E1",
      fontWeight: active ? 700 : 500, fontSize: 14, transition: "all .15s",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {icon} {label}
    </button>
  );
}

/* ─── Active Ride Card ───────────────────────── */
function ActiveRideCard({ ride, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: T.white, borderRadius: 20, border: `2px solid ${T.terra}`,
      boxShadow: "0 4px 20px rgba(196,98,45,.15)", overflow: "hidden",
      transition: "box-shadow .2s",
    }}>
      {/* Header strip */}
      <div style={{ background: `linear-gradient(135deg, ${T.terra}, #A8502A)`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ambulance size={20} color={T.white} />
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, color: T.white, fontSize: 15 }}>Active Ride</span>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      <div style={{ padding: 20 }}>
        {/* Patient */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.creamDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={22} color={T.muted} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>{ride.patientName}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{ride.patientEmail}</div>
          </div>
        </div>

        {/* Route */}
        <div style={{ background: T.cream, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green }} />
              <div style={{ width: 2, height: 28, background: T.border }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.terra }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Pickup</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 2 }}>{ride.pickupLocation}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Destination</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 2 }}>{ride.destinationLocation}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.greenLight, padding: "6px 12px", borderRadius: 99 }}>
              <Route size={13} color={T.green} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{ride.distanceKm?.toFixed(1)} km</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.terraLight, padding: "6px 12px", borderRadius: 99 }}>
              <IndianRupee size={13} color={T.terra} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.terra }}>₹{ride.fare}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.blueLight, padding: "6px 12px", borderRadius: 99 }}>
              <Ambulance size={13} color={T.blue} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>{ride.vehicleType}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ride.status === "Pending" && (
            <>
              <ActionBtn label="Accept Ride" bg={T.green} fg={T.white} icon={<CheckCircle2 size={15} />} onClick={() => onUpdateStatus(ride.id, "Accepted")} />
              <ActionBtn label="Reject" bg={T.redLight} fg={T.red} icon={<XCircle size={15} />} onClick={() => onUpdateStatus(ride.id, "Rejected")} />
            </>
          )}
          {ride.status === "Accepted" && (
            <>
              <ActionBtn label="On The Way" bg={T.blue} fg={T.white} icon={<Navigation size={15} />} onClick={() => onUpdateStatus(ride.id, "OnTheWay")} />
              <ActionBtn label="Cancel" bg={T.redLight} fg={T.red} icon={<XCircle size={15} />} onClick={() => onUpdateStatus(ride.id, "Cancelled")} />
            </>
          )}
          {ride.status === "OnTheWay" && (
            <ActionBtn label="Mark Completed" bg={T.green} fg={T.white} icon={<CheckCircle2 size={15} />} onClick={() => onUpdateStatus(ride.id, "Completed")} />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ label, bg, fg, icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10,
      border: "none", background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: "pointer",
      transition: "opacity .15s", flex: 1, justifyContent: "center", minWidth: 120,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
      {icon}{label}
    </button>
  );
}

/* ─── Main Dashboard ──────────────────────────── */
export default function AmbulanceDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [drawer, setDrawer]     = useState(false);
  const [driver, setDriver]     = useState({ name: "Driver", vehicleType: "Basic", isAvailable: true });

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get("/Ambulance/requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put("/Ambulance/request-status", { requestId: id, status });
      toast.success(`Ride ${status.toLowerCase()}.`);
      load();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  /* derived stats */
  const active    = requests.filter(r => r.status === "Pending" || r.status === "Accepted" || r.status === "OnTheWay");
  const completed = requests.filter(r => r.status === "Completed").length;
  const cancelled = requests.filter(r => r.status === "Cancelled" || r.status === "Rejected").length;
  const earnings  = requests.filter(r => r.status === "Completed").reduce((s, r) => s + Number(r.fare || 0), 0);
  const recent    = [...requests].sort((a, b) => new Date(b.requestTime) - new Date(a.requestTime)).slice(0, 5);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 52, height: 52, border: `3px solid ${T.terra}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: T.muted, fontFamily: "Inter, sans-serif" }}>Loading dashboard…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const sidebar = (
    <aside style={{
      position: "fixed", top: 0, left: 0, zIndex: 50,
      width: 268, height: "100vh", background: "#111827",
      display: "flex", flexDirection: "column", transition: "transform .25s",
      transform: drawer ? "translateX(0)" : undefined,
    }}>
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.terra, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ambulance size={22} color={T.white} />
          </div>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 16, color: T.white }}>CareConnect</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Ambulance Driver</div>
          </div>
        </div>
        <button onClick={() => setDrawer(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={18} /></button>
      </div>

      {/* Driver info */}
      <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1F2937", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCircle2 size={30} color="#94A3B8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: T.white, fontSize: 14 }}>{driver.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: driver.isAvailable ? "#22C55E" : "#EF4444" }} />
              <span style={{ fontSize: 11, color: driver.isAvailable ? "#22C55E" : "#EF4444", fontWeight: 600 }}>
                {driver.isAvailable ? "Available" : "On Ride"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <NavLink active icon={<LayoutDashboard size={17} />} label="Dashboard"  path="/ambulance/dashboard"  navigate={navigate} />
        <NavLink        icon={<ClipboardList size={17} />}  label="All Rides"   path="/ambulance/requests"   navigate={navigate} />
        <NavLink        icon={<UserCircle2 size={17} />}    label="Profile"     path="/ambulance/profile"    navigate={navigate} />
      </nav>

      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <button onClick={load} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.white, color: T.ink, border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}
      `}</style>

      {drawer && <div onClick={() => setDrawer(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 40 }} />}
      {sidebar}

      <main style={{ marginLeft: 268, minHeight: "100vh" }}>
        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "rgba(245,240,232,.92)", backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`, padding: "16px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setDrawer(true)} style={{ background: "none", border: "none", cursor: "pointer", color: T.ink }}>
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 22, margin: 0, color: T.ink }}>Driver Dashboard</h1>
              <p style={{ fontSize: 12, color: T.muted, margin: "3px 0 0" }}>Real-time ride overview</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: T.ink }}>
              <Bell size={20} />
              {active.length > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: T.terra, color: T.white, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{active.length}</span>
              )}
            </button>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.creamDark, border: `2px solid ${T.terra}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCircle2 size={20} color={T.muted} />
            </div>
          </div>
        </header>

        <section style={{ padding: 28 }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18, marginBottom: 28 }}>
            <StatCard title="Active Rides"  value={active.length}  accent={T.terra} icon={<Ambulance size={22} />} growth={active.length > 0 ? null : undefined} sub="" />
            <StatCard title="Completed"     value={completed}      accent={T.green} icon={<CheckCircle2 size={22} />} growth={8} />
            <StatCard title="Cancelled"     value={cancelled}      accent={T.red}   icon={<XCircle size={22} />}     growth={-3} />
            <StatCard title="Earnings"      value={`₹${earnings}`} accent="#7C3AED" icon={<IndianRupee size={22} />} growth={15} />
          </div>

          {/* Active rides section */}
          {active.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.terra, animation: "pulse 1.5s infinite" }} />
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, margin: 0, color: T.ink }}>Active Rides</h2>
                <span style={{ background: T.terra, color: T.white, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>{active.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 18 }}>
                {active.map(r => <ActiveRideCard key={r.id} ride={r} onUpdateStatus={updateStatus} />)}
              </div>
            </div>
          )}

          {active.length === 0 && (
            <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: "48px 24px", textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Gauge size={36} color={T.green} />
              </div>
              <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color: T.ink, margin: "0 0 8px" }}>No active rides</h3>
              <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>You're free. New ride requests will appear here.</p>
            </div>
          )}

          {/* Recent rides table */}
          <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={17} color={T.green} />
                <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Recent Rides</span>
              </div>
              <button onClick={() => navigate("/ambulance/requests")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: T.terra, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.cream }}>
                    {["Patient", "Pickup → Destination", "Distance", "Fare", "Time", "Status"].map(h => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 14 }}>No rides yet.</td></tr>
                  ) : recent.map(r => (
                    <tr key={r.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.cream}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{r.patientName}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>{r.patientEmail}</div>
                      </td>
                      <td style={{ padding: "14px 20px", maxWidth: 240 }}>
                        <div style={{ fontSize: 13, color: T.ink, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.pickupLocation}</div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>→ {r.destinationLocation}</div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: T.ink, fontWeight: 600, whiteSpace: "nowrap" }}>{r.distanceKm?.toFixed(1)} km</td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: T.green, fontWeight: 700, whiteSpace: "nowrap" }}>₹{r.fare}</td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{new Date(r.requestTime).toLocaleString()}</td>
                      <td style={{ padding: "14px 20px" }}><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 15, color: T.ink }}>CareConnect</div>
              <div style={{ fontSize: 12, color: T.muted }}>Ambulance Driver Panel · v1.0</div>
            </div>
            <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 8, background: T.green, color: T.white, border: "none", borderRadius: 12, padding: "11px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}