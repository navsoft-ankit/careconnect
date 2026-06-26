import { NavLink } from "react-router-dom";

const links = [
  {
    to: "/patient",
    label: "Dashboard",
    icon: "🏠",
    end: true,
  },
  {
    to: "/patient/doctors",
    label: "Find Doctors",
    icon: "🩺",
  },
  {
    to: "/patient/products",
    label: "Pharmacy",
    icon: "💊",
  },
  {
    to: "/patient/appointments",
    label: "My Appointments",
    icon: "📅",
  },
  {
    to: "/patient/orders",
    label: "My Orders",
    icon: "📦",
  },
  {
    to: "/patient/ambulance",
    label: "Book Ambulance",
    icon: "🚑",
  },
  {
    to: "/patient/profile",
    label: "My Profile",
    icon: "👤",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#0B1736] text-white flex flex-col shadow-xl">

      {/* Logo */}
      <div className="px-6 py-7 border-b border-blue-900">
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-bold">
            H
          </div>

          <div>
            <h1 className="text-xl font-bold">
              HealthCare
            </h1>

            <p className="text-sm text-blue-300">
              Patient Portal
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">

        <nav className="space-y-2">

          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-blue-100 hover:bg-[#16234A]"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>

              <span className="font-medium">
                {item.label}
              </span>
            </NavLink>
          ))}

        </nav>

      </div>

      {/* Bottom */}
      <div className="border-t border-blue-900 p-4">

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login";
          }}
          className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-3 font-semibold transition"
        >
          Logout
        </button>

      </div>

    </aside>
  );
}