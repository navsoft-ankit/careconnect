import { useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    User,
    CheckCircle2,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../api/axios";

const INFO_CARDS = [
    {
        icon: Phone,
        title: "Call us",
        lines: ["+91 98765 43210", "Mon–Sat, 9am–8pm"],
    },
    {
        icon: Mail,
        title: "Email us",
        lines: ["support@careconnect.com", "We reply within 24 hours"],
    },
    {
        icon: MapPin,
        title: "Visit us",
        lines: ["12 Park Street, Kolkata", "West Bengal, India"],
    },
    {
        icon: Clock,
        title: "Working hours",
        lines: ["Mon – Sat: 9:00 – 20:00", "Sunday: Emergency only"],
    },
];

function Field({ label, icon, children }) {
    return (
        <div>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-[#16332B] mb-2">
                {icon}
                {label}
            </label>
            {children}
        </div>
    );
}

const inputClass =
    "w-full h-12 px-4 rounded-xl border border-[#E4DFD3] bg-[#FAF8F3] text-[#16332B] text-sm placeholder:text-[#16332B]/35 focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 transition";

export default function ContactUs() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit() {
        if (!form.name.trim()) return toast.error("Please enter your name.");
        if (!form.email.trim()) return toast.error("Please enter your email.");
        if (!form.message.trim()) return toast.error("Please write a message.");

        try {
            setSubmitting(true);
            await api.post("/patient/contact", form);
            setSent(true);
            setForm({ name: "", email: "", subject: "", message: "" });
            toast.success("Message sent — we'll get back to you soon.");
        } catch (err) {
            toast.error(err?.response?.data || "Couldn't send your message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <Toaster position="top-right" />

            <div
                className="min-h-screen bg-[#FAF8F3] text-[#16332B]"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
                <div
                    className="w-full mx-auto"
                    style={{
                        maxWidth: "1500px",
                        padding: "48px 40px",
                    }}
                >

                    {/* ── Header ── */}
                    <div className="mb-12 max-w-xl">
                        <p className="text-[13px] uppercase tracking-[0.22em] text-[#B5562C] font-semibold mb-5">
                            Get in touch
                        </p>
                        <h1
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="leading-[1.05] tracking-tight"
                        >
                            <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)" }}>
                                We're here
                            </span>
                            <br />
                            <span
                                className="italic text-[#3E7C59]"
                                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)" }}
                            >
                                whenever you need us.
                            </span>
                        </h1>
                        <p className="mt-5 text-[16px] leading-7 text-[#16332B]/60">
                            Questions about an appointment, a bill, or something else entirely —
                            send us a note and our team will get back to you.
                        </p>
                    </div>

                    {/* ── Info cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
                        {INFO_CARDS.map(({ icon: Icon, title, lines }) => (
                            <div
                                key={title}
                                className="bg-white rounded-[20px] border border-[#E4DFD3] p-5 hover:border-[#16332B]/25 hover:shadow-[0_15px_35px_-22px_rgba(22,51,43,0.25)] transition-all"
                            >
                                <div className="w-11 h-11 rounded-xl bg-[#EBF2E3] flex items-center justify-center mb-4">
                                    <Icon size={20} strokeWidth={1.75} className="text-[#3E7C59]" />
                                </div>
                                <h3
                                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                    className="text-[15px] mb-2"
                                >
                                    {title}
                                </h3>
                                {lines.map((line) => (
                                    <p key={line} className="text-[13px] text-[#16332B]/55 leading-6">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* ── Emergency banner ── */}
                    <a
                        href="tel:108"
                        className="flex items-center gap-4 bg-[#9E211A] rounded-[20px] p-5 text-white mb-14 hover:bg-[#86190F] transition group"
                    >
                        <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                            <Phone size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold leading-tight text-[15px]">Life-threatening emergency?</p>
                            <p className="text-white/75 text-[13px] mt-0.5">Call 108 directly — don't wait for a reply here</p>
                        </div>
                        <span className="shrink-0 bg-white text-[#9E211A] font-semibold px-5 py-2.5 rounded-full text-sm group-hover:bg-white/90 transition">
                            Call 108
                        </span>
                    </a>

                    {/* ── Form ── */}
                    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10">
                        <div>
                            <h2
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="text-[1.5rem] mb-3"
                            >
                                Send us a message
                            </h2>
                            <p className="text-[14px] text-[#16332B]/55 leading-6 max-w-sm">
                                Fill in the form and our support team will reach out to you over
                                email, usually within one business day.
                            </p>
                        </div>

                        <div className="bg-white rounded-[24px] border border-[#E4DFD3] p-8">
                            {sent ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-[#EBF2E3] flex items-center justify-center">
                                        <CheckCircle2 size={30} className="text-[#3E7C59]" />
                                    </div>
                                    <h3
                                        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                        className="text-[1.2rem] mt-5"
                                    >
                                        Message sent
                                    </h3>
                                    <p className="text-[14px] text-[#16332B]/55 mt-2">
                                        We'll get back to you shortly.
                                    </p>
                                    <button
                                        onClick={() => setSent(false)}
                                        className="mt-6 text-[13px] font-semibold text-[#16332B] hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <Field label="Your name" icon={<User size={14} className="text-[#3E7C59]" />}>
                                            <input
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field label="Email" icon={<Mail size={14} className="text-[#3E7C59]" />}>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>

                                    <Field label="Subject" icon={<MessageSquare size={14} className="text-[#3E7C59]" />}>
                                        <input
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            placeholder="What's this about?"
                                            className={inputClass}
                                        />
                                    </Field>

                                    <Field label="Message" icon={<MessageSquare size={14} className="text-[#3E7C59]" />}>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Tell us how we can help…"
                                            className="w-full px-4 py-3 rounded-xl border border-[#E4DFD3] bg-[#FAF8F3] text-[#16332B] text-sm placeholder:text-[#16332B]/35 focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 transition resize-none"
                                        />
                                    </Field>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2 bg-[#16332B] hover:bg-[#0F231D] disabled:opacity-60 text-white py-3 rounded-xl font-medium text-sm transition"
                                    >
                                        <Send size={15} />
                                        {submitting ? "Sending…" : "Send message"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}