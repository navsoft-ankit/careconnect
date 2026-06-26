import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Ambulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    driverName: "",
    email: "",
    password: "",
    driverPhone: "",
    vehicleNumber: ""
  });

  useEffect(() => {
    loadAmbulances();
  }, []);

  const loadAmbulances = async () => {
    try {
      const res = await api.get("/admin/ambulances");
      setAmbulances(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load ambulances");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const createAmbulance = async () => {
    try {
      await api.post("/admin/ambulance", form);

      alert("Ambulance Driver Created Successfully");

      setForm({
        driverName: "",
        email: "",
        password: "",
        driverPhone: "",
        vehicleNumber: ""
      });

      setShowForm(false);
      loadAmbulances();

    } catch (err) {
      alert(err.response?.data || "Create Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this ambulance?")) return;

    await api.delete(`/admin/ambulance/${id}`);

    loadAmbulances();
  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-64 w-full min-h-screen bg-gray-100">

        <Navbar />

        <div className="p-6">

          {/* HEADER */}

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-3xl font-bold">
              Ambulance Drivers
            </h2>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-5 py-2 rounded"
            >
              {showForm ? "Close Form" : "+ Create Ambulance"}
            </button>

          </div>

          {/* CREATE FORM */}

          {showForm && (

            <div className="bg-white shadow rounded p-5 mb-6">

              <input
                className="border p-2 rounded w-full mb-3"
                placeholder="Driver Name"
                name="driverName"
                value={form.driverName}
                onChange={handleChange}
              />

              <input
                className="border p-2 rounded w-full mb-3"
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />

              <input
                type="password"
                className="border p-2 rounded w-full mb-3"
                placeholder="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />

              <input
                className="border p-2 rounded w-full mb-3"
                placeholder="Driver Phone"
                name="driverPhone"
                value={form.driverPhone}
                onChange={handleChange}
              />

              <input
                className="border p-2 rounded w-full mb-3"
                placeholder="Vehicle Number"
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
              />

              <button
                onClick={createAmbulance}
                className="bg-green-600 text-white w-full py-2 rounded"
              >
                Create Ambulance
              </button>

            </div>

          )}

          {/* LIST */}

          <div className="bg-white rounded shadow overflow-x-auto">

            <table className="w-full">

              <thead className="bg-blue-700 text-white">

                <tr>

                  <th className="p-3">ID</th>

                  <th className="p-3">Driver</th>

                  <th className="p-3">Email</th>

                  <th className="p-3">Phone</th>

                  <th className="p-3">Vehicle</th>

                  <th className="p-3">Action</th>

                </tr>

              </thead>

              <tbody>

                {ambulances.length > 0 ? (

                  ambulances.map((a) => (

                    <tr
                      key={a.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-3">{a.id}</td>

                      <td className="p-3">{a.driverName}</td>

                      <td className="p-3">{a.email}</td>

                      <td className="p-3">{a.driverPhone}</td>

                      <td className="p-3">{a.vehicleNumber}</td>

                      <td className="p-3">

                        <button
                          onClick={() => remove(a.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center p-5"
                    >
                      No Ambulance Driver Found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}