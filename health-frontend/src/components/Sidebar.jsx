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
  Mail,
} from "lucide-react";

const T = {
  cream: "#F5F0E8",
  green: "#2D5016",
  greenDark: "#17280C",
  greenMid: "#3D6B1F",
  terra: "#C4622D",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
};

// Grouped so related sections read as a hierarchy instead of one flat list.
const GROUPS = [
  {
    label: null,
    links: [{ to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true }],
  },
  {
    label: "Care",
    links: [
      { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
      { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
      { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
      { to: "/admin/hospital-sessions", label: "Hospital Sessions", icon: Clock3 },
      { to: "/admin/slot-requests", label: "Doctor Slot Requests", icon: Clock3 },
    ],
  },
  {
    label: "Ambulance",
    links: [
      { to: "/admin/ambulances", label: "Ambulance Drivers", icon: Ambulance },
      { to: "/admin/ambulance-bookings", label: "Ambulance Bookings", icon: ClipboardList },
    ],
  },
  {
    label: "Pharmacy",
    links: [
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/product-orders", label: "Product Orders", icon: ShoppingBag },
    ],
  },
  {
    label: "Content",
    links: [
      { to: "/admin/blogs", label: "Blogs", icon: Newspaper },
      { to: "/admin/contact-messages", label: "Contact Messages", icon: Mail },
    ],
  },
];

export default function Sidebar() {
  return (
    <div
      style={{
        width: 268,
        height: "100vh",
        background: `linear-gradient(165deg, ${T.green} 0%, ${T.greenDark} 100%)`,
        color: T.white,
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        zIndex: 40,
        boxShadow: "4px 0 24px rgba(0,0,0,.12)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .cc-navlink {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 14px 10px 16px;
          margin-left: 2px;
          border-radius: 12px;
          color: rgba(255,255,255,.62);
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: background .18s ease, color .18s ease, transform .18s ease;
        }
        .cc-navlink:hover {
          background: rgba(255,255,255,.07);
          color: #fff;
          transform: translateX(2px);
        }
        .cc-navlink .cc-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.06);
          flex-shrink: 0;
          transition: background .18s ease;
        }
        .cc-navlink.active {
          background: ${T.terra};
          color: #fff;
          font-weight: 700;
          box-shadow: 0 6px 16px -4px rgba(196,98,45,.55);
        }
        .cc-navlink.active .cc-icon-box {
          background: rgba(255,255,255,.18);
        }
        .cc-navlink.active::before {
          content: "";
          position: absolute;
          left: -2px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          border-radius: 99px;
          background: #fff;
        }
        .cc-group-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(255,255,255,.32);
          padding: 16px 16px 6px;
        }
        .cc-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .cc-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 99px; }
      `}</style>

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "26px 22px 22px",
          borderBottom: "1px solid rgba(255,255,255,.1)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: `linear-gradient(135deg, ${T.terra}, #A8502A)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(196,98,45,.4)",
          }}
        >
          <Sparkles size={18} color={T.white} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 800,
              fontSize: 18,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            CareConnect
          </div>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.45)",
              marginTop: 2,
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="cc-sidebar-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && <div className="cc-group-label">{group.label}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {group.links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `cc-navlink${isActive ? " active" : ""}`}
                >
                  <span className="cc-icon-box">
                    <Icon size={15} />
                  </span>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 22px",
          borderTop: "1px solid rgba(255,255,255,.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
          CareConnect © {new Date().getFullYear()}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10.5,
            color: "rgba(255,255,255,.4)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ADE80",
              boxShadow: "0 0 6px rgba(74,222,128,.7)",
            }}
          />
          Online
        </span>
      </div>
    </div>
  );
}