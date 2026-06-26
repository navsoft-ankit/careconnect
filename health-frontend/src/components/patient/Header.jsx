import { useEffect, useState } from "react";

export default function Header() {
  const [name, setName] = useState("Patient");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b">

      {/* Left side */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome, {name} 👋
        </h2>

        <p className="text-sm text-gray-500">
          Manage your health, appointments and orders
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search doctors, medicines..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Notification */}
        <button className="relative text-xl">
          🔔
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {name.charAt(0).toUpperCase()}
        </div>

      </div>
    </header>
  );
}