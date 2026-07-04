import { useEffect, useState } from "react";
import api from "../../api/axios";
import { User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Chatbot from "./Chatbot";
import { Stethoscope, Pill, Ambulance, CalendarCheck } from "lucide-react";
import {
  HeartPulse,
  Brain,
  Bone,
  Eye,
  Baby,
} from "lucide-react";

// Stock fallback photos — keyed by doctor.id so the same doctor always
// gets the same photo, regardless of list order/filtering.
const STOCK_IMAGES = [
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&q=80",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&q=80",
];

function getStockImage(doctorId) {
    const idx = doctorId % STOCK_IMAGES.length;
    return STOCK_IMAGES[idx];
}

// Some doctor names already include "Dr." (e.g. from how they were created
// in the admin panel), others don't. This avoids "Dr. Dr. Ananya Sen".
function displayDoctorName(name) {
    if (!name) return "";
    return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}

export default function Dashboard() {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const userName = localStorage.getItem("name") || "My Account";


    useEffect(() => {
        loadData();
    }, [token]);

    const loadData = async () => {
        try {
            const docRes = await api.get("/patient/doctors");
            setDoctors(docRes.data || []);

            if (token) {
                const appRes = await api.get("/patient/appointments");
                const orderRes = await api.get("/patient/orders");

                setAppointments(appRes.data || []);
                setOrders(orderRes.data || []);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const filteredDoctors = doctors.filter((d) =>
        (d.name || "").toLowerCase().includes(search.toLowerCase())
    );

    // Sends the search box + specialization dropdown to the full Doctors page,
    // carrying the values along as query params.
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (specialization && specialization !== "All Specializations") {
            params.set("specialization", specialization);
        }
        navigate(`/patient/doctors?${params.toString()}`);
    };

    return (
        <>
            <div className="min-h-screen bg-[#FAF8F3] text-[#16332B] font-[Georgia,serif]">

                {/* NAVBAR */}
                <header className="sticky top-0 z-50 bg-[#FAF8F3]/95 backdrop-blur-sm border-b border-[#E4DFD3]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

                        <div className="flex items-center gap-2">
                            <span className="text-2xl">✦</span>
                            <span className="text-2xl font-semibold tracking-tight">CareConnect.</span>
                        </div>

                        <nav className="hidden lg:flex items-center gap-9 font-[system-ui,sans-serif] text-[15px] text-[#16332B]/80">
                            <a href="/patient/products" className="hover:text-[#16332B] transition">Medicines</a>
                            <a
                                href={token ? "/patient/appointments" : "/login"}
                                className="hover:text-[#16332B] transition"
                            >
                                Appointments
                            </a>
                            <a
                                href={token ? "/patient/orders" : "/login"}
                                className="hover:text-[#16332B] transition"
                            >
                                Orders
                            </a>
                            <a href="/patient/EmergencyInfo" className="hover:text-[#16332B] transition">Emergency Info</a>
                            <a href="/patient/Locations" className="hover:text-[#16332B] transition">Locations</a>

                            <a href="/patient/AboutUs" className="flex items-center gap-1 hover:text-[#16332B] transition">
                                AboutUs <span className="text-xs">▾</span>
                            </a>
                        </nav>
                        <div className="hidden lg:flex items-center gap-4">

                            {token ? (
                                <button
                                    onClick={() => navigate("/patient/profile")}
                                    className="flex items-center gap-3 bg-white border border-[#E4DFD3] rounded-full px-3 py-2 shadow-sm hover:shadow-lg transition"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#16332B] text-white flex items-center justify-center">
                                        <User size={18} />
                                    </div>

                                    <div className="text-left">
                                        <p className="text-sm font-semibold">{userName}</p>
                                        <p className="text-xs text-gray-500">My Profile</p>
                                    </div>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="text-[#16332B] font-medium hover:underline"
                                    >
                                        Sign In
                                    </button>

                                    <button
                                        onClick={() => navigate("/register")}
                                        className="bg-[#16332B] text-white px-5 py-2 rounded-full hover:bg-[#0F231D]"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}

                        </div>


                        <button
                            className="lg:hidden text-2xl"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menu"
                        >
                            ☰
                        </button>
                    </div>

                    {menuOpen && (
                        <div className="lg:hidden border-t border-[#E4DFD3] px-6 py-6 flex flex-col gap-4 font-[system-ui,sans-serif] text-[15px]">
                            <a href="/patient/ambulance">Emergency Info</a>
                            <a href="/patient/doctors">Locations</a>
                            <a href="/patient/orders">Orders</a>
                            <a href="#">For You</a>
                            <a href="#">For Family</a>
                            <a href="#">For Business</a>
                            <a href="#" className="font-medium">Log in</a>
                            <a
                                href="/patient/doctors"
                                className="bg-[#16332B] text-white px-6 py-3 rounded-full font-medium text-center"
                            >
                                Sign up
                            </a>
                        </div>
                    )}
                </header>

                {/* HERO */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-14 lg:pt-20 grid lg:grid-cols-2 gap-12 items-center">

                    <div>
                        <h1 className="text-5xl lg:text-6xl leading-[1.08] font-normal">
                            No ordinary
                            <br />
                            doctor's office
                        </h1>

                        <p className="mt-7 text-lg leading-8 text-[#16332B]/75 font-[system-ui,sans-serif] max-w-md">
                            Get 24/7 on-demand virtual care, or book same-day visits
                            in person or over video — with doctors who actually
                            have time for you.
                        </p>

                        <div className="flex flex-wrap items-center gap-6 mt-9 font-[system-ui,sans-serif]">
                            <button
                                onClick={() =>
                                    token
                                        ? navigate("/patient/doctors")
                                        : navigate("/login")
                                }
                                className="bg-[#16332B] text-white px-7 py-4 rounded-full"
                            >
                                Book Appointment
                            </button>
                            <button
                                onClick={() =>
                                    token
                                        ? navigate("/patient/products")
                                        : navigate("/login")
                                }
                                className="border border-[#16332B] px-7 py-4 rounded-full font-medium hover:bg-[#16332B] hover:text-white transition"
                            >
                                Buy Medicines
                            </button>

                        </div>

                        <p className="mt-5 text-sm font-[system-ui,sans-serif] text-[#16332B]/60">
                            <button
                                onClick={() =>
                                    token
                                        ? navigate("/patient/ambulance")
                                        : navigate("/login")
                                }
                                className="underline hover:text-[#16332B]"
                            >
                                Need urgent help? Book an ambulance →
                            </button>
                        </p>
                    </div>

                    <div className="relative">
                        <div className="rounded-[28px] overflow-hidden aspect-[4/3]">
                            <img
                                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=900&q=80"
                                alt="Doctor consulting with patient"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="absolute -left-6 top-8 bg-white rounded-2xl shadow-lg p-5 hidden sm:block">
                            <h3 className="text-2xl font-semibold text-[#16332B]">250+</h3>
                            <p className="text-sm text-[#16332B]/60 font-[system-ui,sans-serif] mt-1">
                                Specialist Doctors
                            </p>
                        </div>

                        <div className="absolute -right-4 -bottom-6 bg-white rounded-2xl shadow-lg p-5 hidden sm:block">
                            <h3 className="text-2xl font-semibold text-[#B5562C]">24/7</h3>
                            <p className="text-sm text-[#16332B]/60 font-[system-ui,sans-serif] mt-1">
                                Emergency Support
                            </p>
                        </div>
                    </div>

                </section>

                {/* SEARCH */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-20">
                    <div className="bg-white rounded-3xl shadow-sm border border-[#E4DFD3] p-7 lg:p-8">
                        <h2 className="text-2xl font-medium mb-5">Find your doctor</h2>

                        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 font-[system-ui,sans-serif]">
                            <input
                                type="text"
                                placeholder="Search by doctor name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="border border-[#E4DFD3] rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-[#16332B]/30 bg-[#FAF8F3]"
                            />

                            <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                className="border border-[#E4DFD3] rounded-full px-6 py-4 bg-[#FAF8F3] outline-none focus:ring-2 focus:ring-[#16332B]/30"
                            >
                                <option value="">All Specializations</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Orthopedic">Orthopedic</option>
                                <option value="Dermatology">Dermatology</option>
                            </select>

                            <button
                                onClick={handleSearch}
                                className="bg-[#16332B] text-white rounded-full font-medium px-8 hover:bg-[#0F231D] transition"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-20">
                    <div className="grid md:grid-cols-4 gap-6 font-[system-ui,sans-serif]">

                        <div className="bg-white rounded-2xl p-7 border border-[#E4DFD3]">
                            <h2 className="text-3xl font-semibold font-[Georgia,serif] text-[#16332B]">
                                {doctors.length}+
                            </h2>
                            <p className="text-[#16332B]/60 mt-2 text-sm">Specialist Doctors</p>
                        </div>

                        <div className="bg-white rounded-2xl p-7 border border-[#E4DFD3]">
                            <h2 className="text-3xl font-semibold font-[Georgia,serif] text-[#3E7C59]">
                                {appointments.length}
                            </h2>
                            <p className="text-[#16332B]/60 mt-2 text-sm">Your Appointments</p>
                        </div>

                        <div className="bg-white rounded-2xl p-7 border border-[#E4DFD3]">
                            <h2 className="text-3xl font-semibold font-[Georgia,serif] text-[#B5562C]">
                                24/7
                            </h2>
                            <p className="text-[#16332B]/60 mt-2 text-sm">Emergency Service</p>
                        </div>

                        <div className="bg-white rounded-2xl p-7 border border-[#E4DFD3]">
                            <h2 className="text-3xl font-semibold font-[Georgia,serif] text-[#8B6BAE]">
                                {orders.length}
                            </h2>
                            <p className="text-[#16332B]/60 mt-2 text-sm">Medicine Orders</p>
                        </div>

                    </div>
                </section>

                {/* SERVICES */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-24">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-4xl font-normal">Our services</h2>
                            <p className="text-[#16332B]/60 mt-3 font-[system-ui,sans-serif]">
                                Everything you need for better healthcare, in one place.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {[
                            {
                                href: "/patient/doctors",
                                Icon: Stethoscope,
                                title: "Doctors",
                                desc: "Book appointments with trusted specialists.",
                                accent: "#16332B",
                            },
                            {
                                href: "/patient/products",
                                Icon: Pill,
                                title: "Medicines",
                                desc: "Order medicines at affordable prices.",
                                accent: "#3E7C59",
                            },
                            {
                                href: "/patient/ambulance",
                                Icon: Ambulance,
                                title: "Ambulance",
                                desc: "Emergency ambulance booking, anytime.",
                                accent: "#B5562C",
                            },
                            {
                                href: "/patient/appointments",
                                Icon: CalendarCheck,
                                title: "My Appointments",
                                desc: "View and manage all your visits.",
                                accent: "#8B6BAE",
                            },
                        ].map((s) => (
                            <a
                                key={s.title}
                                href={s.href}
                                className="bg-white rounded-2xl p-8 border border-[#E4DFD3] hover:border-[#16332B]/30 hover:shadow-md transition"
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${s.accent}14` }}
                                >
                                    <s.Icon size={28} color={s.accent} />
                                </div>

                                <h3 className="text-xl font-medium mt-6">{s.title}</h3>

                                <p className="text-[#16332B]/60 mt-2 font-[system-ui,sans-serif] text-[15px] leading-6">
                                    {s.desc}
                                </p>
                            </a>
                        ))}

                    </div>
                </section>

                {/* SPECIALITIES */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-24">
                    <h2 className="text-4xl font-normal mb-10">
                        Popular Specialities
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                        {[
  {
    title: "Cardiology",
    Icon: HeartPulse,
    color: "text-red-500",
  },
  {
    title: "Neurology",
    Icon: Brain,
    color: "text-pink-500",
  },
  {
    title: "Orthopedic",
    Icon: Bone,
    color: "text-amber-500",
  },
  {
    title: "Ophthalmology",
    Icon: Eye,
    color: "text-blue-500",
  },
  {
    title: "General Medicine",
    Icon: Stethoscope,
    color: "text-green-600",
  },
  {
    title: "Pediatrics",
    Icon: Baby,
    color: "text-yellow-500",
  },
].map((item) => (
                            <button
                                key={item.title}
                                className="flex items-center justify-center gap-2 bg-white border border-[#E4DFD3] rounded-2xl py-6 px-5 hover:shadow-md hover:border-[#16332B] transition-all"
                            >
                                <item.Icon
                                    size={20}
                                    className={item.color}
                                    strokeWidth={2.2}
                                />

                                <span className="text-[17px] font-medium text-[#16332B]">
                                    {item.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* FEATURED DOCTORS */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-24">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-4xl font-normal">Featured doctors</h2>
                            <p className="text-[#16332B]/60 mt-3 font-[system-ui,sans-serif]">
                                Meet our experienced specialists.
                            </p>
                        </div>

                        <a
                            href="/patient/doctors"
                            className="text-[#16332B] font-medium font-[system-ui,sans-serif] hover:underline whitespace-nowrap"
                        >
                            View all →
                        </a>
                    </div>

                    {filteredDoctors.length === 0 ? (
                        <div className="bg-white border border-[#E4DFD3] rounded-2xl py-16 text-center font-[system-ui,sans-serif] text-[#16332B]/60">
                            No doctors found.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredDoctors.slice(0, 4).map((doctor) => (
                                <div
                                    key={doctor.id}
                                    className="bg-white rounded-2xl border border-[#E4DFD3] overflow-hidden hover:shadow-md transition"
                                >
                                    <img
                                        src={
                                            doctor.imageUrl
                                                ? `http://localhost:5008${doctor.imageUrl}`
                                                : getStockImage(doctor.id)
                                        }
                                        className="w-full h-56 object-cover"
                                        alt={displayDoctorName(doctor.name)}
                                    />

                                    <div className="p-6 font-[system-ui,sans-serif]">
                                        <h3 className="text-lg font-semibold font-[Georgia,serif]">
                                            {displayDoctorName(doctor.name)}
                                        </h3>

                                        <p className="text-[#16332B]/60 mt-1 text-sm">
                                            {doctor.specialization}
                                        </p>

                                        <div className="flex items-center mt-3 text-sm">
                                            <span className="text-[#B5562C]">★★★★★</span>
                                            <span className="ml-2 text-[#16332B]/50">(4.9)</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (!token) {
                                                    navigate("/login");
                                                    return;
                                                }

                                                navigate(`/patient/bookdoctor?doctorId=${doctor.id}`);
                                            }}
                                            className="block w-full mt-5 bg-[#16332B] text-white text-center py-3 rounded-full font-medium hover:bg-[#0F231D] transition"
                                        >
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* UPCOMING APPOINTMENT */}
                {token && (
                    <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-24">
                        <div className="bg-white rounded-2xl border border-[#E4DFD3] p-8 lg:p-10">

                            <div className="flex justify-between items-center mb-7">
                                <h2 className="text-2xl font-medium">Upcoming appointment</h2>
                                <a
                                    href="/patient/appointments"
                                    className="text-[#16332B] font-medium font-[system-ui,sans-serif] hover:underline"
                                >
                                    View all
                                </a>
                            </div>

                            {appointments.length === 0 ? (
                                <div className="text-center py-12 font-[system-ui,sans-serif]">
                                    <h3 className="text-lg font-medium">No upcoming appointment</h3>
                                    <p className="text-[#16332B]/60 mt-2">
                                        Book your first consultation today.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6 font-[system-ui,sans-serif]">
                                    {appointments.slice(0, 2).map((a) => (
                                        <div
                                            key={a.id}
                                            className="border border-[#E4DFD3] rounded-2xl p-6 hover:border-[#16332B]/40 transition"
                                        >
                                            <h3 className="text-lg font-semibold font-[Georgia,serif]">
                                                {displayDoctorName(a.doctorName) || a.doctorId}
                                            </h3>

                                            <p className="text-[#16332B]/60 mt-2 text-sm">
                                                {new Date(a.appointmentTime).toLocaleString("en-IN", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </p>

                                            <span className="inline-block mt-4 bg-[#3E7C59]/10 text-[#3E7C59] px-4 py-1.5 rounded-full text-sm font-medium">
                                                {a.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* HEALTH TIP */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-24">
                    <div className="rounded-3xl bg-[#3E7C59] text-white p-10 lg:p-12 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
                        <div>
                            <p className="font-[system-ui,sans-serif] text-sm uppercase tracking-wide text-white/70 mb-3">
                                Daily health tip
                            </p>
                            <h2 className="text-3xl lg:text-4xl font-normal leading-snug">
                                Drink plenty of water, sleep at least
                                8 hours, and keep moving.
                            </h2>
                        </div>
                    </div>
                </section>

                {/* EMERGENCY */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-12">
                    <div className="rounded-3xl bg-[#991B1B] p-10 lg:p-12 text-white flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-normal">
                                Need emergency assistance?
                            </h2>
                            <p className="mt-3 text-white/80 font-[system-ui,sans-serif]">
                                Our ambulance network is available 24×7.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                token
                                    ? navigate("/patient/ambulance")
                                    : navigate("/login")
                            }
                            className="bg-white text-[#991B1B] px-8 py-4 rounded-full font-medium hover:scale-[1.03] transition"
                        >
                            Book Ambulance
                        </button>
                    </div>
                </section>


                {/* RECENT ORDERS */}
                {token && (
                    <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-24">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-4xl font-normal">Recent orders</h2>
                            <a
                                href="/patient/orders"
                                className="text-[#16332B] font-medium font-[system-ui,sans-serif] hover:underline"
                            >
                                View all →
                            </a>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#E4DFD3] overflow-hidden font-[system-ui,sans-serif]">
                            {orders.length === 0 ? (
                                <div className="py-14 text-center text-[#16332B]/60">
                                    No medicine orders found.
                                </div>
                            ) : (
                                <table className="w-full text-[15px]">
                                    <thead className="bg-[#FAF8F3]">
                                        <tr>
                                            <th className="text-left p-5 font-medium">Medicine</th>
                                            <th className="text-left p-5 font-medium">Date</th>
                                            <th className="text-left p-5 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.slice(0, 5).map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-t border-[#E4DFD3] hover:bg-[#FAF8F3]/60"
                                            >
                                                <td className="p-5">{order.productName}</td>
                                                <td className="p-5">
                                                    {new Date(order.orderDate).toLocaleDateString("en-IN")}
                                                </td>
                                                <td className="p-5">
                                                    <span className="bg-[#3E7C59]/10 text-[#3E7C59] px-3 py-1 rounded-full">
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                )}

                {/* TESTIMONIALS */}
                <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-24">
                    <h2 className="text-4xl font-normal text-center mb-12">
                        What our patients say
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Rahul Sharma",
                                review: "Excellent doctors and smooth appointment booking.",
                            },
                            {
                                name: "Priya Das",
                                review: "Medicine delivery was fast and affordable.",
                            },
                            {
                                name: "Ankit Roy",
                                review: "Ambulance reached within minutes during emergency.",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl border border-[#E4DFD3] p-8 font-[system-ui,sans-serif]"
                            >
                                <div className="text-[#B5562C] text-lg">★★★★★</div>

                                <p className="text-[#16332B]/75 mt-5 leading-7">
                                    "{item.review}"
                                </p>

                                <h3 className="font-semibold mt-6 font-[Georgia,serif]">
                                    {item.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="max-w-4xl mx-auto px-6 lg:px-10 mt-24">
                    <h2 className="text-4xl font-normal text-center mb-10">
                        Frequently asked questions
                    </h2>

                    <div className="space-y-4 font-[system-ui,sans-serif]">
                        {[
                            {
                                q: "How do I book an appointment?",
                                a: "Select your preferred doctor and choose your available time slot.",
                            },
                            {
                                q: "Can I order medicines online?",
                                a: "Yes, medicines can be ordered directly from our pharmacy.",
                            },
                            {
                                q: "Is ambulance service available 24×7?",
                                a: "Yes, emergency ambulance service is available all day.",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-white border border-[#E4DFD3] rounded-2xl p-6"
                            >
                                <h3 className="font-medium text-lg font-[Georgia,serif]">
                                    {item.q}
                                </h3>
                                <p className="text-[#16332B]/65 mt-3 leading-7">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FOOTER */}
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
            <Chatbot />
        </>
    );

}