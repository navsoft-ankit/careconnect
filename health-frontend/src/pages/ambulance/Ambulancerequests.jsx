import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Ambulance, MapPin, Navigation, CheckCircle2, XCircle,
  Clock, Search, Filter, RefreshCw, Route, IndianRupee,
  User, Mail, ChevronDown, ChevronUp, Calendar,
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
  Pending:   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  Accepted:  { bg: T.greenLight, text: T.green, border: "#BBD9A0" },
  OnTheWay:  { bg: T.blueLight, text: T.blue, border: "#BFDBFE" },
  Completed: { bg: T.greenLight, text: T.green, border: "#BBD9A0" },
  Rejected:  { bg: T.redLight, text: T.red, border: "#FECACA" },
  Cancelled: { bg: T.redLight, text: T.red, border: "#FECACA" },
};

function Badge({ status }) {
  const s = STATUS_CFG[status] || { bg: T.creamDark, text: T.muted, border: T.border };
  return (
    <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: s.bg, color: s.text, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>{status}</span>
  );
}

/* ─── Expandable Row ──────────────────────────── */
function RequestRow({ r, idx, onUpdate }) {
  const [open, setOpen] = useState(false);

  const isActive = ["Pending", "Accepted", "OnTheWay"].includes(r.status);

  return (
    <>
      <tr style={{ borderTop: `1px solid ${T.border}`, cursor: "pointer", transition: "background .12s", background: open ? T.cream : "transparent" }}
        onMouseEnter={e => e.currentTarget.style.background = T.cream}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}
        onClick={() => setOpen(p => !p)}>
        <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted, fontWeight: 600 }}>{idx + 1}</td>
        <td style={{ padding: "15px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.creamDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={20} color={T.muted} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{r.patientName}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{r.patientEmail}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: "15px 20px", maxWidth: 220 }}>
          <div style={{ fontSize: 13, color: T.ink, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.pickupLocation}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>→ {r.destinationLocation}</div>
        </td>
        <td style={{ padding: "15px 20px", fontSize: 13, fontWeight: 700, color: T.green, whiteSpace: "nowrap" }}>₹{r.fare}</td>
        <td style={{ padding: "15px 20px", fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{new Date(r.requestTime).toLocaleString()}</td>
        <td style={{ padding: "15px 20px" }}><Badge status={r.status} /></td>
        <td style={{ padding: "15px 20px", textAlign: "center" }}>
          {open ? <ChevronUp size={16} color={T.muted} /> : <ChevronDown size={16} color={T.muted} />}
        </td>
      </tr>

      {open && (
        <tr style={{ background: T.cream }}>
          <td colSpan={7} style={{ padding: "0 20px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingTop: 16 }}>

              {/* Route detail */}
              <div style={{ background: T.white, borderRadius: 16, padding: 20, border: `1px solid ${T.border}` }}>
                <h4 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 15, margin: "0 0 14px", color: T.ink }}>Route Details</h4>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 3 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green }} />
                    <div style={{ width: 2, flex: 1, background: T.border, minHeight: 32 }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.terra }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .5 }}>Pickup</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 2 }}>{r.pickupLocation}</div>
                      {r.pickupLat && <div style={{ fontSize: 11, color: T.muted }}>({r.pickupLat?.toFixed(5)}, {r.pickupLng?.toFixed(5)})</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .5 }}>Destination</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 2 }}>{r.destinationLocation}</div>
                      {r.destinationLat && <div style={{ fontSize: 11, color: T.muted }}>({r.destinationLat?.toFixed(5)}, {r.destinationLng?.toFixed(5)})</div>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <Chip icon={<Route size={12} />} label={`${r.distanceKm?.toFixed(1)} km`} bg={T.greenLight} fg={T.green} />
                  <Chip icon={<Ambulance size={12} />} label={r.vehicleType} bg={T.blueLight} fg={T.blue} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ background: T.white, borderRadius: 16, padding: 20, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 15, margin: "0 0 14px", color: T.ink }}>Actions</h4>
                  {!isActive && (
                    <p style={{ fontSize: 13, color: T.muted }}>This ride is {r.status.toLowerCase()} and cannot be modified.</p>
                  )}
                </div>
                {isActive && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {r.status === "Pending" && (
                      <>
                        <RideBtn label="Accept Ride"  icon={<CheckCircle2 size={15} />} bg={T.green} fg={T.white} onClick={() => onUpdate(r.id, "Accepted")} />
                        <RideBtn label="Reject Ride"  icon={<XCircle size={15} />}      bg={T.redLight} fg={T.red}  onClick={() => onUpdate(r.id, "Rejected")} />
                      </>
                    )}
                    {r.status === "Accepted" && (
                      <>
                        <RideBtn label="Start — On The Way" icon={<Navigation size={15} />}  bg={T.blue}    fg={T.white} onClick={() => onUpdate(r.id, "OnTheWay")} />
                        <RideBtn label="Cancel Ride"        icon={<XCircle size={15} />}      bg={T.redLight} fg={T.red}  onClick={() => onUpdate(r.id, "Cancelled")} />
                      </>
                    )}
                    {r.status === "OnTheWay" && (
                      <RideBtn label="Mark as Completed" icon={<CheckCircle2 size={15} />} bg={T.green} fg={T.white} onClick={() => onUpdate(r.id, "Completed")} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Chip({ icon, label, bg, fg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: bg, padding: "5px 10px", borderRadius: 99 }}>
      <span style={{ color: fg }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: fg }}>{label}</span>
    </div>
  );
}

