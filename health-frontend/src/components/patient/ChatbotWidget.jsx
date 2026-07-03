import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ===== CareConnect design tokens =====
const COLORS = {
  cream: "#F5F0E8",
  forest: "#2D5016",
  terracotta: "#C4622D",
  white: "#FFFFFF",
  textDark: "#2A2A2A",
  textMuted: "#7A7A72",
  border: "#E3DACB",
};

const ROUTE_MAP = {
  appointments: "/patient/appointments",
  doctors: "/patient/doctors",
  ambulance: "/patient/ambulance",
  prescriptions: "/patient/prescriptions",
  medicine: "/patient/products",
  wallet: "/patient/wallet",
  profile: "/patient/profile",
  dashboard: "/patient/dashboard",
};

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi, I'm CareConnect Assistant. Ask me anything about appointments, doctors, ambulance, prescriptions, or medicines.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: trimmed });
      const { reply, action } = res.data;

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);

      if (action && action !== "none" && ROUTE_MAP[action]) {
        setTimeout(() => {
          navigate(ROUTE_MAP[action]);
          setOpen(false);
        }, 700);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open CareConnect Assistant"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: COLORS.forest,
          color: COLORS.white,
          boxShadow: "0 8px 24px rgba(45, 80, 22, 0.35)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          transition: "transform 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <LogoMark size={28} color={COLORS.white} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "28px",
            width: "360px",
            maxWidth: "calc(100vw - 40px)",
            height: "500px",
            maxHeight: "calc(100vh - 140px)",
            background: COLORS.white,
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: COLORS.forest,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogoMark size={18} color={COLORS.white} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  color: COLORS.white,
                  fontSize: "15px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                CareConnect Assistant
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>
                Always here to help
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: COLORS.cream,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  background: m.role === "user" ? COLORS.terracotta : COLORS.white,
                  color: m.role === "user" ? COLORS.white : COLORS.textDark,
                  padding: "10px 14px",
                  borderRadius:
                    m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  fontSize: "13.5px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  border: m.role === "bot" ? `1px solid ${COLORS.border}` : "none",
                  boxShadow: m.role === "bot" ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
                }}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  display: "flex",
                  gap: "4px",
                }}
              >
                <Dot delay="0s" />
                <Dot delay="0.15s" />
                <Dot delay="0.3s" />
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px",
              borderTop: `1px solid ${COLORS.border}`,
              display: "flex",
              gap: "8px",
              background: COLORS.white,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about appointments, doctors..."
              style={{
                flex: 1,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                padding: "10px 12px",
                fontSize: "13.5px",
                outline: "none",
                fontFamily: "Inter, sans-serif",
                color: COLORS.textDark,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: COLORS.forest,
                border: "none",
                borderRadius: "10px",
                width: "42px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cc-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function Dot({ delay }) {
  return (
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#2D5016",
        display: "inline-block",
        animation: `cc-bounce 1s infinite`,
        animationDelay: delay,
      }}
    />
  );
}

function LogoMark({ size = 24, color = "#2D5016" }) {
  // Simple inline SVG mark — a stylized heart + pulse line, matches CareConnect brand
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7-4.5-9.5-9C0.7 7.5 2 4 5.5 4c2 0 3.3 1.1 4.5 2.6C11.2 5.1 12.5 4 14.5 4 18 4 19.3 7.5 21.5 11c-2.5 4.5-9.5 9-9.5 9z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M4 12h3l1.5-3 2 5 1.5-3h4"
        stroke={color === "#FFFFFF" ? "#2D5016" : "#F5F0E8"}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}