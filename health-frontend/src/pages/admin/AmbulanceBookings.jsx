import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function AmbulanceBookings() {

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/admin/ambulance-bookings");
    setBookings(res.data);
  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-64 w-full min-h-screen bg-gray-100">

        <Navbar />

        <div className="p-6">

          <h2 className="text-3xl font-bold mb-6">
            Ambulance Bookings
          </h2>

          <div className="bg-white rounded shadow overflow-x-auto">

            <table className="w-full">

              <thead className="bg-green-700 text-white">

                <tr>

                  <th className="p-3">Patient</th>

                  <th className="p-3">Email</th>

                  <th className="p-3">Driver</th>

                  <th className="p-3">Vehicle</th>

                  <th className="p-3">Pickup</th>

                  <th className="p-3">Destination</th>

                  <th className="p-3">Status</th>

                  <th className="p-3">Date</th>

                </tr>

              </thead>

              <tbody>

                {bookings.map(b => (

                  <tr key={b.bookingId} className="border-b">

                    <td className="p-3">{b.patientName}</td>

                    <td className="p-3">{b.patientEmail}</td>

                    <td className="p-3">{b.driverName}</td>

                    <td className="p-3">{b.vehicleNumber}</td>

                    <td className="p-3">{b.pickupLocation}</td>

                    <td className="p-3">{b.destinationLocation}</td>

                    <td className="p-3">{b.status}</td>

                    <td className="p-3">
                      {new Date(b.requestTime).toLocaleString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}