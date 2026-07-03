import { Link } from "react-router-dom";
import { Users, HeartPulse, Ambulance, ShieldCheck } from "lucide-react";

const STATS = [
    { value: "250+", label: "Specialist doctors", icon: Users },
    { value: "15K+", label: "Patients cared for", icon: HeartPulse },
    { value: "24/7", label: "Emergency response", icon: Ambulance },
    { value: "100%", label: "Encrypted records", icon: ShieldCheck },
];

const PRINCIPLES = [
    {
        title: "Care shouldn't wait on logistics",
        body: "A booking form is the last thing anyone wants to think about when they're unwell. We built ours to take under a minute.",
    },
    {
        title: "Trust is earned in the details",
        body: "Every doctor on CareConnect is verified before they ever appear in a search result. No exceptions, no shortcuts.",
    },
    {
        title: "Emergencies don't keep office hours",
        body: "Our ambulance and on-call network runs at 2am the same way it runs at 2pm — because that's when it actually matters.",
    },
];

export default function AboutUs() {

    return (
        <div className="bg-[#FAF8F3] text-[#16332B]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ───────────────────── MASTHEAD ───────────────────── */}
            <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 pt-24 pb-16">
                <p className="text-[13px] uppercase tracking-[0.22em] text-[#3E7C59] font-semibold mb-6">
                    About CareConnect
                </p>
                <h1
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                    className="leading-[1.04] tracking-tight max-w-3xl"
                >
                    <span style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}>
                        Healthcare that meets you
                    </span>
                    <br />
                    <span
                        className="italic text-[#B5562C]"
                        style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
                    >
                        where you actually are.
                    </span>
                </h1>
            </section>

            {/* ───────────────────── ASYMMETRIC PHOTO + LETTER OPEN ─────────────────────
          Signature element: framed as a short letter rather than a
          marketing paragraph, with an off-grid image rather than a
          centered hero shot. */}
            <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 pb-24">
                <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

                    <div className="order-2 lg:order-1 pt-2">
                        <p
                            className="text-[22px] leading-[1.65] text-[#16332B]/85"
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400 }}
                        >
                            We started CareConnect after watching too many people
                            delay care simply because the system around it was
                            exhausting — the calls, the waiting rooms, the forms.
                        </p>
                        <p className="mt-7 text-[16px] leading-8 text-[#16332B]/65 max-w-lg">
                            So we rebuilt the parts that matter: finding a doctor you
                            trust, getting a same-day slot, having medicine arrive
                            instead of having to go fetch it, and knowing an ambulance
                            is one tap away if things turn serious. None of it is
                            flashy. All of it is meant to disappear into the
                            background the moment you need it.
                        </p>

                        <div className="flex gap-4 mt-10">
                            <Link
                                to="/patient/doctors"
                                className="bg-[#16332B] text-white px-7 py-3.5 rounded-full font-semibold text-[15px] hover:bg-[#0F231D] transition"
                            >
                                Find a doctor
                            </Link>
                            <Link
                                to="/patient/appointments"
                                className="border border-[#16332B]/25 px-7 py-3.5 rounded-full font-medium text-[15px] hover:border-[#16332B] transition"
                            >
                                Book an appointment
                            </Link>
                        </div>
                    </div>

                    {/* Off-grid image, intentionally not centered/symmetric */}
                    <div className="order-1 lg:order-2 relative">
                        <div className="rounded-[24px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(22,51,43,0.25)]">
                            <img
                                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80"
                                alt="Doctor reviewing a patient's chart"
                                className="w-full h-[460px] object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-7 -left-7 bg-white rounded-[20px] shadow-xl px-6 py-5 max-w-[200px] border border-[#E4DFD3]">
                            <p
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="text-[2rem] leading-none text-[#16332B]"
                            >
                                20+
                            </p>
                            <p className="text-[13px] text-[#16332B]/55 mt-1.5">
                                years of combined clinical experience on our panel
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────────────────── STATS STRIP ───────────────────── */}
            <section className="border-y border-[#E4DFD3] bg-white">
                <div className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32">
                    <div className="grid grid-cols-2 lg:grid-cols-4">
                        {STATS.map(({ value, label, icon: Icon }, i) => (
                            <div
                                key={label}
                                className={`py-11 px-2 lg:px-6 ${i !== 0 ? "border-l border-[#E4DFD3]" : ""}`}
                            >
                                <Icon size={20} className="text-[#3E7C59]" strokeWidth={1.75} />
                                <p
                                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                    className="text-[2.25rem] leading-none mt-4"
                                >
                                    {value}
                                </p>
                                <p className="text-[13px] text-[#16332B]/55 mt-1.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────── PRINCIPLES ─────────────────────
          Three short convictions, set as quotes rather than a
          generic "why choose us" icon grid. */}
            <section className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32-10 py-24">
                <p className="text-[13px] uppercase tracking-[0.18em] text-[#3E7C59] font-semibold mb-4">
                    What we believe
                </p>
                <h2
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                    className="text-[2.25rem] leading-[1.1] max-w-xl mb-14"
                >
                    A few convictions we build every feature against.
                </h2>

                <div className="space-y-0">
                    {PRINCIPLES.map((p, i) => (
                        <div
                            key={p.title}
                            className={`grid md:grid-cols-[60px_1fr_1.2fr] gap-6 md:gap-10 py-9 ${i !== 0 ? "border-t border-[#E4DFD3]" : ""
                                }`}
                        >
                            <span
                                className="text-[15px] text-[#16332B]/35"
                                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                            >
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <h3
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="text-[1.4rem] leading-snug"
                            >
                                {p.title}
                            </h3>
                            <p className="text-[15px] leading-7 text-[#16332B]/65">{p.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ───────────────────── CLOSING ───────────────────── */}
            <section className="bg-white border-t border-[#E4DFD3]">
                <div className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 py-24 text-center">
                    <h2
                        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                        className="text-[2.5rem] leading-[1.1] max-w-2xl mx-auto"
                    >
                        Quality care, available the moment you need it —
                        <span className="italic text-[#3E7C59]"> not after.</span>
                    </h2>
                    <Link
                        to="/patient/doctors"
                        className="inline-block mt-9 bg-[#16332B] text-white px-9 py-4 rounded-full font-semibold text-[15px] hover:bg-[#0F231D] transition"
                    >
                        Start with a doctor
                    </Link>
                </div>
            </section>
            <footer className="bg-[#16332B] mt-28 text-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">

                        <div>
                            <h2 className="text-2xl font-medium">CareConnect.</h2>
                            <p className="text-white/60 mt-4 font-[system-ui,sans-serif] text-[15px] leading-6">
                                Your trusted digital healthcare partner.
                            </p>
                        </div>

                        <div className="font-[system-ui,sans-serif]">
                            <h3 className="font-medium mb-4 font-[Georgia,serif] text-lg">Services</h3>
                            <ul className="space-y-2 text-white/60 text-[15px]">
                                <li>
                                    <Link to="/patient/doctors">Doctors</Link>
                                </li>
                                <li>
                                    <Link to="/patient/products">Medicines</Link>
                                </li>

                                <li>
                                    <Link to="/patient/ambulance">Ambulance</Link>
                                </li>
                                <li>
                                    <Link to="/patient/appointments">Appointments</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="font-[system-ui,sans-serif]">
                            <h3 className="font-medium mb-4 font-[Georgia,serif] text-lg">Company</h3>
                            <ul className="space-y-2 text-white/60 text-[15px]">
                                <li>About Us</li>
                                <li>Privacy Policy</li>
                                <li>Terms & Conditions</li>
                                <li>Support</li>
                            </ul>
                        </div>

                        <div className="font-[system-ui,sans-serif]">
                            <h3 className="font-medium mb-4 font-[Georgia,serif] text-lg">Contact</h3>
                            <p className="text-white/60 text-[15px]">support@careconnect.com</p>
                            <p className="text-white/60 mt-3 text-[15px]">+91 99999 00000</p>
                        </div>

                    </div>

                    <div className="border-t border-white/10 py-6 text-center text-white/50 font-[system-ui,sans-serif] text-sm">
                        © 2026 CareConnect. All Rights Reserved.
                    </div>

                </footer>
        </div>
    );
}