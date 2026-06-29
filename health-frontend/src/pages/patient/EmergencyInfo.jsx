import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PhoneCall,
  Ambulance,
  Flame,
  ShieldAlert,
  Siren,
} from "lucide-react";

// ── Content data ────────────────────────────────────────────────
// Kept as data so the layout stays clean and the copy can be edited
// without touching markup.

const EMERGENCY_LINES = [
  { label: "Ambulance", number: "102", icon: Ambulance, tone: "#B5562C" },
  { label: "National Emergency", number: "112", icon: PhoneCall, tone: "#16332B" },
  { label: "Police", number: "100", icon: ShieldAlert, tone: "#3E7C59" },
  { label: "Fire Service", number: "101", icon: Flame, tone: "#8B5E34" },
];

const SYMPTOMS = [
  {
    name: "Heart attack",
    urgency: "Call immediately",
    glyph: "♥",
    signs: [
      "Pressure or pain across the chest",
      "Pain spreading to arm, jaw, or back",
      "Shortness of breath",
      "Cold sweat, sudden nausea",
    ],
  },
  {
    name: "Stroke",
    urgency: "Act within minutes",
    glyph: "◐",
    signs: [
      "One side of the face drooping",
      "Arm weakness on one side",
      "Slurred or confused speech",
      "Sudden loss of balance",
    ],
  },
  {
    name: "Breathing distress",
    urgency: "Don't wait it out",
    glyph: "≈",
    signs: [
      "Gasping or can't complete a sentence",
      "Blue tint at lips or fingertips",
      "Tightness across the chest",
      "Visible panic or confusion",
    ],
  },
  {
    name: "Heavy bleeding",
    urgency: "Stop the loss first",
    glyph: "—",
    signs: [
      "Apply firm, direct pressure",
      "Raise the wound above heart level",
      "Don't lift a soaked dressing — add more on top",
      "Keep talking to the person; watch for fainting",
    ],
  },
];

const FIRST_AID = [
  {
    title: "CPR",
    body: "Call for help first. Then push hard and fast at the center of the chest — about two compressions per second — until paramedics take over.",
  },
  {
    title: "Burns",
    body: "Run cool water over the burn for a full twenty minutes. Skip the ice, the butter, the toothpaste — just water and time.",
  },
  {
    title: "Fractures",
    body: "Movement is the enemy. Support the limb in the position you found it and wait for transport rather than trying to splint it yourself.",
  },
  {
    title: "Head injury",
    body: "Keep them still and keep them talking. Any drowsiness, vomiting, or confusion after a knock to the head needs a hospital, not a nap.",
  },
];

