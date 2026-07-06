import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
  Users,
  Stethoscope,
  Building2,
  Package,
  Ambulance,
  CalendarDays,
  ShoppingBag,
  Clock3,
  Truck,
  Mail,
} from "lucide-react";

const T = {
  cream: "#F5F0E8",
  green: "#2D5016",
  greenLight: "#EBF2E3",
  terra: "#C4622D",
  terraLight: "#FAF0EA",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
};

const STATS = [
  { key: "totalPatients", label: "Patients", icon: Users, accent: T.green },
  { key: "totalDoctors", label: "Doctors", icon: Stethoscope, accent: T.green },
  { key: "totalHospitals", label: "Hospitals", icon: Building2, accent: T.green },
  { key: "totalProducts", label: "Products", icon: Package, accent: T.terra },
  { key: "totalAmbulances", label: "Ambulances", icon: Ambulance, accent: T.terra },
  { key: "totalAppointments", label: "Appointments", icon: CalendarDays, accent: T.green },
  { key: "totalOrders", label: "Orders", icon: ShoppingBag, accent: T.terra },
  { key: "pendingAppointments", label: "Pending Appointments", icon: Clock3, accent: "#DC2626" },
  { key: "pendingAmbulanceRequests", label: "Pending Ambulance", icon: Truck, accent: "#DC2626" },
  { key: "totalMessages", label: "Contact Messages", icon: Mail, accent: T.green},
];

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div
      style={{
        background: T.white,
        borderRadius: 20,
        padding: "22px 24px",
        border: `1px solid ${T.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{label}</p>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 36, margin: "8px 0 0", color: T.ink }}>
          {value}
        </h2>
      </div>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: accent + "1F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={accent} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
      `}</style>

      <Sidebar />
      <div style={{ marginLeft: 264, background: T.cream, minHeight: "100vh" }}>
        <Navbar />

        <div style={{ padding: "32px 28px" }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.terra, margin: "0 0 6px" }}>
              Overview
            </p>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 30, color: T.ink, margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>
              A quick snapshot of everything happening across CareConnect.
            </p>
          </div>

          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 18,
              }}
            >
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 96,
                    borderRadius: 20,
                    background: "#EDE7D9",
                    animation: "cc-pulse 1.4s ease-in-out infinite",
                  }}
                />
              ))}
              <style>{`@keyframes cc-pulse{0%,100%{opacity:1}50%{opacity:.55}}`}</style>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 18,
              }}
            >
              {STATS.map((s) => (
                <StatCard key={s.key} label={s.label} value={data[s.key] || 0} accent={s.accent} icon={s.icon} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}