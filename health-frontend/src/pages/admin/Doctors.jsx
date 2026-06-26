import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    hospitalName: "",
    fee: "",
    about: ""
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    const res = await api.get("/admin/doctors");
    setDoctors(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createDoctor = async () => {
    try {
      await api.post("/admin/doctor", form);
      alert("Doctor created");

      setForm({
        fullName: "",
        email: "",
        password: "",
        specialization: "",
        hospitalName: "",
        fee: "",
        about: ""
      });

      setShowForm(false);
      loadDoctors();

    } catch (err) {
      alert(err.response?.data || "Error creating doctor");
    }
  };

  const remove = async (id) => {
    await api.delete(`/admin/doctor/${id}`);
    setDoctors(doctors.filter(d => d.id !== id));
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Doctors</h2>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showForm ? "Close Form" : "+ Create Doctor"}
            </button>
          </div>

          {/* CREATE DOCTOR FORM */}
          {showForm && (
            <div className="bg-white p-4 mb-6 shadow rounded">

              <input name="fullName" onChange={handleChange} placeholder="Full Name" className="input w-full mb-2" />
              <input name="email" onChange={handleChange} placeholder="Email" className="input w-full mb-2" />
              <input name="password" type="password" onChange={handleChange} placeholder="Password" className="input w-full mb-2" />

              <input name="specialization" onChange={handleChange} placeholder="Specialization" className="input w-full mb-2" />
              <input name="hospitalName" onChange={handleChange} placeholder="Hospital Name" className="input w-full mb-2" />
              <input name="fee" onChange={handleChange} placeholder="Fee" className="input w-full mb-2" />

              <textarea name="about" onChange={handleChange} placeholder="About" className="input w-full mb-2" />

              <button
                onClick={createDoctor}
                className="bg-green-600 text-white px-4 py-2 w-full"
              >
                Create Doctor
              </button>
            </div>
          )}

          {/* DOCTORS LIST */}
          <div className="grid md:grid-cols-3 gap-3">
            {doctors.map(d => (
              <div key={d.id} className="bg-white p-4 shadow rounded">

                <h3 className="font-bold">{d.doctorName}</h3>
                <p>{d.specialization}</p>
                <p>{d.hospitalName}</p>
                <p>₹{d.fee}</p>

                <button
                  onClick={() => remove(d.id)}
                  className="bg-red-500 text-white px-3 py-1 mt-2"
                >
                  Delete
                </button>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}