export default function EmergencyInfo() {
  const [activeSymptom, setActiveSymptom] = useState(0);

  return (
    <div className="bg-[#FAF8F3] text-[#16332B]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ───────────────────── HERO ─────────────────────
          Signature element: a literal countdown framed as the
          most important sentence on the page, not a stat grid. */}
      <section className="relative bg-[#16332B] text-[#FAF8F3] overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-28 pb-24">

          <p className="text-[13px] uppercase tracking-[0.22em] text-[#E8A07A] font-medium mb-8">
            Emergency care, CareConnect
          </p>

          <h1
            className="leading-[1.02] tracking-tight"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 500,
              fontSize: "clamp(2.75rem, 6vw, 5.5rem)",
            }}
          >
            The first five
            <br />
            minutes decide
            <br />
            <span className="italic text-[#E8A07A]">everything.</span>
          </h1>

          <p className="mt-10 max-w-md text-[17px] leading-8 text-[#FAF8F3]/75">
            What you do before help arrives matters more than almost
            anything a hospital does after. This page is built to be
            read in under a minute, in the middle of an emergency.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <Link
              to="/patient/ambulance"
              className="inline-flex items-center gap-2 bg-[#FAF8F3] text-[#16332B] px-7 py-3.5 rounded-full font-semibold text-[15px] hover:bg-white transition"
            >
              <Siren size={16} />
              Book an ambulance
            </Link>
            <a
              href="tel:102"
              className="inline-flex items-center gap-2 border border-[#FAF8F3]/35 px-7 py-3.5 rounded-full font-medium text-[15px] hover:bg-[#FAF8F3]/10 transition"
            >
              Call 102 now
            </a>
          </div>
        </div>

        {/* Subtle ambient motion — a single slow-drifting glow, not a busy animation */}
        <div
          className="absolute -right-40 -top-40 w-[520px] h-[520px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #B5562C 0%, transparent 70%)",
            animation: "drift 14s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes drift {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-30px, 30px) scale(1.08); }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; transition: none !important; }
          }
        `}</style>
      </section>

      {/* ───────────────────── EMERGENCY LINES ─────────────────────
          A quiet, scannable strip rather than four loud icon cards. */}
      <section className="border-b border-[#E4DFD3]">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {EMERGENCY_LINES.map(({ label, number, icon: Icon, tone }, i) => (
              <a
                key={label}
                href={`tel:${number}`}
                className={`group py-9 px-2 lg:px-6 flex flex-col gap-3 hover:bg-white transition-colors ${
                  i !== 0 ? "border-l border-[#E4DFD3]" : ""
                }`}
              >
                <Icon size={20} style={{ color: tone }} strokeWidth={1.75} />
                <div>
                  <p
                    className="leading-none"
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "2.25rem", fontWeight: 500 }}
                  >
                    {number}
                  </p>
                  <p className="text-[13px] text-[#16332B]/55 mt-1.5">{label}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── RECOGNIZE SYMPTOMS ─────────────────────
          Interactive tab-list: one condition expanded at a time,
          mirroring how a person actually scans for "is this it?" */}
      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-24">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-16">

          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-[#3E7C59] font-semibold mb-4">
              Recognize it
            </p>
            <h2
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
              className="text-[2.25rem] leading-[1.1]"
            >
              Know the signs before you need to.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[#16332B]/60">
              Tap a condition. The faster you recognize it, the faster
              the right help arrives.
            </p>
          </div>

          <div>
            {/* Tab strip */}
            <div className="flex flex-wrap gap-2 mb-8">
              {SYMPTOMS.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => setActiveSymptom(i)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-all ${
                    activeSymptom === i
                      ? "bg-[#16332B] text-[#FAF8F3]"
                      : "bg-white border border-[#E4DFD3] text-[#16332B]/70 hover:border-[#16332B]/30"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Active panel */}
            <div className="bg-white rounded-[28px] border border-[#E4DFD3] p-9 lg:p-11">
              <div className="flex items-start justify-between gap-6 mb-7">
                <div>
                  <h3
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                    className="text-[1.9rem] leading-tight"
                  >
                    {SYMPTOMS[activeSymptom].name}
                  </h3>
                  <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#B5562C]">
                    {SYMPTOMS[activeSymptom].urgency}
                  </p>
                </div>
                <span
                  className="text-5xl leading-none text-[#16332B]/10 select-none"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  aria-hidden="true"
                >
                  {SYMPTOMS[activeSymptom].glyph}
                </span>
              </div>

              <ul className="space-y-3.5">
                {SYMPTOMS[activeSymptom].signs.map((sign) => (
                  <li key={sign} className="flex items-start gap-3 text-[15px] leading-7 text-[#16332B]/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C59] mt-2.5 shrink-0" />
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── FIRST AID ─────────────────────
          Editorial two-column "field notes" rather than icon cards. */}
      <section className="bg-white border-t border-[#E4DFD3]">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-24">

          <div className="max-w-xl mb-14">
            <p className="text-[13px] uppercase tracking-[0.18em] text-[#3E7C59] font-semibold mb-4">
              While you wait
            </p>
            <h2
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
              className="text-[2.25rem] leading-[1.1]"
            >
              Field notes, for the minutes before help arrives.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {FIRST_AID.map((item, i) => (
              <div key={item.title} className="flex gap-6">
                <span
                  className="text-[15px] text-[#16332B]/35 pt-1.5 shrink-0 w-6"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[19px] font-semibold mb-2">{item.title}</h3>
                  <p className="text-[15px] leading-7 text-[#16332B]/65">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── CLOSING CTA ───────────────────── */}
      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-20">
        <div className="rounded-[28px] bg-[#16332B] text-[#FAF8F3] px-10 lg:px-14 py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
              className="text-[1.85rem] leading-tight"
            >
              If in doubt, don't wait it out.
            </h2>
            <p className="mt-3 text-[#FAF8F3]/70 text-[15px] max-w-md">
              Our ambulance network responds around the clock, every day of the year.
            </p>
          </div>
          <Link
            to="/patient/ambulance"
            className="shrink-0 bg-[#FAF8F3] text-[#16332B] px-8 py-4 rounded-full font-semibold text-[15px] hover:bg-white transition whitespace-nowrap"
          >
            Book ambulance →
          </Link>
        </div>
      </section>
    </div>
  );
}