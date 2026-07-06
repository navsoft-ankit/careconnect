import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Stethoscope,
  Package,
  CalendarDays,
  Ambulance,
  Building2,
  Clock3,
  ShoppingBag,
  ClipboardList,
  Sparkles,
  Newspaper,
} from "lucide-react";

const T = {
  cream: "#F5F0E8",
  green: "#2D5016",
  greenDark: "#1F3A0F",
  greenMid: "#3D6B1F",
  terra: "#C4622D",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
};

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/admin/ambulances", label: "Ambulance", icon: Ambulance },
  { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/admin/hospital-sessions", label: "Hospital Sessions", icon: Clock3 },
  { to: "/admin/product-orders", label: "Product Orders", icon: ShoppingBag },
  { to: "/admin/ambulance-bookings", label: "Ambulance Bookings", icon: ClipboardList },
  { to: "/admin/slot-requests", label: "Doctor Slot Requests", icon: Clock3 },
  { to: "/admin/blogs", label: "Blogs", icon: Newspaper},
];

export default function Sidebar() {
  return (
    <div
      style={{
        width: 264,
        height: "100vh",
        background: `linear-gradient(180deg, ${T.green} 0%, ${T.greenDark} 100%)`,
        color: T.white,
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        zIndex: 40,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .cc-navlink { display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:12px; color:rgba(255,255,255,.75); font-size:13.5px; font-weight:500; text-decoration:none; transition:background .15s ease,color .15s ease; }
        .cc-navlink:hover { background:rgba(255,255,255,.08); color:#fff; }
        .cc-navlink.active { background:${T.terra}; color:#fff; font-weight:600; }
        .cc-sidebar-scroll::-webkit-scrollbar{ width:4px; }
        .cc-sidebar-scroll::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.15); border-radius:99px; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "26px 22px 22px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: T.terra,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={17} color={T.white} />
        </div>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>CareConnect.</div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,.5)" }}>Admin Panel</div>
        </div>
      </div>

      <nav className="cc-sidebar-scroll" style={{ flex: 1, overflowY: "auto", padding: "18px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `cc-navlink${isActive ? " active" : ""}`}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "16px 22px", borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 11, color: "rgba(255,255,255,.4)" }}>
        CareConnect © {new Date().getFullYear()}
      </div>
    </div>
  );
}