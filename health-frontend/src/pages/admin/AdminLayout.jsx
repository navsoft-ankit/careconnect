import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <aside
        style={{
          width: "220px",
          background: "#1e293b",
          color: "#fff",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <h2>Admin</h2>

        <p><Link to="/admin" style={{ color: "#fff" }}>Dashboard</Link></p>

        <p><Link to="/admin/doctors" style={{ color: "#fff" }}>Doctors</Link></p>

        <p><Link to="/admin/products" style={{ color: "#fff" }}>Products</Link></p>

        <p><Link to="/admin/appointments" style={{ color: "#fff" }}>Appointments</Link></p>

        <p><Link to="/admin/ambulances" style={{ color: "#fff" }}>Ambulances</Link></p>
      </aside>

      <main style={{ flex: 1, padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}