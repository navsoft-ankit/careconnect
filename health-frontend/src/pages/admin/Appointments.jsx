import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await api.get("/admin/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      await api.put(`/admin/appointment/cancel/${id}`);
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full min-h-screen bg-gray-100">
        <Navbar />

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Appointments</h2>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((a) => (
                      <tr
                        key={a.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">{a.id}</td>
                        <td className="p-3">{a.patientName}</td>
                        <td className="p-3">{a.doctorName}</td>
                        <td className="p-3">{a.status}</td>
                        <td className="p-3">
                          {new Date(a.bookedAt).toLocaleString()}
                        </td>

                        <td className="p-3">
                          {a.status !== "Cancelled" && (
                            <button
                              onClick={() => cancelAppointment(a.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center p-5"
                      >
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}