function RideBtn({ label, icon, bg, fg, onClick }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "11px 0", borderRadius: 10, border: "none",
      background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: "pointer",
      transition: "opacity .15s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
      {icon}{label}
    </button>
  );
}

/* ─── Main ────────────────────────────────────── */
export default function AmbulanceRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get("/Ambulance/requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try {
      await API.put("/Ambulance/request-status", { requestId: id, status });
      toast.success(`Ride ${status.toLowerCase()}.`);
      load();
    } catch {
      toast.error("Failed to update.");
    }
  };

  const filtered = useMemo(() => requests.filter(r => {
    const ms = !search || r.patientName?.toLowerCase().includes(search.toLowerCase()) || r.pickupLocation?.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || r.status === filter;
    return ms && mf;
  }).sort((a, b) => new Date(b.requestTime) - new Date(a.requestTime)), [requests, search, filter]);

  const total     = requests.length;
  const active    = requests.filter(r => ["Pending","Accepted","OnTheWay"].includes(r.status)).length;
  const completed = requests.filter(r => r.status === "Completed").length;
  const earnings  = requests.filter(r => r.status === "Completed").reduce((s, r) => s + Number(r.fare || 0), 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.terra}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: T.muted, fontFamily: "Inter, sans-serif", fontSize: 14 }}>Loading rides…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const card = { background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" };

  return (
    <div style={{ minHeight: "100vh", background: T.cream, padding: 28, fontFamily: "Inter, sans-serif", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28, margin: 0, color: T.ink }}>All Ride Requests</h1>
          <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>Full history — click a row to expand details & take action</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 8, background: T.terra, color: T.white, border: "none", borderRadius: 12, padding: "11px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total",     value: total,       color: T.ink  },
          { label: "Active",    value: active,      color: T.terra },
          { label: "Completed", value: completed,   color: T.green },
          { label: "Earnings",  value: `₹${earnings}`, color: "#7C3AED" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: T.white, borderRadius: 16, padding: "16px 20px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{label}</div>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 28, color, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        {/* Toolbar */}
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Ambulance size={17} color={T.terra} />
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Ride History</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or location…"
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, outline: "none", background: T.white, color: T.ink, width: 220 }} />
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Filter size={13} style={{ position: "absolute", left: 11, color: T.muted, pointerEvents: "none" }} />
              <select value={filter} onChange={e => setFilter(e.target.value)}
                style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, background: T.white, color: T.ink, cursor: "pointer", appearance: "none" }}>
                {["All","Pending","Accepted","OnTheWay","Completed","Rejected","Cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.cream }}>
                {["#","Patient","Pickup → Destination","Fare","Requested At","Status",""].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "52px 0", color: T.muted }}>
                  <Ambulance size={44} style={{ opacity: .2, display: "block", margin: "0 auto 12px" }} />
                  No rides match your filter.
                </td></tr>
              ) : filtered.map((r, i) => <RequestRow key={r.id} r={r} idx={i} onUpdate={update} />)}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "13px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
          <span style={{ fontSize: 12, color: T.muted }}>Showing <b style={{ color: T.ink }}>{filtered.length}</b> of <b style={{ color: T.ink }}>{total}</b> rides</span>
        </div>
      </div>
    </div>
  );
}