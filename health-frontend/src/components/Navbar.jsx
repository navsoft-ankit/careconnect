import { LogOut, ShieldCheck, Bell } from "lucide-react";

const T = {
  cream: "#F5F0E8",
  green: "#2D5016",
  greenLight: "#EBF2E3",
  terra: "#C4622D",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
  red: "#B3441F",
  redLight: "#FAF0EA",
};

export default function Navbar() {
  return (
    <div
      style={{
        height: 68,
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        boxShadow: "0 2px 10px rgba(0,0,0,.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        marginLeft: 268,
        fontFamily: "'Inter', sans-serif",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left — page context */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: T.greenLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldCheck size={15} color={T.green} />
        </div>
        <div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: 16,
              color: T.ink,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Admin Panel
          </h2>
          <p style={{ fontSize: 11, color: T.muted, margin: "2px 0 0" }}>
            CareConnect · Control Center
          </p>
        </div>
      </div>

      {/* Right — actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          style={{
            position: "relative",
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${T.border}`,
            background: T.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background .15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.cream)}
          onMouseLeave={(e) => (e.currentTarget.style.background = T.white)}
        >
          <Bell size={15} color={T.muted} />
          <span
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.terra,
            }}
          />
        </button>

        <div style={{ width: 1, height: 26, background: T.border }} />

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: T.redLight,
            color: T.red,
            border: "none",
            borderRadius: 999,
            padding: "9px 18px",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "background .15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F5DED0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = T.redLight)}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}