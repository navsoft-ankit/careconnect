import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddDoctor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    hospitalName: "",
    fee: 0,
    about: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      await api.post("/admin/doctor", form);
      alert("Doctor created successfully");
      navigate("/admin/doctors");
    } catch (err) {
      alert(err.response?.data || "Error");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">

      <h2 className="text-2xl font-bold mb-4">Add Doctor</h2>

      <input name="fullName" onChange={handleChange} placeholder="Full Name" className="input" />
      <input name="email" onChange={handleChange} placeholder="Email" className="input" />
      <input name="password" type="password" onChange={handleChange} placeholder="Password" className="input" />

      <input name="specialization" onChange={handleChange} placeholder="Specialization" className="input" />
      <input name="hospitalName" onChange={handleChange} placeholder="Hospital Name" className="input" />
      <input name="fee" type="number" onChange={handleChange} placeholder="Fee" className="input" />

      <textarea name="about" onChange={handleChange} placeholder="About Doctor" className="input" />

      <button
        onClick={submit}
        className="bg-green-600 text-white px-4 py-2 mt-3 w-full"
      >
        Create Doctor
      </button>

    </div>
  );
}